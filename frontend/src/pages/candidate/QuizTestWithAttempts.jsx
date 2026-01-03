import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Clock, CheckCircle, Circle, AlertCircle, Trophy, Target, Award, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import sparrowLogo from "../../assets/sparrowlogo.png";
import { testAttemptService, progressService } from '../../services/testAttemptService';

export default function QuizTestWithAttempts({ streams }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [candidateData, setCandidateData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes timer
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [visitedQuestions, setVisitedQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [progressSaved, setProgressSaved] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const storedData = JSON.parse(sessionStorage.getItem("candidateData"));
    
    // Get attemptInfo from navigation state or session storage
    const attemptInfo = location.state?.attemptInfo || JSON.parse(sessionStorage.getItem("currentAttempt"));
    
    console.log('🔍 QUIZ COMPONENT - Debug info:', {
        locationState: location.state,
        sessionStorageAttempt: sessionStorage.getItem("currentAttempt"),
        attemptInfo: attemptInfo,
        storedData: storedData
    });

    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const videoRef = useRef(null);

    useEffect(() => {
        console.log('🔄 USEEFFECT - Setting candidateData:', { attemptInfo, storedData });
        
        if (attemptInfo) {
            const newCandidateData = {
                id: attemptInfo.candidateId,
                positionId: attemptInfo.positionId,
                attemptId: attemptInfo.attemptId,
                attemptNumber: attemptInfo.attemptNumber
            };
            console.log('✅ USEEFFECT - Setting candidateData from attemptInfo:', newCandidateData);
            setCandidateData(newCandidateData);
            loadExistingProgress();
        } else if (storedData) {
            console.log('✅ USEEFFECT - Setting candidateData from storedData:', storedData);
            setCandidateData(storedData);
        } else {
            console.log('❌ USEEFFECT - No attemptInfo or storedData available');
        }
        loadQuestions();
    }, [attemptInfo, storedData]);

    // Set up video element to display camera stream
    useEffect(() => {
        if (streams?.camStream && videoRef.current) {
            videoRef.current.srcObject = streams.camStream;
            videoRef.current.play().catch(err => console.error('Error playing video:', err));
        }
        return () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [streams]);

    useEffect(() => {
        if (timeLeft <= 0) {
            console.log("Time completed - auto submitting");
            handleSubmit(true);
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            // Use questionsAskedToCandidate from storedData if available, otherwise default to 10
            const questionCount = storedData?.questionsAskedToCandidate || 10;
            const candidateId = candidateData?.id || storedData?.id || null;
            const url = candidateId 
                ? `http://localhost:5000/api/test/questions/random?positionId=${candidateData?.positionId}&count=${questionCount}&candidateId=${candidateId}`
                : `http://localhost:5000/api/test/questions/random?positionId=${candidateData?.positionId}&count=${questionCount}`;
            const response = await fetch(url);
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error loading questions:', error);
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const loadExistingProgress = async () => {
        if (!attemptInfo?.attemptId) return;
        
        try {
            const response = await progressService.getProgress(attemptInfo.attemptId);
            if (response.data) {
                const progress = response.data;
                setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
                setTimeLeft(progress.timeLeft || 60 * 60);
                
                // Restore answers
                const restoredAnswers = {};
                progress.progress.forEach(q => {
                    if (q.selectedOption) {
                        restoredAnswers[q.questionId] = q.selectedOption;
                    }
                });
                setAnswers(restoredAnswers);
                
                // Restore visited questions
                const visited = progress.progress
                    .map((q, index) => q.status === 2 ? index : null)
                    .filter(index => index !== null);
                setVisitedQuestions(visited);
                
                console.log('Progress restored:', progress);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    };

    const stopAllStreams = () => {
        if (streams) {
            const { screenStream, camStream } = streams;
            screenStream?.getTracks().forEach(track => track.stop());
            camStream?.getTracks().forEach(track => track.stop());
            console.log("All media streams stopped.");
        }

        if (mediaRecorderRef.current) {
            try {
                mediaRecorderRef.current.stop();
                console.log("MediaRecorder stopped.");
            } catch (err) {
                console.warn("MediaRecorder already stopped:", err);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const startRecording = () => {
        if (!streams) return;
        const { screenStream, camStream } = streams;
        const canvas = document.createElement("canvas");
        const screenVideo = document.createElement("video");
        const camVideo = document.createElement("video");
        screenVideo.srcObject = screenStream;
        camVideo.srcObject = camStream;
        screenVideo.play();
        camVideo.play();

        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");

        function drawFrame() {
            ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

            // Draw camera overlay - reduced size to avoid blocking content
            const camWidth = canvas.width / 10; // Reduced to /10 (approximately 128px for 1280px canvas)
            const camHeight = (camWidth * 9) / 16;
            const camX = canvas.width - camWidth - 20;
            const camY = canvas.height - camHeight - 20;

            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect(camX - 5, camY - 5, camWidth + 10, camHeight + 10);

            const radius = 20;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(camX + radius, camY);
            ctx.lineTo(camX + camWidth - radius, camY);
            ctx.quadraticCurveTo(camX + camWidth, camY, camX + camWidth, camY + radius);
            ctx.lineTo(camX + camWidth, camY + camHeight - radius);
            ctx.quadraticCurveTo(camX + camWidth, camY + camHeight, camX + camWidth - radius, camY + camHeight);
            ctx.lineTo(camX + radius, camY + camHeight);
            ctx.quadraticCurveTo(camX, camY + camHeight, camX, camY + camHeight - radius);
            ctx.lineTo(camX, camY + radius);
            ctx.quadraticCurveTo(camX, camY, camX + radius, camY);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(camVideo, camX, camY, camWidth, camHeight);
            ctx.restore();

            requestAnimationFrame(drawFrame);
        }

        drawFrame();

        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.start(1000);
        mediaRecorderRef.current = mediaRecorder;
    };

    const stopRecordingAndDownload = async () => {
        return new Promise((resolve) => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    resolve(blob);
                };
                mediaRecorderRef.current.stop();
            } else {
                resolve(null);
            }
        });
    };

    const handleSubmit = async (auto = false) => {
        if (!auto && Object.keys(answers).length !== questions.length) {
            setError("Please answer all questions before submitting!");
            return;
        }
        
        if (!candidateData?.id || !candidateData?.positionId) {
            console.error("Missing candidate data:", candidateData);
            setError("Candidate data is missing. Please login again.");
            return;
        }
        
        console.log(auto ? "Auto-submitting after timer ended" : "Submitting manually");
        console.log("Candidate data:", candidateData);
        console.log("Answers:", answers);
        
        try {
            setSubmitting(true);
            setError(null);
            
            const videoBlob = await stopRecordingAndDownload();
            const detailedAnswers = questions.map((q, index) => {
                const candidateAnswer = answers[q._id];
                let status = 0; // default untouched
                if (candidateAnswer) status = 1; // answered
                else if (visitedQuestions.includes(index)) status = 2; // visited
                return {
                    questionId: q._id,
                    selectedOption: candidateAnswer || null,
                    status
                };
            });

            const testData = {
                answers: detailedAnswers,
                timeTakenInSeconds: 60 * 60 - timeLeft,
                timeTakenFormatted: formatTime(60 * 60 - timeLeft),
                recording: videoBlob
            };

            const attemptInfo = {
                candidateId: candidateData.id,
                positionId: candidateData.positionId,
                attemptId: candidateData.attemptId
            };

            const response = await testAttemptService.submitTestWithAttempt(testData, attemptInfo);
            console.log("Submission response:", response);
            
            if (response.message === "Test submitted successfully") {
                stopAllStreams();
                navigate('/thank-you', { 
                    state: { 
                        score: response.data.score,
                        attemptNumber: candidateData.attemptNumber,
                        totalQuestions: response.data.totalQuestions
                    }
                });
            }
        } catch (err) {
            console.error("Error submitting test:", err);
            setError(`Test submission failed: ${err.response?.data?.message || err.message}`);
            stopAllStreams();
        } finally {
            setSubmitting(false);
        }
    };

    const saveProgressToBackend = async (updatedAnswers = answers, updatedIndex = currentQuestionIndex + 1) => {
        console.log('💾 SAVE PROGRESS - candidateData:', candidateData);
        console.log('💾 SAVE PROGRESS - Validation check:', {
            hasId: !!candidateData?.id,
            hasPositionId: !!candidateData?.positionId,
            hasAttemptId: !!candidateData?.attemptId
        });
        
        // If we don't have attemptId, try to create a test attempt first
        if (!candidateData?.attemptId && candidateData?.id && candidateData?.positionId) {
            console.log('🔄 SAVE PROGRESS - No attemptId found, creating test attempt...');
            try {
                const attemptResponse = await testAttemptService.createTestAttempt(
                    candidateData.id, 
                    candidateData.positionId
                );
                console.log('✅ SAVE PROGRESS - Test attempt created:', attemptResponse);
                
                // Update candidateData with the new attempt info
                const updatedCandidateData = {
                    ...candidateData,
                    attemptId: attemptResponse.data.attemptId,
                    attemptNumber: attemptResponse.data.attemptNumber
                };
                setCandidateData(updatedCandidateData);
                
                // Use the updated data for the progress payload
                const progressPayload = {
                    candidateId: updatedCandidateData.id,
                    positionId: updatedCandidateData.positionId,
                    attemptId: updatedCandidateData.attemptId,
                    attemptNumber: updatedCandidateData.attemptNumber,
                    progress: {
                        currentQuestionIndex: updatedIndex,
                        timeLeft,
                        questions: questions.map((q, index) => {
                            const selectedOption = updatedAnswers[q._id] || null;
                            const selectedOptionText = q.options.find(opt => opt._id === selectedOption)?.optionText || null;
                            let status = 0; // default unvisited
                            if (selectedOption) status = 1;
                            else if (visitedQuestions.includes(index)) status = 2;
                            return {
                                questionId: q._id,
                                question: q.questionText,
                                options: q.options,
                                selectedOption,
                                selectedOptionText,
                                status
                            };
                        }),
                    }
                };
                
                await progressService.saveProgress(progressPayload);
                setProgressSaved(true);
                setTimeout(() => setProgressSaved(false), 2000);
                console.log("✅ Progress auto-saved to backend with new attempt tracking.");
                return;
            } catch (err) {
                console.error("❌ Error creating test attempt:", err);
                return;
            }
        }
        
        if (!candidateData?.id || !candidateData?.positionId || !candidateData?.attemptId) {
            console.log('❌ SAVE PROGRESS - Missing required candidateData, returning early');
            return;
        }
        
        try {
            const progressPayload = {
                candidateId: candidateData.id,
                positionId: candidateData.positionId,
                attemptId: candidateData.attemptId,
                attemptNumber: candidateData.attemptNumber,
                progress: {
                    currentQuestionIndex: updatedIndex,
                    timeLeft,
                    questions: questions.map((q, index) => {
                        const selectedOption = updatedAnswers[q._id] || null;
                        const selectedOptionText = q.options.find(opt => opt._id === selectedOption)?.optionText || null;
                        let status = 0; // default unvisited
                        if (selectedOption) status = 1;
                        else if (visitedQuestions.includes(index)) status = 2;
                        return {
                            questionId: q._id,
                            question: q.questionText,
                            options: q.options,
                            selectedOption,
                            selectedOptionText,
                            status
                        };
                    }),
                }
            };
            
            await progressService.saveProgress(progressPayload);
            setProgressSaved(true);
            setTimeout(() => setProgressSaved(false), 2000);
            console.log("✅ Progress auto-saved to backend with attempt tracking.");
        } catch (err) {
            console.error("❌ Error saving progress:", err);
        }
    };

    const handleChange = (questionId, optionId) => {
        setAnswers(prev => {
            const updated = { ...prev, [questionId]: optionId };
            // Auto-save progress
            saveProgressToBackend(updated, currentQuestionIndex);
            return updated;
        });
        setCurrentQuestionIndex(prev =>
            prev < questions.length - 1 ? prev + 1 : prev
        );
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            saveProgressToBackend();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            saveProgressToBackend();
        }
    };

    const handleQuestionClick = (index) => {
        setCurrentQuestionIndex(index);
        if (!visitedQuestions.includes(index)) {
            setVisitedQuestions(prev => [...prev, index]);
        }
        saveProgressToBackend();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error && !submitting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button 
                            onClick={() => navigate('/candidate-dashboard')} 
                            className="w-full mt-4"
                        >
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <img src={sparrowLogo} alt="Sparrow Logo" className="h-8 w-8" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Online Assessment</h1>
                                {candidateData?.attemptNumber && (
                                    <p className="text-sm text-gray-600">
                                        Attempt #{candidateData.attemptNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {progressSaved && (
                                <Badge variant="outline" className="text-green-600">
                                    Progress Saved
                                </Badge>
                            )}
                            <div className="flex items-center space-x-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Question Navigation */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((_, index) => {
                                        const isAnswered = answers[questions[index]._id];
                                        const isVisited = visitedQuestions.includes(index);
                                        const isCurrent = index === currentQuestionIndex;
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleQuestionClick(index)}
                                                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                                                    isCurrent
                                                        ? 'bg-blue-600 text-white'
                                                        : isAnswered
                                                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                        : isVisited
                                                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                                                        : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 space-y-2 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
                                        <span>Answered ({answeredCount})</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full"></div>
                                        <span>Visited</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"></div>
                                        <span>Not visited</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Question */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </CardTitle>
                                    <Badge variant="outline">
                                        {Math.round(progress)}% Complete
                                    </Badge>
                                </div>
                                <Progress value={progress} className="mt-2" />
                            </CardHeader>
                            <CardContent>
                                {currentQuestion && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                {currentQuestion.questionText}
                                            </h3>
                                            {currentQuestion.questionImage && (
                                                <img 
                                                    src={currentQuestion.questionImage} 
                                                    alt="Question" 
                                                    className="max-w-full h-auto rounded-lg mb-4"
                                                />
                                            )}
                                        </div>

                                        <RadioGroup
                                            value={answers[currentQuestion._id] || ""}
                                            onValueChange={(value) => handleChange(currentQuestion._id, value)}
                                            className="space-y-3"
                                        >
                                            {currentQuestion.options.map((option) => (
                                                <div key={option._id} className="flex items-start space-x-3">
                                                    <RadioGroupItem 
                                                        value={option._id} 
                                                        id={option._id}
                                                        className="mt-1"
                                                    />
                                                    <label 
                                                        htmlFor={option._id}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium">
                                                                {option.optionText}
                                                            </span>
                                                        </div>
                                                        {option.optionImage && (
                                                            <img 
                                                                src={option.optionImage} 
                                                                alt="Option" 
                                                                className="mt-2 max-w-xs h-auto rounded"
                                                            />
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </RadioGroup>

                                        <div className="flex justify-between pt-6">
                                            <Button
                                                onClick={handlePrevious}
                                                disabled={currentQuestionIndex === 0}
                                                variant="outline"
                                            >
                                                Previous
                                            </Button>
                                            <div className="space-x-2">
                                                {currentQuestionIndex === questions.length - 1 ? (
                                                    <Button
                                                        onClick={() => handleSubmit(false)}
                                                        disabled={submitting || answeredCount !== questions.length}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            'Submit Test'
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button onClick={handleNext}>
                                                        Next
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Camera Video Overlay - Small corner video */}
            {streams?.camStream && (
                <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="rounded-lg border-2 border-white shadow-lg object-cover"
                        style={{ 
                            width: '100px',
                            height: '75px'
                        }}
                    />
                </div>
            )}
        </div>
    );
}

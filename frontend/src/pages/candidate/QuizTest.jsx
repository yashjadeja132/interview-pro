import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Trophy,
  Target,
  Award,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import sparrowLogo from "../../assets/sparrowlogo.png";

export default function QuizTest({ streams }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const candidateDataRef = useRef(null); // Ref to access latest data in timer closure

  const storedData = JSON.parse(sessionStorage.getItem("candidateData"));
  // Use timeforTest from stored data or default to 60 minutes
  const initialTime = storedData?.timeforTest ? storedData.timeforTest * 60 : 60 * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (candidateData) {
      candidateDataRef.current = candidateData;
    }
  }, [candidateData]);

  // Refs for solving stale closure in timer/handleSubmit
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);


  const stopAllStreams = () => {
    if (streams) {
      const { screenStream, camStream } = streams;
      screenStream?.getTracks().forEach((track) => track.stop());
      camStream?.getTracks().forEach((track) => track.stop());
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
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    console.log(timeLeft); // Initial log

    // Check initial state
    if (timeLeftRef.current <= 0) {
      console.log("time is completed");
      handleSubmit(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = prev - 1;
        timeLeftRef.current = newValue; // Keep ref in sync for submission

        if (newValue <= 0) {
          clearInterval(timerId);
          // Use a timeout to break stack and allow state update
          setTimeout(() => handleSubmit(true), 0);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []); // Empty dependency array is now safe because we use refs inside handleSubmit


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
      const camWidth = canvas.width / 4; // Reduced from /2 to /6 (approximately 213px for 1280px canvas)
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
      ctx.quadraticCurveTo(
        camX + camWidth,
        camY,
        camX + camWidth,
        camY + radius
      );
      ctx.lineTo(camX + camWidth, camY + camHeight - radius);
      ctx.quadraticCurveTo(
        camX + camWidth,
        camY + camHeight,
        camX + camWidth - radius,
        camY + camHeight
      );
      ctx.lineTo(camX + radius, camY + camHeight);
      ctx.quadraticCurveTo(
        camX,
        camY + camHeight,
        camX,
        camY + camHeight - radius
      );
      ctx.lineTo(camX, camY + radius);
      ctx.quadraticCurveTo(camX, camY, camX + radius, camY);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(camVideo, camX, camY, camWidth, camHeight);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.strokeRect(camX, camY, camWidth, camHeight);

      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.restore();

      requestAnimationFrame(drawFrame);
    }

    drawFrame();

    const combinedStream = canvas.captureStream(30);
    camStream
      .getAudioTracks()
      .forEach((track) => combinedStream.addTrack(track));

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm; codecs=vp8,opus",
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.start();
  };

  const stopRecordingAndDownload = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(null);
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        resolve(blob);
      };
    });
  };
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // Use questionsAskedToCandidate if available, otherwise default to 20
      const questionCount = candidateData?.questionsAskedToCandidate || 20;
      const candidateId = candidateData?.id || null;
      const url = candidateId
        ? `http://localhost:5000/api/question/random/${candidateData.positionId}?count=${questionCount}&candidateId=${candidateId}`
        : `http://localhost:5000/api/question/random/${candidateData.positionId}?count=${questionCount}`;
      const res = await axios.get(url);
      setQuestions(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "Refreshing or leaving will stop your test. Are you sure?";
  };
  useEffect(() => {
    if (!storedData) {
      return console.error("No candidate data found. Please login again.");
    }
    setCandidateData(storedData);
    if (!sessionStorage.getItem("modalShown")) {
      sessionStorage.setItem("modalShown", "true");
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  useEffect(() => {
    if (!streams) {
      console.log("Screen/Cam access lost. Redirecting...");
      navigate("/thank-you");
    } else {
      startRecording();
    }
    if (!streams) return;
    const handleTrackEnded = () => {
      console.log("Screen or camera sharing stopped! Redirecting...");
      navigate("/thank-you");
    };
    const allTracks = [
      ...streams.screenStream.getTracks(),
      ...streams.camStream.getTracks(),
    ];
    allTracks.forEach((track) =>
      track.addEventListener("ended", handleTrackEnded)
    );
    return () =>
      allTracks.forEach((track) =>
        track.removeEventListener("ended", handleTrackEnded)
      );
  }, [streams]);
  useEffect(() => {
    if (candidateData?.positionId) fetchQuestions();
  }, [candidateData]);

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);


  const handleSubmit = async (auto = false) => {
    // 🔴 KEYBOARD OFF (sabse pehle)
    // keyboardAllowed.current = true;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }

    if (window.__fsChange) {
      document.removeEventListener("fullscreenchange", window.__fsChange);
      window.__fsChange = null;
    }

    window.__fsEnter = null;

    // ============================

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => { });
    }

    // Prevent duplicate submissions
    if (submitting) {
      console.log("Already submitting...");
      return;
    }

    const dataToUse = candidateData || candidateDataRef.current;

    // Use Refs if in auto-mode (stale closure protection)
    // If manual (click), state is fine, but refs are always safer/latest in this component structure
    const currentQuestions = questionsRef.current.length > 0 ? questionsRef.current : questions;
    const currentAnswers = Object.keys(answersRef.current).length > 0 ? answersRef.current : answers;

    // If not auto and not all answered, ask for confirmation
    if (!auto && Object.keys(currentAnswers).length !== currentQuestions.length) {
      const proceed = window.confirm(
        "You have unanswered questions. Do you want to submit anyway?"
      );
      if (!proceed) return;
    }

    try {
      setSubmitting(true); // START LOADING UI


      if (!dataToUse?.id || !dataToUse?.positionId) {
        console.error("Missing candidate data:", dataToUse);
        alert("Candidate data is missing. Please login again.");
        return;
      }

      const finalAnswers = answersRef.current; // Use Ref for latest answers
      const finalQuestions = questionsRef.current; // Use Ref for latest questions
      const finalTimeLeft = timeLeftRef.current;

      console.log(
        auto ? "Auto-submitting after timer ended" : "Submitting manually"
      );
      console.log("Candidate data:", dataToUse);
      console.log("Answers:", finalAnswers);

      const videoBlob = await stopRecordingAndDownload();
      const formdata = new FormData();
      const detailedAnswers = finalQuestions.map((q, index) => {
        const candidateAnswer = finalAnswers[q._id];
        let status = 0; // default untouched
        if (candidateAnswer) status = 1; // answered
        else if (visitedQuestions.includes(index)) status = 2; // visited
        return {
          questionId: q._id,
          selectedOption: candidateAnswer || null,
          status,
        };
      });
      formdata.append("video", videoBlob, "candidate-test.webm");
      formdata.append("candidateId", dataToUse.id);
      formdata.append("positionId", dataToUse.positionId);
      formdata.append("answers", JSON.stringify(detailedAnswers));
      formdata.append("timeTakenInSeconds", 60 * 60 - finalTimeLeft);
      formdata.append("timeTakenFormatted", formatTime(60 * 60 - finalTimeLeft));
      const response = await axios.post(
        `http://localhost:5000/api/test`,
        formdata,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Submission response:", response);
      if (response.status === 200) {
        stopAllStreams();
        navigate("/thank-you");
      }
    } catch (err) {
      console.error("Error submitting test:", err);
      console.error("Error details:", err.response?.data);
      alert(
        `Test submission failed: ${err.response?.data?.message || err.message}`
      );
      stopAllStreams();
    } finally {
      setSubmitting(false);
    }
  };
  const saveProgressToBackend = async (
    updatedAnswers = answers,
    updatedIndex = currentQuestionIndex + 1
  ) => {
    const dataToUse = candidateData || candidateDataRef.current;
    if (!dataToUse?.id || !dataToUse?.positionId) return;
    try {
      const progressPayload = {
        candidateId: dataToUse.id,
        positionId: dataToUse.positionId,
        progress: {
          currentQuestionIndex: updatedIndex,
          timeLeft,
          questions: questions.map((q, index) => {
            const selectedOption = updatedAnswers[q._id] || null;
            const selectedOptionText =
              q.options.find((opt) => opt._id === selectedOption)?.optionText ||
              null;
            let status = 0; // default unvisited
            if (selectedOption) status = 1;
            else if (visitedQuestions.includes(index)) status = 2;
            return {
              questionId: q._id,
              question: q.questionText, // ✨ optional if you want question text in payload
              options: q.options, // ✨ optional, full options array
              selectedOption,
              selectedOptionText, // ✨ added
              status,
            };
          }),
        },
      };
      console.log(progressPayload);
      await axios.post(
        "http://localhost:5000/api/test-progress/save",
        progressPayload
      );
      console.log("✅ Progress auto-saved to backend with text.");
    } catch (err) {
      console.error("❌ Error saving progress:", err);
    }
  };
  // Disable keyboard when component mounts - Block ALL keys including ESC
  useEffect(() => {
    const handleKeyDown = function (event) {
      // Explicitly block ESC key (keyCode 27) and ALL other keys
      const keyCode = event.keyCode || event.which;
      const key = event.key;

      // Block ESC, Windows key, and ALL other keys
      if (
        keyCode === 27 || // ESC key
        keyCode === 91 || // Left Windows key
        keyCode === 92 || // Right Windows key
        key === 'Escape' ||
        key === 'Esc' ||
        key === 'Meta' ||
        true // Block ALL keys
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }

      // Block ALL other keys as well
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    };

    // Use capture phase to catch events early, before they reach other handlers
    const options = { capture: true, passive: false };

    // Add listeners on multiple levels to ensure we catch everything
    document.addEventListener("keydown", handleKeyDown, options);
    window.addEventListener("keydown", handleKeyDown, options);

    if (document.body) {
      document.body.addEventListener("keydown", handleKeyDown, options);
    }

    // Cleanup function to remove listeners when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown, options);
      window.removeEventListener("keydown", handleKeyDown, options);
      if (document.body) {
        document.body.removeEventListener("keydown", handleKeyDown, options);
      }
    };
  }, []); // Run only once when component mounts

  const handleChange = (questionId, optionId) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionId };
      // 🧩 Auto-save progress
      saveProgressToBackend(updated, currentQuestionIndex);
      return updated;
    });
    setCurrentQuestionIndex((prev) =>
      prev < questions.length - 1 ? prev + 1 : prev
    );
  };

  const handleClearAnswer = (questionId) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      // 🧩 Auto-save progress after clearing
      saveProgressToBackend(updated, currentQuestionIndex);
      return updated;
    });
  };

  // 1️⃣ State for restore tracking
  const [progressRestored, setProgressRestored] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null); // 👈 add this
  // 2️⃣ Step 1: Fetch saved progress ek vaar j
  useEffect(() => {
    if (!candidateData?.positionId || progressRestored) return;

    const fetchSavedProgress = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/test-progress/get/${candidateData.id}/${candidateData.positionId}`
        );
        if (res.status === 200 && res.data.data) {
          const savedData = res.data.data;
          const savedProgress = savedData.progress;
          // Save temporarily to reorder later
          setSavedProgress(savedProgress);
          // Restore basic states
          setAnswers((prev) => {
            const restored = {};
            savedProgress.forEach((savedQ) => {
              if (savedQ.selectedOption)
                restored[savedQ.questionId] = savedQ.selectedOption;
            });
            return restored;
          });

          setCurrentQuestionIndex(savedData.currentQuestionIndex || 0);
          setTimeLeft(savedData.timeLeft || 60 * 60);

          const visited = savedProgress
            .map((q, idx) => (q.status === 2 ? idx : null))
            .filter((idx) => idx !== null);
          setVisitedQuestions(visited);

          setProgressRestored(true);
          console.log("✅ Progress restored:", savedData);
        }
      } catch (err) {
        console.warn("⚠️ No saved progress found or error:", err);
      }
    };

    fetchSavedProgress();
  }, [candidateData, progressRestored]);

  // 3️⃣ Step 2: Reorder questions once both are ready
  useEffect(() => {
    if (!questions.length || !savedProgress?.length) return;

    // backend order ni andar questions reorder kar
    const savedOrder = savedProgress.map((q) => q.questionId);
    const ordered = savedOrder
      .map((id) => questions.find((q) => q._id === id))
      .filter(Boolean);

    // Extra questions (je backend ma na hoy)
    const extra = questions.filter((q) => !savedOrder.includes(q._id));

    // Merge both (backend order + extra)
    const finalOrdered = [...ordered, ...extra];
    setQuestions(finalOrdered);
  }, [questions.length, savedProgress]);

  if (!candidateData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Company Logo */}
            <div className="w-20 h-20 bg-white rounded-xl border-2 border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-6 overflow-hidden">
              <img
                src={sparrowLogo}
                alt="Sparrow Logo"
                className="w-full h-full object-contain p-1"
                style={{ imageRendering: "high-quality" }}
              />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Candidate Data
            </h3>
            <p className="text-gray-600">
              Please wait while we prepare your test...
            </p>
          </CardContent>
        </Card>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Company Logo */}
            <div className="w-20 h-20 bg-white rounded-xl border-2 border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-6 overflow-hidden">
              <img
                src={sparrowLogo}
                alt="Sparrow Logo"
                className="w-full h-full object-contain p-1"
                style={{ imageRendering: "high-quality" }}
              />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Questions
            </h3>
            <p className="text-gray-600">
              Preparing your assessment questions...
            </p>
          </CardContent>
        </Card>
      </div>
    );

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Company Logo */}
            <div className="w-20 h-20 bg-white rounded-xl border-2 border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-6 overflow-hidden">
              <img
                src={sparrowLogo}
                alt="Sparrow Logo"
                className="w-full h-full object-contain p-1"
                style={{ imageRendering: "high-quality" }}
              />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Questions Available
            </h3>
            <p className="text-gray-600 mb-6">
              There are no questions available for this position at the moment.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3"
            >
              ← Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const currentQuestion = questions[currentQuestionIndex];
  const handleQuestionClick = (index) => {
    // Add current question to visited if not answered yet
    setVisitedQuestions((prev) => {
      const newVisited = [...prev];
      if (!newVisited.includes(currentQuestionIndex)) {
        newVisited.push(currentQuestionIndex);
      }
      return newVisited;
    });
    // Set new current question
    setCurrentQuestionIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">

      {/* 🟢 FULL SCREEN LOADING OVERLAY FOR SUBMISSION */}
      {submitting && (
        <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Time's Up!</h2>
          <p className="text-lg text-gray-600 max-w-md text-center">
            We are wrapping up your test and saving your answers. This may take a few seconds...
          </p>
          <div className="mt-8 w-64">
            <Progress value={100} className="h-2 animate-pulse" />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-xl border-2 border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={sparrowLogo}
                    alt="Sparrow Logo"
                    className="w-full h-full object-contain p-1"
                    style={{ imageRendering: "high-quality" }}
                  />
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Online Assessment
                </h1>
                <p className="text-gray-600">
                  Complete all questions to finish your test
                </p>
              </div>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${timeLeft <= 10 * 60
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-blue-300 bg-blue-50 text-blue-700"
                }`}
            >
              <Clock className="w-5 h-5" />
              <div className="text-right">
                <div className="text-sm font-medium">Time Remaining</div>
                <div className="text-lg font-bold">{formatTime(timeLeft)}</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Object.keys(answers).length} / {questions.length} answered
              </span>
            </div>
            <Progress
              value={(Object.keys(answers).length / questions.length) * 100}
              className="h-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Question Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
                    <span className="text-gray-700">Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600"></div>
                    <span className="text-gray-700">Current</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
                    <span className="text-gray-700">Visited</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400"></div>
                    <span className="text-gray-700">Unattempted</span>
                  </div>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = answers[q._id];
                    const isCurrent = currentQuestionIndex === index;
                    const isVisited =
                      visitedQuestions.includes(index) && !isAnswered;
                    const notTouched =
                      !visitedQuestions.includes(index) && !isAnswered;

                    let className =
                      "w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all duration-200 hover:scale-105 ";

                    if (isCurrent)
                      className +=
                        "bg-blue-500 border-blue-600 text-white shadow-lg";
                    else if (isAnswered)
                      className += "bg-green-500 border-green-600 text-white";
                    else if (isVisited)
                      className += "bg-red-500 border-red-600 text-white";
                    else
                      className +=
                        "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";

                    return (
                      <button
                        key={q._id}
                        onClick={() => handleQuestionClick(index)}
                        className={className}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            {/* Question Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {currentQuestionIndex + 1}
                    </div>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-200"
                  >
                    {Object.keys(answers).length} answered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Question Text */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                      {currentQuestion.questionText}
                    </h3>
                    {currentQuestion.questionImage && (
                      <div className="mt-4">
                        <img
                          src={currentQuestion.questionImage}
                          alt="Question"
                          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <RadioGroup
                      value={answers[questions[currentQuestionIndex]._id]}
                      onValueChange={(val) =>
                        handleChange(questions[currentQuestionIndex]._id, val)
                      }
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((opt, index) => (
                        <div key={opt._id} className="group">
                          <label
                            htmlFor={opt._id}
                            className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group-hover:shadow-sm"
                          >
                            <RadioGroupItem
                              value={opt._id}
                              id={opt._id}
                              className="w-5 h-5 border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                {opt.optionText && (
                                  <span className="text-gray-900 font-medium">
                                    {opt.optionText}
                                  </span>
                                )}
                              </div>
                              {opt.optionImage && (
                                <div className="mt-2">
                                  <img
                                    src={opt.optionImage}
                                    alt="Option"
                                    className="max-w-xs h-auto rounded-lg border border-gray-200"
                                  />
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* Clear Answer Button */}
                    {answers[questions[currentQuestionIndex]._id] && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() =>
                            handleClearAnswer(
                              questions[currentQuestionIndex]._id
                            )
                          }
                          variant="outline"
                          className="px-6 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Clear Answer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400"
              >
                ← Previous
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {currentQuestionIndex + 1} of {questions.length}
                </span>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Submit Test
                      </div>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex(currentQuestionIndex + 1)
                    }
                    disabled={!answers[questions[currentQuestionIndex]._id]}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
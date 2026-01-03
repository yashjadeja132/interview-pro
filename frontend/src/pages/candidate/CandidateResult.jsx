import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Download, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Trophy, 
  FileText,
  Award,
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { generateCandidateResultPDF, generatePDFFromHTML } from "../../utils/pdfGenerator";

export default function CandidateResult() {
  const { candidateId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = useRef();

  const fetchResult = async () => {
    try {
      const response = await api.get(`/test/${candidateId}`);
      setResult(response.data[0]);
    } catch (error) {
      console.log("Error fetching candidate result:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [candidateId]);

  const generatePDF = async () => {
    if (!result) return;
    
    setIsGeneratingPDF(true);
    try {
      // Prepare candidate data for PDF generation
      const candidateData = {
        candidateName: result.candidateId?.name || 'Unknown',
        candidateEmail: result.candidateId?.email || 'Unknown',
        positionName: result.positionId?.name || 'Unknown',
        score: result.score || 0,
        timeTakenFormatted: result.timeTakenFormatted || 'N/A',
        createdAt: new Date().toISOString()
      };

      // Prepare test results for PDF generation
      const testResults = result.answers || [];

      // Generate PDF using our enhanced generator
      const pdf = await generateCandidateResultPDF(candidateData, testResults);
      const filename = `${candidateData.candidateName.replace(/\s+/g, '_')}_Assessment_Report.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to HTML to PDF conversion
      try {
        const pdf = await generatePDFFromHTML('candidate-result-pdf', filename);
        pdf.save(filename);
      } catch (fallbackError) {
        console.error("Fallback PDF generation failed:", fallbackError);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-16 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );

  if (!result) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Result Found</h2>
        <p className="text-gray-500">The assessment result you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  const { candidateId: candidate, positionId, score, answers } = result;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const correctAnswers = answers.filter(ans => ans.isCorrect).length;
  const totalQuestions = answers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
          <p className="text-gray-600 text-lg">Your interview assessment results are ready</p>
        </div>

        {/* Download PDF Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg"
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Assessment Report
              </>
            )}
          </Button>
        </div>

        {/* Content to convert to PDF */}
        <div id="candidate-result-pdf" ref={pdfRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Candidate Information */}
          <Card className="border-0 shadow-none mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="w-6 h-6" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900 text-lg">{candidate?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-semibold text-gray-900 text-lg">{candidate?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position Applied</p>
                      <p className="font-semibold text-gray-900 text-lg">{positionId?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Assessment Date</p>
                      <p className="font-semibold text-gray-900 text-lg">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results Summary */}
          <Card className="border-0 shadow-none mb-6">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-6 h-6" />
                Assessment Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${getScoreColor(score)}`}>
                    <span className="text-3xl font-bold">{Math.round(score)}%</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Overall Score</h3>
                  <p className="text-sm text-gray-600">{getScoreStatus(score)}</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{correctAnswers}</h3>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                    <Clock className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{result.timeTakenFormatted || 'N/A'}</h3>
                  <p className="text-sm text-gray-600">Time Taken</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Performance Progress</span>
                  <span className="text-lg text-gray-600">{Math.round(score)}%</span>
                </div>
                <Progress 
                  value={score} 
                  className="h-4"
                  style={{
                    backgroundColor: score >= 80 ? '#dcfce7' : 
                                    score >= 60 ? '#fef3c7' : '#fee2e2'
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Question Analysis */}
          <Card className="border-0 shadow-none">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6" />
                Detailed Question Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {answers.map((ans, index) => (
                  <div 
                    key={ans._id} 
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      ans.isCorrect 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : 'bg-red-50 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        ans.isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {ans.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-medium text-gray-600">Question {index + 1}</span>
                          <Badge variant={ans.isCorrect ? 'default' : 'destructive'} className="text-sm">
                            {ans.isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </div>
                        <p className="font-medium text-gray-900 text-lg mb-4">{ans.question}</p>
                        
                        {ans.questionImage && (
                          <img
                            src={ans.questionImage}
                            alt="Question"
                            className="rounded-lg mb-4 max-h-48 object-contain w-full border"
                          />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Your Answer:</p>
                            <div className={`p-3 rounded-lg ${
                              ans.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              <p className="font-medium">
                                {ans.selectedOptionText || 'Not answered'}
                              </p>
                              {ans.selectedOptionImage && (
                                <img
                                  src={ans.selectedOptionImage}
                                  alt="Selected"
                                  className="h-20 w-20 rounded-md border object-contain mt-2"
                                />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Correct Answer:</p>
                            <div className="p-3 rounded-lg bg-green-100 text-green-800">
                              <p className="font-medium">{ans.correctOptionText || 'N/A'}</p>
                              {ans.correctOptionImage && (
                                <img
                                  src={ans.correctOptionImage}
                                  alt="Correct"
                                  className="h-20 w-20 rounded-md border object-contain mt-2"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading Overlay */}
        {isGeneratingPDF && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 text-lg">Generating your assessment report...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

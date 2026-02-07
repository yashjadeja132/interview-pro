import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  FileText
} from 'lucide-react';

const CandidateResultCard = ({ candidateData, testResults, onDownloadPDF, onViewDetails }) => {
  console.log('CandidateResultCard received data:', { candidateData, testResults });

  // Debug image data
  // testResults.forEach((result, index) => {
  //   console.log(`Question ${index + 1} image data:`, {
  //     questionImage: result.questionImage,
  //     selectedOptionImage: result.selectedOptionImage,
  //     correctOptionImage: result.correctOptionImage
  //   });

  // });

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

  const correctAnswers = testResults.filter(result => result.isCorrect).length;
  const totalQuestions = testResults.length;

  return (
    <div id="candidate-result-pdf" className="bg-white p-8 max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Assessment Report</h1>
        <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Candidate Information */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 dark:text-black" />
            <span className="dark:text-black">Candidate Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{candidateData.candidateName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{candidateData.candidateEmail}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Position Applied</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{candidateData.positionName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Test Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(candidateData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 dark:text-black" />
            <span className="dark:text-black">Test Results Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${getScoreColor(candidateData.score)}`}>
                <span className="text-2xl font-bold">{Math.round(candidateData.score)}%</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Overall Score</h3>
              <p className="text-sm text-gray-600">{getScoreStatus(candidateData.score)}</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{correctAnswers}</h3>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{candidateData.timeTakenFormatted || 'N/A'}</h3>
              <p className="text-sm text-gray-600">Time Taken</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-white">Performance Progress</span>
              <span className="text-sm text-gray-600 dark:text-white">{Math.round(candidateData.score)}%</span>
            </div>
            <Progress
              value={candidateData.score}
              className="h-3"
              style={{
                backgroundColor: candidateData.score >= 80 ? '#dcfce7' :
                  candidateData.score >= 60 ? '#fef3c7' : '#fee2e2'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Question Analysis */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5 dark:text-black" />
            <span className="dark:text-black">Detailed Question Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-6">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 shadow-sm ${result.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    {result.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-semibold text-gray-700 dark:text-black">Question {index + 1}</span>
                      <Badge variant={result.isCorrect ? 'default' : 'destructive'} className="text-sm font-semibold">
                        {result.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-900 mb-4 text-lg leading-relaxed">{result.question}</p>

                    {/* Question Image */}
                    {result.questionImage && result.questionImage !== 'null' && result.questionImage.trim() !== '' && (
                      <div className="mb-6">
                        <p className="text-lg font-bold text-gray-800 mb-4">Question Image:</p>
                        <div className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50 shadow-lg">
                          <img
                            src={result.questionImage.startsWith('http') ? result.questionImage : `http://localhost:5000/${result.questionImage}`}
                            alt="Question Image"
                            className="max-w-full h-auto max-h-96 mx-auto rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                            onError={(e) => {
                              console.error('Question image failed to load:', result.questionImage);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                            onLoad={() => console.log('Question image loaded successfully:', result.questionImage)}
                          />
                          <div className="hidden text-center text-gray-500 py-8">
                            <p className="text-lg">Image failed to load: {result.questionImage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div>
                        <p className="text-lg font-bold text-gray-800 mb-3">Your Answer:</p>
                        <div className={`p-4 rounded-xl font-medium ${result.isCorrect ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'
                          }`}>
                          <p className="mb-2">{result.selectedOptionText || 'Not answered'}</p>
                          {result.selectedOptionImage && result.selectedOptionImage !== 'null' && result.selectedOptionImage.trim() !== '' && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Selected Answer Image:</p>
                              <div className="border-2 border-gray-200 rounded-lg p-3 bg-white">
                                <img
                                  src={result.selectedOptionImage.startsWith('http') ? result.selectedOptionImage : `http://localhost:5000/${result.selectedOptionImage}`}
                                  alt="Selected Answer Image"
                                  className="max-w-full h-auto max-h-48 mx-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                                  onError={(e) => {
                                    console.error('Selected answer image failed to load:', result.selectedOptionImage);
                                    e.target.style.display = 'none';
                                  }}
                                  onLoad={() => console.log('Selected answer image loaded successfully:', result.selectedOptionImage)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800 mb-3">Correct Answer:</p>
                        <div className="p-4 rounded-xl bg-green-100 text-green-800 border-2 border-green-200 font-medium">
                          <p className="mb-2">{result.correctOptionText || 'N/A'}</p>
                          {result.correctOptionImage && result.correctOptionImage !== 'null' && result.correctOptionImage.trim() !== '' && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Correct Answer Image:</p>
                              <div className="border-2 border-gray-200 rounded-lg p-3 bg-white">
                                <img
                                  src={result.correctOptionImage.startsWith('http') ? result.correctOptionImage : `http://localhost:5000/${result.correctOptionImage}`}
                                  alt="Correct Answer Image"
                                  className="max-w-full h-auto max-h-48 mx-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                                  onError={(e) => {
                                    console.error('Correct answer image failed to load:', result.correctOptionImage);
                                    e.target.style.display = 'none';
                                  }}
                                  onLoad={() => console.log('Correct answer image loaded successfully:', result.correctOptionImage)}
                                />
                              </div>
                            </div>
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8 border-t-2 border-gray-200">
        <Button
          onClick={onDownloadPDF}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <Download className="w-7 h-7 mr-4" />
          Download PDF Report
        </Button>
        <Button
          variant="outline"
          onClick={onViewDetails}
          className="px-12 py-4 text-xl font-bold border-2 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
        >
          <Eye className="w-7 h-7 mr-4" />
          Scroll to Top
        </Button>
      </div>
    </div>
  );
};

export default CandidateResultCard;

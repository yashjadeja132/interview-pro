import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {X, User, Mail, Phone, Briefcase, Calendar, Clock, Target, CheckCircle, XCircle, Award, FileText, Video, Download } from 'lucide-react';


const AttemptDetailsModal = ({ attempt, onClose }) => {
  if (!attempt) return null;

  const { attempt: attemptData, result } = attempt;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Attempt Details</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>{attemptData.candidateName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{attemptData.candidateEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{attemptData.candidatePhone || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Position:</span>
                    <span>{attemptData.positionName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Experience:</span>
                    <span>{attemptData.candidateExperience || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Attempt:</span>
                    <Badge variant="outline">#{attemptData.attemptNumber}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attempt Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attempt Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Started:</span>
                    <span>{formatDate(attemptData.startedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Completed:</span>
                    <span>{attemptData.completedAt ? formatDate(attemptData.completedAt) : 'Not completed'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge className={
                      attemptData.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : attemptData.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }>
                      {attemptData.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Latest:</span>
                    <Badge variant="outline">
                      {attemptData.isLatest ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      <span className={getScoreColor(result.score)}>{result.score}%</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Final Score</div>
                    <Badge className={getScoreBadgeColor(result.score)}>
                      {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2 text-blue-600">
                      {result.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2 text-purple-600">
                      {result.timeTakenFormatted}
                    </div>
                    <div className="text-sm text-gray-600">Time Taken</div>
                  </div>
                </div>

                {/* Score Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Score Progress</span>
                    <span>{result.score}%</span>
                  </div>
                  <Progress value={result.score} className="h-2" />
                </div>

                {/* Video Recording */}
                {result.videoPath && result.videoPath !== 'no video' && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Test Recording</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(result.videoPath, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Video
                      </Button>
                    </div>
                  </div>
                )}

                {/* Detailed Answers */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Question-wise Results</h4>
                  <div className="space-y-4">
                    {result.answers.map((answer, index) => (
                      <div key={answer.questionId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Q{index + 1}:</span>
                            <span className="text-sm text-gray-600">
                              {answer.questionText}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {answer.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <Badge className={
                              answer.isCorrect 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                        </div>

                        {answer.questionImage && (
                          <div className="mb-3">
                            <img 
                              src={answer.questionImage} 
                              alt="Question" 
                              className="max-w-xs h-auto rounded border"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Candidate's Answer:</div>
                            <div className="p-2 bg-gray-50 rounded">
                              {answer.selectedOptionText || 'No answer provided'}
                            </div>
                            {answer.selectedOptionImage && (
                              <img 
                                src={answer.selectedOptionImage} 
                                alt="Selected Option" 
                                className="mt-2 max-w-xs h-auto rounded border"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Correct Answer:</div>
                            <div className="p-2 bg-green-50 rounded">
                              {answer.correctOptionText}
                            </div>
                            {answer.correctOptionImage && (
                              <img 
                                src={answer.correctOptionImage} 
                                alt="Correct Option" 
                                className="mt-2 max-w-xs h-auto rounded border"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results Message */}
          {!result && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
                <p className="text-gray-600">
                  This attempt has not been completed yet or no results are available.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttemptDetailsModal;

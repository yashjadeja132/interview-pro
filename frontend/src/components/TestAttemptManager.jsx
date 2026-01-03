import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, CheckCircle, XCircle, Play, RotateCcw } from 'lucide-react';
import { testAttemptService } from '../services/testAttemptService';

const TestAttemptManager = ({ 
  candidateId, 
  positionId, 
  onStartTest, 
  onResumeTest,
  positionName = "Test Position"
}) => {
  const [attempts, setAttempts] = useState([]);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingAttempt, setCreatingAttempt] = useState(false);

  useEffect(() => {
    fetchAttempts();
    fetchLatestAttempt();
  }, [candidateId, positionId]);

  const fetchAttempts = async () => {
    try {
      const response = await testAttemptService.getCandidateAttempts(candidateId, positionId);
      setAttempts(response.data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      setError('Failed to load attempt history');
    }
  };

  const fetchLatestAttempt = async () => {
    try {
      const response = await testAttemptService.getLatestAttempt(candidateId, positionId);
      setLatestAttempt(response.data || null);
    } catch (error) {
      console.error('Error fetching latest attempt:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewAttempt = async () => {
    setCreatingAttempt(true);
    setError(null);
    
    try {
      const response = await testAttemptService.createTestAttempt(candidateId, positionId);
      if (response.data) {
        setLatestAttempt(response.data);
        await fetchAttempts(); // Refresh the attempts list
        onStartTest(response.data);
      }
    } catch (error) {
      console.error('Error creating new attempt:', error);
      setError('Failed to create new test attempt');
    } finally {
      setCreatingAttempt(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'abandoned':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'abandoned': 
        return 'bg-red-100 text-red-800 border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading attempt history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Position Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {positionName}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Latest Attempt Status */}
      {latestAttempt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(latestAttempt.status)}
                  <span className="text-lg font-semibold">
                    Attempt #{latestAttempt.attemptNumber}
                  </span>
                  <Badge className={getStatusColor(latestAttempt.status)}>
                    {latestAttempt.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Started: {formatDate(latestAttempt.startedAt)}
                </p>
                {latestAttempt.completedAt && (
                  <p className="text-sm text-gray-600">
                    Completed: {formatDate(latestAttempt.completedAt)}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                {latestAttempt.status === 'in_progress' && (
                  <Button 
                    onClick={() => onResumeTest(latestAttempt)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Resume Test
                  </Button>
                )}
                <Button 
                  onClick={createNewAttempt} 
                  variant="outline"
                  disabled={creatingAttempt}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {creatingAttempt ? 'Creating...' : 'Start New Attempt'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attempt History */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attempt History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div 
                  key={attempt.attemptId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(attempt.status)}
                      <div className="text-lg font-semibold">
                        Attempt #{attempt.attemptNumber}
                      </div>
                    </div>
                    <Badge className={getStatusColor(attempt.status)}>
                      {attempt.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {attempt.result && (
                      <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Score: {attempt.result.score}%
                      </div>
                    )}
                    {attempt.isLatest && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {attempt.completedAt 
                      ? formatDate(attempt.completedAt)
                      : formatDate(attempt.startedAt)
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Attempts Yet */}
      {attempts.length === 0 && !latestAttempt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                You haven't taken this test yet. Click below to start your first attempt.
              </p>
              <Button 
                onClick={createNewAttempt}
                disabled={creatingAttempt}
                size="lg"
                className="flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                {creatingAttempt ? 'Creating Attempt...' : 'Start First Attempt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Multiple Attempts:</strong> You can take this test multiple times</p>
            <p>• <strong>Progress Saving:</strong> Your progress is automatically saved</p>
            <p>• <strong>Resume Anytime:</strong> You can resume incomplete attempts</p>
            <p>• <strong>Best Score:</strong> All your attempts are tracked for review</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAttemptManager;
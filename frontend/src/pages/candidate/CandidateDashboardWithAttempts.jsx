import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  RotateCcw, 
  User, 
  Mail, 
  Briefcase,
  History,
  Trophy,
  AlertCircle
} from 'lucide-react';
import TestAttemptManager from '../../components/TestAttemptManager';
import { testAttemptService } from '../../services/testAttemptService';

const CandidateDashboardWithAttempts = () => {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allAttempts, setAllAttempts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCandidateData();
  }, []);

  const loadCandidateData = () => {
    try {
      const storedData = JSON.parse(sessionStorage.getItem("candidateData"));
      if (storedData) {
        setCandidateData(storedData);
        loadAllAttempts(storedData.id);
      } else {
        setError("No candidate data found. Please login again.");
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
      setError("Failed to load candidate data");
    } finally {
      setLoading(false);
    }
  };

  const loadAllAttempts = async (candidateId) => {
    try {
      // This would need to be implemented in the backend to get all attempts across all positions
      // For now, we'll show attempts for the current position
      if (candidateData?.positionId) {
        const response = await testAttemptService.getCandidateAttempts(candidateId, candidateData.positionId);
        setAllAttempts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const handleStartTest = (attemptInfo) => {
    // Store attempt info in session storage
    sessionStorage.setItem("currentAttempt", JSON.stringify(attemptInfo));
    navigate('/quiz-test-with-attempts', { 
      state: { 
        attemptInfo,
        isNewAttempt: true 
      } 
    });
  };

  const handleResumeTest = (attemptInfo) => {
    // Store attempt info in session storage
    sessionStorage.setItem("currentAttempt", JSON.stringify(attemptInfo));
    navigate('/quiz-test-with-attempts', { 
      state: { 
        attemptInfo,
        isResumeAttempt: true 
      } 
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("candidateData");
    sessionStorage.removeItem("currentAttempt");
    navigate('/candidate-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/candidate-login')} 
              className="w-full mt-4"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No candidate data found. Please login again.</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/candidate-login')} 
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedAttempts = allAttempts.filter(attempt => attempt.status === 'completed');
  const inProgressAttempts = allAttempts.filter(attempt => attempt.status === 'in_progress');
  const bestScore = completedAttempts.length > 0 
    ? Math.max(...completedAttempts.map(attempt => attempt.result?.score || 0))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
              <p className="text-gray-600">Welcome back, {candidateData.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{candidateData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{candidateData.position?.name || 'Position'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Best Score: {bestScore}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Test Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Attempts:</span>
                  <Badge variant="outline">{allAttempts.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {completedAttempts.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {inProgressAttempts.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <TestAttemptManager
              candidateId={candidateData.id}
              positionId={candidateData.positionId}
              positionName={candidateData.position?.name || 'Test Position'}
              onStartTest={handleStartTest}
              onResumeTest={handleResumeTest}
            />

            {/* Recent Attempts Summary */}
            {allAttempts.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allAttempts.slice(0, 5).map((attempt) => (
                      <div 
                        key={attempt.attemptId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {attempt.status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {attempt.status === 'in_progress' && (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="font-medium">
                              Attempt #{attempt.attemptNumber}
                            </span>
                          </div>
                          <Badge 
                            className={
                              attempt.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : attempt.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {attempt.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          {attempt.result && (
                            <div className="text-sm font-medium">
                              Score: {attempt.result.score}%
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboardWithAttempts;

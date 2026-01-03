import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Trophy, 
  RotateCcw, 
  Home, 
  Mail,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { testAttemptService } from '../../services/testAttemptService';

const ThankYouWithAttempts = () => {
  const [candidateData, setCandidateData] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { score, attemptNumber, totalQuestions } = location.state || {};

  useEffect(() => {
    loadCandidateData();
  }, []);

  const loadCandidateData = async () => {
    try {
      const storedData = JSON.parse(sessionStorage.getItem("candidateData"));
      if (storedData) {
        setCandidateData(storedData);
        await loadAttemptHistory(storedData.id, storedData.positionId);
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttemptHistory = async (candidateId, positionId) => {
    try {
      const response = await testAttemptService.getCandidateAttempts(candidateId, positionId);
      setAttemptHistory(response.data || []);
    } catch (error) {
      console.error('Error loading attempt history:', error);
    }
  };

  const handleStartNewAttempt = async () => {
    if (!candidateData) return;
    
    try {
      const response = await testAttemptService.createTestAttempt(
        candidateData.id, 
        candidateData.positionId
      );
      
      if (response.data) {
        sessionStorage.setItem("currentAttempt", JSON.stringify(response.data));
        navigate('/quiz-test-with-attempts', { 
          state: { 
            attemptInfo: response.data,
            isNewAttempt: true 
          } 
        });
      }
    } catch (error) {
      console.error('Error creating new attempt:', error);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/candidate-dashboard-with-attempts');
  };

  const handleLogout = () => {
    sessionStorage.removeItem("candidateData");
    sessionStorage.removeItem("currentAttempt");
    navigate('/candidate-login');
  };

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

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Outstanding performance! 🎉";
    if (score >= 80) return "Excellent work! 👏";
    if (score >= 70) return "Good job! 👍";
    if (score >= 60) return "Not bad, keep improving! 💪";
    return "Keep practicing, you'll get better! 📚";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const completedAttempts = attemptHistory.filter(attempt => attempt.status === 'completed');
  const bestScore = completedAttempts.length > 0 
    ? Math.max(...completedAttempts.map(attempt => attempt.result?.score || 0))
    : 0;
  const averageScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, attempt) => sum + (attempt.result?.score || 0), 0) / completedAttempts.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Completed Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for completing the assessment
          </p>
        </div>

        {/* Results Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Attempt Score */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  <span className={getScoreColor(score)}>{score}%</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Current Score</div>
                <Badge className={getScoreBadgeColor(score)}>
                  Attempt #{attemptNumber}
                </Badge>
              </div>

              {/* Best Score */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  <span className={getScoreColor(bestScore)}>{bestScore}%</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Best Score</div>
                <Badge variant="outline">
                  <Award className="h-3 w-3 mr-1" />
                  Personal Best
                </Badge>
              </div>

              {/* Average Score */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  <span className={getScoreColor(averageScore)}>{averageScore}%</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Average Score</div>
                <Badge variant="outline">
                  <Target className="h-3 w-3 mr-1" />
                  {completedAttempts.length} Attempts
                </Badge>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-lg font-medium text-blue-900">
                {getPerformanceMessage(score)}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Score Progress</span>
                <span>{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Attempt History */}
        {attemptHistory.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your Attempt History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attemptHistory.map((attempt) => (
                  <div 
                    key={attempt.attemptId}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      attempt.attemptNumber === attemptNumber 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          Attempt #{attempt.attemptNumber}
                        </span>
                        {attempt.attemptNumber === attemptNumber && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {attempt.result && (
                        <div className="text-lg font-semibold">
                          <span className={getScoreColor(attempt.result.score)}>
                            {attempt.result.score}%
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleStartNewAttempt}
            className="flex items-center gap-2"
            size="lg"
          >
            <RotateCcw className="h-4 w-4" />
            Take Another Attempt
          </Button>
          
          <Button 
            onClick={handleGoToDashboard}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <Mail className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Your results have been automatically sent to the HR team. 
            You will be contacted if you are selected for the next round.
          </p>
          <p className="mt-2">
            You can take this test multiple times to improve your score.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouWithAttempts;

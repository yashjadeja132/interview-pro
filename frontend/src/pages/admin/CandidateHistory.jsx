import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import axiosInstance from '@/Api/axiosInstance';

const CandidateHistory = () => {
  const { candidateId, positionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCandidateHistory();
  }, [candidateId, positionId]);

  const fetchCandidateHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/admin/retest-requests/candidate/${candidateId}/position/${positionId}/history`
      );
      
      if (response.data.success) {
        setHistoryData(response.data.data);
      } else {
        setError('Failed to fetch candidate history');
      }
    } catch (err) {
      console.error('Error fetching candidate history:', err);
      setError(err.response?.data?.message || 'Failed to load candidate history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      abandoned: { bg: 'bg-red-100', text: 'text-red-800', label: 'Abandoned' }
    };
    
    const config = statusConfig[status] || statusConfig.in_progress;
    return (
      <Badge className={`${config.bg} ${config.text}`}>
        {config.label}
      </Badge>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No data available</p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { candidate, position, attemptHistory } = historyData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">Candidate History</h1>
        </div>
      </div>

      {/* Candidate Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Candidate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="font-semibold text-slate-800">{candidate.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-semibold text-slate-800">{candidate.email}</p>
              </div>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-semibold text-slate-800">{candidate.phone}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Position Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Position Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Position Name</p>
                <p className="font-semibold text-slate-800">{position.name}</p>
              </div>
            </div>
          
          </div>
        </CardContent>
      </Card>

      {/* Attempt History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Test Attempt History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attemptHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No test attempts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attemptHistory.map((attempt) => (
                <div
                  key={attempt.attemptId}
                  className={`p-5 border rounded-lg ${
                    attempt.isLatest
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        {attempt.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-600" />
                        )}
                        <h3 className="text-lg font-semibold text-slate-800">
                          Attempt #{attempt.attemptNumber}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm font-medium">{position.name}</span>
                      </div>
                      {attempt.isLatest && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Latest
                        </Badge>
                      )}
                      {getStatusBadge(attempt.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {attempt.score !== null && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(attempt.score)}`}>
                          {attempt.score.toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {attempt.totalQuestions !== null && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Total Questions</p>
                        <p className="text-xl font-semibold text-slate-800">
                          {attempt.totalQuestions}
                        </p>
                      </div>
                    )}
                    {attempt.correctAnswers !== null && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Correct Answers</p>
                        <p className="text-xl font-semibold text-green-600">
                          {attempt.correctAnswers} / {attempt.totalQuestions}
                        </p>
                      </div>
                    )}
                    {attempt.timeTakenFormatted && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Time Taken</p>
                        <p className="text-xl font-semibold text-slate-800">
                          {attempt.timeTakenFormatted}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>Started: {formatDate(attempt.startedAt)}</span>
                    </div>
                    {attempt.completedAt && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed: {formatDate(attempt.completedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateHistory;


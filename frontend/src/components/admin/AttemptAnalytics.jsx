import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { adminAttemptService } from '../../services/adminAttemptService';

const AttemptAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAttemptService.getAttemptAnalytics(period);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const { summary, attemptsByPosition, dailyAttempts } = analytics;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{summary.completedAttempts}</p>
                <p className="text-xs text-gray-500">{summary.completionRate}% completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{summary.inProgressAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{summary.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attempts by Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Attempts by Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attemptsByPosition.map((position, index) => {
              const completionRate = position.count > 0 ? (position.completed / position.count * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{position._id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Total: {position.count}</span>
                      <span>Completed: {position.completed}</span>
                      <span>Rate: {completionRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{position.count} attempts</Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {position.completed} completed
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Attempts Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Attempts Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyAttempts.slice(-7).map((day, index) => {
              const completionRate = day.total > 0 ? (day.completed / day.total * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (day.total / Math.max(...dailyAttempts.map(d => d.total))) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{day.total}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{day.total} total</Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {day.completed} completed
                    </Badge>
                    <span className="text-xs text-gray-500">{completionRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{summary.completedAttempts}</div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-xs text-gray-500">
                {summary.totalAttempts > 0 ? (summary.completedAttempts / summary.totalAttempts * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{summary.inProgressAttempts}</div>
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="text-xs text-gray-500">
                {summary.totalAttempts > 0 ? (summary.inProgressAttempts / summary.totalAttempts * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{summary.abandonedAttempts}</div>
              <div className="text-sm text-gray-600">Abandoned</div>
              <div className="text-xs text-gray-500">
                {summary.totalAttempts > 0 ? (summary.abandonedAttempts / summary.totalAttempts * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttemptAnalytics;

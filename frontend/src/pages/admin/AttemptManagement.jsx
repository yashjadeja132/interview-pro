import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RotateCcw, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  User,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { adminAttemptService } from '../../services/adminAttemptService';
import AttemptDetailsModal from '../../components/admin/AttemptDetailsModal';
import AttemptAnalytics from '../../components/admin/AttemptAnalytics';

const AttemptManagement = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    status: 'all',
    minScore: '',
    maxScore: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAttempts();
  }, [currentPage, filters]);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Filter out empty values and 'all' status
      const cleanFilters = { ...filters };
      if (cleanFilters.status === 'all') {
        delete cleanFilters.status;
      }
      Object.keys(cleanFilters).forEach(key => {
        if (cleanFilters[key] === '') {
          delete cleanFilters[key];
        }
      });
      
      const params = {
        page: currentPage,
        limit: 10,
        ...cleanFilters
      };

      const response = await adminAttemptService.getAllAttempts(params);
      setAttempts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading attempts:', error);
      setError('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDetails = async (attemptId) => {
    try {
      const response = await adminAttemptService.getAttemptDetails(attemptId);
      setSelectedAttempt(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading attempt details:', error);
      setError('Failed to load attempt details');
    }
  };

  const handleResetAttempt = async (attemptId) => {
    if (!window.confirm('Are you sure you want to reset this attempt?')) {
      return;
    }

    try {
      await adminAttemptService.resetAttempt(attemptId);
      await loadAttempts(); // Refresh the list
    } catch (error) {
      console.error('Error resetting attempt:', error);
      setError('Failed to reset attempt');
    }
  };

  const handleDeleteAttempt = async (attemptId) => {
    if (!window.confirm('Are you sure you want to delete this attempt? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAttemptService.deleteAttempt(attemptId);
      await loadAttempts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting attempt:', error);
      setError('Failed to delete attempt');
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
        return 'bg-green-100 text-green-800';
      case 'in_progress': 
        return 'bg-yellow-100 text-yellow-800';
      case 'abandoned': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (loading && attempts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attempt Management</h1>
              <p className="text-gray-600 mt-2">Manage and monitor candidate test attempts</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Button>
              <Button
                onClick={loadAttempts}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mb-8">
            <AttemptAnalytics />
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Min Score</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minScore}
                  onChange={(e) => handleFilterChange('minScore', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Max Score</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filters.maxScore}
                  onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="attemptNumber">Attempt Number</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Order</label>
                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attempts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Attempts</span>
              <Badge variant="outline">
                {pagination.total || 0} Total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.attemptId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{attempt.candidateName}</div>
                          <div className="text-sm text-gray-500">{attempt.candidateEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          {attempt.positionName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          #{attempt.attemptNumber}
                          {attempt.isLatest && (
                            <span className="ml-1 text-blue-600">(Latest)</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(attempt.status)}
                          <Badge className={getStatusColor(attempt.status)}>
                            {attempt.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {attempt.result ? (
                          <span className={`font-medium ${getScoreColor(attempt.result.score)}`}>
                            {attempt.result.score}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(attempt.startedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {attempt.completedAt ? formatDate(attempt.completedAt) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(attempt.attemptId)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {attempt.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetAttempt(attempt.attemptId)}
                              className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAttempt(attempt.attemptId)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {attempts.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">No attempts found matching your criteria.</p>
              </div>
            )}

            {renderPagination()}
          </CardContent>
        </Card>

        {/* Attempt Details Modal */}
        {showDetailsModal && selectedAttempt && (
          <AttemptDetailsModal
            attempt={selectedAttempt}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedAttempt(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AttemptManagement;

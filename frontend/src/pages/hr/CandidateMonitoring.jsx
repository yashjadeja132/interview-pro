import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Api/axiosInstance";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Download, Eye, Filter, Search, Video, User, Clock, Trophy, FileText, ChevronLeft, ChevronRight, MoreHorizontal, FileDown, X, ChevronUp, ChevronDown, CheckCircle2, UserCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { generateCandidateResultPDF, generatePDFFromHTML } from "../../utils/pdfGenerator";
import "@/assets/css/CandidateMonitoring.css";

// Date formatting function with full timestamp
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateStr} ${timeStr}`;
};

const formatDateForAPI = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export default function CandidateMonitoring() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openVideo, setOpenVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCheckBox, setShowCheckBox] = useState(false);
  const [filters, setFilters] = useState({
    position: "",
    startDate: null,
    endDate: null
  });
  const [positions, setPositions] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  }

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters properly
      const params = {
        page,
        limit,
        search: search.trim()
      };

      // Add position filter
      if (filters.position && filters.position.trim() !== '') {
        params.position = filters.position;
      }


      // Add date filters
      if (filters.startDate) {
        params.startDate = formatDateForAPI(filters.startDate);
      }
      if (filters.endDate) {
        params.endDate = formatDateForAPI(filters.endDate);
      }
      console.log('raw query ', filters.startDate, filters.endDate)
      const { data } = await axiosInstance.get("/test", { params });
      setResults(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalResults(data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch results");
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const { data } = await axiosInstance.get("/position");
      setPositions(data.data || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err.message);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, search, filters, limit]);

  useEffect(() => {
    fetchPositions();
  }, []);

  // Cleanup effect to restore body scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOpenVideo = (videoUrl, candidate) => {
    setSelectedVideo(videoUrl);
    setSelectedCandidate(candidate);
    setOpenVideo(true);
  };

  const handleDownloadResume = (resumeUrl, candidateName) => {
    if (resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = `${candidateName}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearFilters = () => {
    setFilters({
      position: "",
      startDate: null,
      endDate: null
    });
    setPage(1);
  };

  const handleSearchChange = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);

    setSearchTimeout(timeout);
  };

  const toggleSelection = async (resultId, currentStatus) => {
    try {
      await axiosInstance.put(`/test/${resultId}/toggle-selection`, {
        isSelectedForInterview: !currentStatus
      });
      setResults(prevResults =>
        prevResults.map(r =>
          r._id === resultId ? { ...r, isSelectedForInterview: !currentStatus } : r
        )
      );
    } catch (err) {
      console.error("Failed to toggle selection:", err.message);
    }
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Candidate Name', 'Email', 'Position', 'Score (%)', 'Time Taken', 'Date', 'Video Available'].join(','),
      ...results.map(r => [
        `"${r.candidateName}"`,
        `"${r.candidateEmail}"`,
        `"${r.positionName}"`,
        Math.round(r.score),
        `"${r.timeTakenFormatted || 'N/A'}"`,
        formatDateForAPI(r.createdAt),
        r.video && r.video !== 'no video' ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidate_results_${formatDateForAPI(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
        <div className="max-w-10xl mx-auto pm-header-container">
          <div className="pm-header-info">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Candidate Monitoring</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor and track candidate interview performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={results.length === 0}
              className="flex items-center gap-2 text-black dark:text-white bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 w-full md:w-auto"  >
              <FileDown className="h-4 w-4 text-black dark:text-white" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-2 sm:pt-4 max-w-8xl mx-auto space-y-6">
        {/* Search and Filter Section */}
        <Card className="border-0 shadow-sm dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="pm-controls-container">
              <div className="pm-search-filter-group">
                <div className="pm-search-input-wrapper">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search candidates..."
                    defaultValue={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white w-full"
                  />
                </div>
              </div>
              <div className="pm-results-count-container">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCheckBox(!showCheckBox)}
                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/50 flex items-center gap-2 mb-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {showCheckBox ? "Hide Selection" : "Shortlist Candidates"}
                </Button> */}
                <div className="text-sm text-slate-500 dark:text-slate-400 pm-results-count">
                  Showing {results.length} of {totalResults} candidates
                </div>
              </div>
            </div>
          </CardContent>
           <CardContent className="ps-6">
              <div className="space-y-4">
                
                <div className="pm-filter-grid">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Position</label>
                    <Select
                      value={filters.position || "all"}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, position: value === "all" ? "" : value }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <SelectValue placeholder="All Positions" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">All Positions</SelectItem>
                        {positions.map((pos) => (
                          <SelectItem key={pos._id} value={pos.name} className="dark:text-white dark:focus:bg-slate-700">{pos.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? formatDate(filters.startDate) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-slate-900 dark:border-slate-700">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) => {
                            setFilters(prev => ({ ...prev, startDate: date }));
                            setPage(1);
                          }}
                          initialFocus
                          className="dark:bg-slate-900 dark:text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? formatDate(filters.endDate) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-slate-900 dark:border-slate-700">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) => {
                            setFilters(prev => ({ ...prev, endDate: date }));
                            setPage(1);
                          }}
                          initialFocus
                          className="dark:bg-slate-900 dark:text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
        </Card>

        {/* Filters */}
          {/* <Card className="border-0 shadow-sm dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                
                <div className="pm-filter-grid">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Position</label>
                    <Select
                      value={filters.position || "all"}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, position: value === "all" ? "" : value }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <SelectValue placeholder="All Positions" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">All Positions</SelectItem>
                        {positions.map((pos) => (
                          <SelectItem key={pos._id} value={pos.name} className="dark:text-white dark:focus:bg-slate-700">{pos.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? formatDate(filters.startDate) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-slate-900 dark:border-slate-700">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) => {
                            setFilters(prev => ({ ...prev, startDate: date }));
                            setPage(1);
                          }}
                          initialFocus
                          className="dark:bg-slate-900 dark:text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? formatDate(filters.endDate) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-slate-900 dark:border-slate-700">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) => {
                            setFilters(prev => ({ ...prev, endDate: date }));
                            setPage(1);
                          }}
                          initialFocus
                          className="dark:bg-slate-900 dark:text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        

        {/* Candidates Table */}
        <Card className="border-0 shadow-sm dark:bg-slate-900">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold dark:text-white">Candidate Monitoring</CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Monitor and track candidate interview performance and results
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Show:</span>
                <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                  <SelectTrigger className="w-20 h-8 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectItem value="5" className="dark:text-white dark:focus:bg-slate-700">5</SelectItem>
                    <SelectItem value="10" className="dark:text-white dark:focus:bg-slate-700">10</SelectItem>
                    <SelectItem value="20" className="dark:text-white dark:focus:bg-slate-700">20</SelectItem>
                    <SelectItem value="50" className="dark:text-white dark:focus:bg-slate-700">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-600 dark:text-slate-400">Loading candidates...</span>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">No candidates found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
                  {search ? "No candidates match your search criteria." : "No candidates have taken interviews yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="pm-table-wrapper">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="w-8 md:hidden"></TableHead>
                        <TableHead className="w-8 px-0 text-center"></TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 hidden sm:table-cell w-12">#</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 pm-candidate-column">Candidate</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center hidden md:table-cell">Position</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center hidden lg:table-cell">Questions Asked</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center hidden md:table-cell">Scheduled Time</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Score</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 hidden lg:table-cell">Time Taken</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right pr-2 md:pr-6 w-[110px] sm:w-auto pm-actions-column">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r, idx) => (
                        <React.Fragment key={idx}>
                          <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                            <TableCell className="md:hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(idx)}
                                className="h-8 w-8 p-0"
                              >
                                {expandedRows.has(idx) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                            <TableCell className="w-10 px-0 text-center">
                              {/* {showCheckBox && ( */}
                                <Checkbox
                                  checked={r.isSelectedForInterview}
                                  onCheckedChange={() => toggleSelection(r._id, r.isSelectedForInterview)}
                                  className="dark:border-slate-500 mx-auto"
                                  title="Select for Interview"
                                />
                              {/* )} */}
                            </TableCell>
                            <TableCell className="font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                              {(page - 1) * limit + idx + 1}
                            </TableCell>
                            <TableCell className="pm-candidate-column">
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0 pm-candidate-icon">
                                  <User className="w-4 h-4 dark:text-white" />
                                </div>
                                <div className="min-w-0 flex-1 relative">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium text-slate-800 dark:text-white whitespace-nowrap">{r.candidateName}</div>
                                    {r.isSelectedForInterview && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0" title="Selected for Interview" />
                                    )}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400 break-all desktop-only">{r.candidateEmail}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              {r.positionName}
                            </TableCell>
                            <TableCell className="text-center hidden lg:table-cell">
                              {r.questionsAskedToCandidate ? r.questionsAskedToCandidate : `N/A`}
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              {formatDate(r.createdAt)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getScoreBadgeVariant(r.score)} className="font-semibold">
                                    {Math.round(r.score)}%
                                  </Badge>
                                </div>
                                <Progress
                                  value={r.score}
                                  className="w-20 h-2"
                                  style={{
                                    backgroundColor: r.score >= 80 ? '#dcfce7' : r.score >= 60 ? '#fef3c7' : '#fee2e2'
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{r.timeTakenFormatted || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-2 md:pr-6 whitespace-nowrap pm-actions-column">
                              <div className="flex items-center justify-end space-x-2">
                                {r.video && r.video !== 'no video' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenVideo(r.video, r)}
                                    title="Watch Video"
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 dark:border-blue-900/50 dark:bg-slate-800 dark:hover:bg-blue-900/20"
                                  >
                                    <Video className="h-4 w-4" />
                                  </Button>
                                )}
                                {r.candidateResume && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadResume(r.candidateResume, r.candidateName)}
                                    title="Download Resume"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:border-green-900/50 dark:bg-slate-800 dark:hover:bg-green-900/20"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="View Report & Download PDF"
                                  onClick={() => navigate(`/candidate-report/${r.candidateId}`)}
                                  className="h-8 w-8 p-0 text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(idx) && (
                            <TableRow className="md:hidden bg-slate-50/50 dark:bg-slate-800/20 border-none hover:bg-transparent">
                              <TableCell colSpan={10} className="p-4">
                                <div className="grid grid-cols-1 gap-4 text-sm max-w-full">
                                  <div className="md:hidden">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Candidate Email</p>
                                    <p className="text-slate-800 dark:text-white mt-1 font-medium break-all">{r.candidateEmail}</p>
                                  </div>
                                  <div className="md:hidden">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Position</p>
                                    <p className="text-slate-800 dark:text-white mt-1 font-medium">{r.positionName}</p>
                                  </div>
                                  <div className="lg:hidden">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Questions Asked</p>
                                    <p className="text-slate-800 dark:text-white mt-1 font-medium">{r.questionsAskedToCandidate || 'N/A'}</p>
                                  </div>
                                  <div className="md:hidden">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Scheduled Time</p>
                                    <p className="text-slate-800 dark:text-white mt-1 font-medium">{formatDate(r.createdAt)}</p>
                                  </div>
                                  <div className="sm:hidden">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Score</p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <Badge variant={getScoreBadgeVariant(r.score)} className="font-semibold">
                                        {Math.round(r.score)}%
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="lg:hidden">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Time Taken</p>
                                    <div className="mt-1 flex items-center gap-1.5 text-slate-800 dark:text-white font-medium">
                                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                                      <span>{r.timeTakenFormatted || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {results.length > 0 && (
                  <div className="flex justify-end items-center mt-6">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 dark:disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className={`w-8 h-8 p-0 ${pageNum === page ? "" : "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 dark:disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Video Dialog */}
      <Dialog open={openVideo} onOpenChange={setOpenVideo}>
        <DialogContent className="max-w-5xl mx-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 dark:text-white">
              <Video className="h-5 w-5" />
              <span>Candidate Video - {selectedCandidate?.candidateName}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && selectedVideo !== 'no video' ? (
            <div className="space-y-4">
              <video
                src={selectedVideo}
                controls
                className="w-full rounded-lg shadow-lg"
                poster="/api/placeholder/800/450"
              />
              {selectedCandidate && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Candidate</p>
                    <p className="font-semibold dark:text-white">{selectedCandidate.candidateName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Position</p>
                    <p className="font-semibold dark:text-white">{selectedCandidate.positionName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Score</p>
                    <Badge variant={getScoreBadgeVariant(selectedCandidate.score)}>
                      {Math.round(selectedCandidate.score)}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Time Taken</p>
                    <p className="font-semibold dark:text-white">{selectedCandidate.timeTakenFormatted}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Video className="h-16 w-16 text-slate-400" />
              <div className="text-center">
                <p className="text-lg font-medium text-slate-600 dark:text-white">No video available</p>
                <p className="text-sm text-slate-400">This candidate did not submit a video recording</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

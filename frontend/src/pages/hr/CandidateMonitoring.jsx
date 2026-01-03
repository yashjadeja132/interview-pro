import { useState, useEffect } from "react";
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
import { CalendarIcon, Download, Eye, Filter, Search, Video, User, Clock, Trophy, FileText, ChevronLeft, ChevronRight, MoreHorizontal, FileDown, X } from "lucide-react";
import axios from "axios";
import { SidebarProvider } from "../../components/ui/sidebar";
import { generateCandidateResultPDF, generatePDFFromHTML } from "../../utils/pdfGenerator";
import CandidateResultCard from "../../components/CandidateResultCard";

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
    second: '2-digit',
    hour12: true
  });
  return `${dateStr} ${timeStr}`;
};

const formatDateForAPI = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export default function CandidateMonitoring() {
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
  const [filters, setFilters] = useState({
    position: "",
    minScore: "",
    maxScore: "",
    startDate: null,
    endDate: null
  });
  const [positions, setPositions] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedCandidateForDetails, setSelectedCandidateForDetails] = useState(null);
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);
  const [candidateTestResults, setCandidateTestResults] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoadingCandidateResults, setIsLoadingCandidateResults] = useState(false);

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

      // Add score filters
      if (filters.minScore && filters.minScore.trim() !== '') {
        params.minScore = Number(filters.minScore);
      }
      if (filters.maxScore && filters.maxScore.trim() !== '') {
        params.maxScore = Number(filters.maxScore);
      }

      // Add date filters
      if (filters.startDate) {
        params.startDate = formatDateForAPI(filters.startDate);
      }
      if (filters.endDate) {
        params.endDate = formatDateForAPI(filters.endDate);
      }

      console.log('Fetching with params:', params); // Debug log
      
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
      console.log(data);
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
      minScore: "",
      maxScore: "",
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

  const fetchCandidateTestResults = async (candidateId) => {
    setIsLoadingCandidateResults(true);
    try {
      console.log('Fetching test results for candidate ID:', candidateId);
      const { data } = await axiosInstance.get(`/test/${candidateId}`);
      console.log('API response:', data);
      return data;
    } catch (err) {
      console.error("Failed to fetch candidate test results:", err.message);
      console.error("Error details:", err.response?.data);
      return [];
    } finally {
      setIsLoadingCandidateResults(false);
    }
  };

  const handleViewCandidateDetails = async (candidate) => {
    console.log('Viewing candidate details:', candidate);
    setSelectedCandidateForDetails(candidate);
    setShowCandidateDetails(true);
    
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Fetch detailed test results
    const testResults = await fetchCandidateTestResults(candidate.candidateId);
    console.log('Fetched test results:', testResults);
    
    // Process the results to extract answers from the first test result
    if (testResults && testResults.length > 0) {
      const firstTestResult = testResults[0];
      const answers = firstTestResult.answers || [];
      console.log('Processed answers:', answers);
      setCandidateTestResults(answers);
    } else {
      setCandidateTestResults([]);
    }
  };

  const handleCloseCandidateDetails = () => {
    setShowCandidateDetails(false);
    setSelectedCandidateForDetails(null);
    setCandidateTestResults([]);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const handleDownloadCandidatePDF = async () => {
    if (!selectedCandidateForDetails || candidateTestResults.length === 0) {
      console.error("No candidate data or test results available for PDF generation");
      return;
    }
    
    setIsGeneratingPDF(true);
    try {
      console.log("Generating PDF for:", selectedCandidateForDetails.candidateName);
      console.log("Test results:", candidateTestResults);
      
      const pdf = await generateCandidateResultPDF(selectedCandidateForDetails, candidateTestResults);
      const filename = `${selectedCandidateForDetails.candidateName.replace(/\s+/g, '_')}_Assessment_Report.pdf`;
      
      console.log("PDF generated successfully, saving as:", filename);
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Fallback to HTML to PDF conversion
      try {
        console.log("Trying fallback HTML to PDF conversion...");
        const filename = `${selectedCandidateForDetails.candidateName.replace(/\s+/g, '_')}_Assessment_Report.pdf`;
        const pdf = await generatePDFFromHTML('candidate-result-pdf', filename);
        pdf.save(filename);
        console.log("Fallback PDF generation successful");
      } catch (fallbackError) {
        console.error("Fallback PDF generation failed:", fallbackError);
        alert("Failed to generate PDF. Please try again or contact support.");
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Candidate Monitoring</h1>
              <p className="text-slate-600 mt-1">Monitor and track candidate interview performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="flex items-center gap-2"
              disabled={results.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Candidates</p>
                  <p className="text-3xl font-bold text-blue-800">{totalResults}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">High Performers</p>
                  <p className="text-3xl font-bold text-yellow-800">{results.filter(r => r.score >= 80).length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Avg. Time</p>
                  <p className="text-3xl font-bold text-green-800">
                    {results.length > 0 
                      ? Math.round(results.reduce((acc, r) => acc + (r.timeTakenInSeconds || 0), 0) / results.length / 60)
                      : 0}m
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">With Videos</p>
                  <p className="text-3xl font-bold text-purple-800">{results.filter(r => r.video && r.video !== 'no video').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search candidates..."
                    defaultValue={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 w-80 h-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="h-10"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {(filters.position || filters.minScore || filters.maxScore || filters.startDate || filters.endDate) && (
                    <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </Button>
              </div>
              <div className="text-sm text-slate-500">
                Showing {results.length} of {totalResults} candidates
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        {showFilters && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-700">Filter Options</h3>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Position</label>
                    <Select 
                      value={filters.position || "all"} 
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, position: value === "all" ? "" : value }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Positions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {positions.map((pos) => (
                          <SelectItem key={pos._id} value={pos.name}>{pos.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Min Score</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, minScore: e.target.value }));
                        setPage(1);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Max Score</label>
                    <Input
                      type="number"
                      placeholder="100"
                      min="0"
                      max="100"
                      value={filters.maxScore}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, maxScore: e.target.value }));
                        setPage(1);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal w-full">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? formatDate(filters.startDate) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) => {
                            setFilters(prev => ({ ...prev, startDate: date }));
                            setPage(1);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal w-full">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? formatDate(filters.endDate) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) => {
                            setFilters(prev => ({ ...prev, endDate: date }));
                            setPage(1);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Candidates Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">All Candidates</CardTitle>
            <CardDescription>
              Monitor and track candidate interview performance and results
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-600">Loading candidates...</span>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">No candidates found</h3>
                <p className="text-slate-500 text-center max-w-sm">
                  {search ? "No candidates match your search criteria." : "No candidates have taken interviews yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
      <Table>
        <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="font-semibold text-slate-700">#</TableHead>
                      <TableHead className="font-semibold text-slate-700">Candidate</TableHead>
                      <TableHead className="font-semibold text-slate-700">Position</TableHead>
                      <TableHead className="font-semibold text-slate-700">Score</TableHead>
                      <TableHead className="font-semibold text-slate-700">Time Taken</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
                    {results.map((r, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-600">
                          {idx + 1}
              </TableCell>
                <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                  <div>
                              <div className="font-medium text-slate-800">{r.candidateName}</div>
                              <div className="text-sm text-slate-500">{r.candidateEmail}</div>
                              <div className="text-xs text-slate-400">
                                {formatDate(r.createdAt)}
                              </div>
                            </div>
                  </div>
                </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {r.positionName}
                          </Badge>
                        </TableCell>
               <TableCell>
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
                        <TableCell className="text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{r.timeTakenFormatted || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {r.video && r.video !== 'no video' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenVideo(r.video, r)}
                                title="Watch Video"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
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
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              title="View Details & Download PDF"
                              onClick={() => handleViewCandidateDetails(r)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {results.length > 0 && (
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-6">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalResults)} of {totalResults} results</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Show:</span>
                <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
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
                        className="w-8 h-8 p-0"
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
                >
                  <ChevronRight className="h-4 w-4" />
        </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Video Dialog */}
      <Dialog open={openVideo} onOpenChange={setOpenVideo}>
        <DialogContent className="max-w-5xl mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
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
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Candidate</p>
                    <p className="font-semibold">{selectedCandidate.candidateName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Position</p>
                    <p className="font-semibold">{selectedCandidate.positionName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Score</p>
                    <Badge variant={getScoreBadgeVariant(selectedCandidate.score)}>
                      {Math.round(selectedCandidate.score)}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Time Taken</p>
                    <p className="font-semibold">{selectedCandidate.timeTakenFormatted}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Video className="h-16 w-16 text-slate-400" />
              <div className="text-center">
                <p className="text-lg font-medium text-slate-600">No video available</p>
                <p className="text-sm text-slate-400">This candidate did not submit a video recording</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Candidate Details Dialog - Custom Full Page Modal */}
      {showCandidateDetails && (
        <div className="fixed inset-0 w-screen h-screen bg-white z-[9999] overflow-hidden" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Full Page Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Candidate Assessment Report</h1>
                  <p className="text-lg text-gray-600">{selectedCandidateForDetails?.candidateName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCloseCandidateDetails}
                className="h-12 w-12 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          {/* Content Area */}
          {selectedCandidateForDetails && (
            <div className="flex-1 overflow-y-auto px-6 py-6 h-[calc(100vh-80px)]">
              {isLoadingCandidateResults ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-600">Loading candidate results...</span>
                  </div>
                </div>
              ) : candidateTestResults.length > 0 ? (
                <CandidateResultCard
                  candidateData={selectedCandidateForDetails}
                  testResults={candidateTestResults}
                  onDownloadPDF={handleDownloadCandidatePDF}
                  onViewDetails={() => {
                    // Scroll to top of content
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No test results found</h3>
                  <p className="text-slate-500 text-center max-w-sm">
                    No detailed test results are available for this candidate.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* PDF Generation Overlay */}
          {isGeneratingPDF && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Generating PDF...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Plus, 
  Users, 
  UserCheck, 
  Clock, 
  FileText,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Check
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import api from '../../Api/axiosInstance'
export default function CandidateManagement() {
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPositionQuestionCount, setSelectedPositionQuestionCount] = useState(null);

  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk selection state
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Add candidate modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  // ✅ Errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState({
    position: "",
    experience: "",
    status: ""
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get schedule status based on isSubmitted field
  const getScheduleStatus = (isSubmitted) => {
    if (isSubmitted === 1) {
      return { status: 'completed', color: 'text-green-600', bg: 'bg-green-100' };
    } else {
      return { status: 'pending', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
  };

  // Get experience badge variant and display text
  const getExperienceBadgeVariant = (experience) => {
    switch (experience) {
      case 'fresher': return 'secondary';
      case '1-2': return 'default';
      case '3-5': return 'default';
      case '5+': return 'default';
      default: return 'outline';
    }
  };

  const getExperienceDisplayText = (experience) => {
    switch (experience) {
      case 'fresher': return 'Fresher (0-1 years)';
      case '1-2': return '1-2 Years';
      case '3-5': return '3-5 Years';
      case '5+': return '5+ Years';
      default: return experience || 'N/A';
    }
  };

  // Fetch candidates from backend
  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        search: search.trim(),
        ...filters
      };
      const { data } = await api.get("/hr", { params });
      console.log(data);
      setCandidates(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCandidates(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch candidates");
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch positions
  const fetchPositions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/position");
      const positionsData = res.data.data || [];
      setPositions(positionsData);
      
      // If a position is selected in the form, update question count
      if (form.position) {
        const selectedPos = positionsData.find(p => p._id === form.position);
        if (selectedPos) {
          setSelectedPositionQuestionCount(selectedPos.questionCount || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load positions", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [currentPage, search, filters, rowsPerPage]);

  useEffect(() => {
    fetchPositions();
  }, []);

  // Validate single field
  function validateField(name, value) {
    let message = "";
    if (name === "name") {
      if (!value) message = "Name is required";
    }
    if (name === "email") {
      if (!value) message = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) message = "Enter a valid email";
    }
    if (name === "phone") {
      if (!value) message = "Phone is required";
      else if (!/^\d{10}$/.test(value))
        message = "Enter a valid 10-digit phone";
    }
    if (name === "experience") {
      if (!value) message = "Experience is required";
    }
    if (name === "position") {
      if (!value) message = "Position is required";
    }
    if (name === "schedule") {
      if (!value) message = "Schedule is required";
      else {
        const selectedDate = new Date(value);
        const now = new Date();
        if (selectedDate < now) {
          message = "Interview schedule cannot be in the past";
        }
      }
    }
    if (name === "technicalQuestions") {
      if (!value || value === "") message = "Technical questions are required";
      else {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
          message = "Technical questions must be a positive number";
        }
      }
    }
    if (name === "logicalQuestions") {
      if (!value || value === "") message = "Logical questions are required";
      else {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
          message = "Logical questions must be a positive number";
        }
      }
    }
    if (name === "questionsAskedToCandidate") {
      if (!value || value === "") {
        message = "Questions asked is required";
      } else {
        const questionCount = parseInt(value);
        if (isNaN(questionCount) || questionCount < 0) {
          message = "Questions asked must be a positive number";
        } else if (selectedPositionQuestionCount !== null && questionCount > selectedPositionQuestionCount) {
          if (selectedPositionQuestionCount === 0) {
            message = "No questions available for this position yet. Please add questions first.";
          } else {
            message = `Only ${selectedPositionQuestionCount} question${selectedPositionQuestionCount !== 1 ? 's' : ''} available for this position. Not enough questions.`;
          }
        }
      }
    }

    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    validateField(e.target.name, e.target.value);
  };

  const handleAdd = async () => {
    // ✅ Validate all fields before submit
    const errors = {};
    if (!form.name) errors.name = "Name is required";
    if (!form.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Enter a valid email";
    if (!form.phone) errors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone))
      errors.phone = "Enter a valid 10-digit phone";
    if (!form.experience) errors.experience = "Experience is required";
    if (!form.position) errors.position = "Position is required";
    if (!form.schedule) errors.schedule = "Schedule is required";
    else {
      const selectedDate = new Date(form.schedule);
      const now = new Date();
      if (selectedDate < now) {
        errors.schedule = "Interview schedule cannot be in the past";
      }
    }
    
    // Validate questionsAskedToCandidate - always validate when clicking button
    // Show error if empty, or if value is invalid
    if (!form.questionsAskedToCandidate || form.questionsAskedToCandidate === "") {
      errors.questionsAskedToCandidate = "Questions asked is required";
    } else {
      const questionCount = parseInt(form.questionsAskedToCandidate);
      if (isNaN(questionCount) || questionCount < 0) {
        errors.questionsAskedToCandidate = "Questions asked must be a positive number";
      } else if (selectedPositionQuestionCount !== null && questionCount > selectedPositionQuestionCount) {
        if (selectedPositionQuestionCount === 0) {
          errors.questionsAskedToCandidate = "No questions available for this position yet. Please add questions first.";
        } else {
          errors.questionsAskedToCandidate = `Only ${selectedPositionQuestionCount} question${selectedPositionQuestionCount !== 1 ? 's' : ''} available for this position. Not enough questions.`;
        }
      }
      
      // Validate technicalQuestions and logicalQuestions when questionsAskedToCandidate is filled
      if (!form.technicalQuestions || form.technicalQuestions === "") {
        errors.technicalQuestions = "Technical questions are required";
      } else {
        const technicalCount = parseInt(form.technicalQuestions);
        if (isNaN(technicalCount) || technicalCount < 0) {
          errors.technicalQuestions = "Technical questions must be a positive number";
        }
      }
      
      if (!form.logicalQuestions || form.logicalQuestions === "") {
        errors.logicalQuestions = "Logical questions are required";
      } else {
        const logicalCount = parseInt(form.logicalQuestions);
        if (isNaN(logicalCount) || logicalCount < 0) {
          errors.logicalQuestions = "Logical questions must be a positive number";
        }
      }
    }
    
    // Also validate using validateField to ensure fieldErrors state is updated
    // This ensures consistency between errors object and fieldErrors state
    validateField("questionsAskedToCandidate", form.questionsAskedToCandidate || "");
    
    // Set all validation errors at once
    // Merge with existing fieldErrors to preserve any errors from validateField
    setFieldErrors((prevErrors) => ({ ...prevErrors, ...errors }));

    if (Object.keys(errors).length > 0) return;

    setIsAddingCandidate(true);
    try {
      const res = await api.post("/hr", form);
      const newCandidate = res.data;
      
      // Add new candidate at the beginning of the list
      setCandidates([newCandidate, ...candidates]);
      
      // Clear form and close modal
      setForm({});
      setFieldErrors({});
      setGeneralError("");
      setIsAddModalOpen(false);
      
      // Refresh the list to get updated data
      fetchCandidates();
      
      // Show success message
      console.log("Candidate added successfully:", newCandidate.name);
    } catch (err) {
      console.error("Failed to add candidate:", err);
      setGeneralError(err.response?.data?.message || "Failed to add candidate");
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    // Validate schedule if it's being updated
    if (form.schedule && form.schedule !== originalForm.schedule) {
      const selectedDate = new Date(form.schedule);
      const now = new Date();
      if (selectedDate < now) {
        setFieldErrors({ schedule: "Interview schedule cannot be in the past" });
        return;
      }
    }

    const changedFields = {};
    Object.keys(form).forEach((key) => {
      if (form[key] !== originalForm[key]) {
        changedFields[key] = form[key];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      console.log("No changes detected");
      return;
    }

    try {
      const res = await api.patch(`/hr/${editingId}`, changedFields);
      setCandidates((prev) =>
        prev.map((candidate) => (candidate._id === editingId ? res.data : candidate))
      );
      setEditingId(null);
      setForm({});
      setOriginalForm({});
      // Refresh the list
      fetchCandidates();
    } catch (err) {
      console.error("Failed to update candidate:", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/hr/${deleteId}`);
      setCandidates(candidates.filter((c) => c._id !== deleteId));
      setDeleteId(null);
      // Refresh the list
      fetchCandidates();
    } catch (err) {
      console.error("Failed to delete candidate:", err);
    }
  };

  // Bulk selection functions
  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      const newSelection = prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId];
      
      // Update showBulkDelete based on selection
      setShowBulkDelete(newSelection.length > 0);
      
      // Update isAllSelected state
      setIsAllSelected(newSelection.length === candidates.length);
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected || selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
      setShowBulkDelete(false);
      setIsAllSelected(false);
    } else {
      const allIds = candidates.map(c => c._id);
      setSelectedCandidates(allIds);
      setShowBulkDelete(true);
      setIsAllSelected(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCandidates.length === 0) return;
    
    try {
      await api.delete('/hr/bulk', {
        data: { candidateIds: selectedCandidates }
      });
      
      // Update local state
      setCandidates(candidates.filter(c => !selectedCandidates.includes(c._id)));
      
      // Reset selection
      setSelectedCandidates([]);
      setShowBulkDelete(false);
      setIsAllSelected(false);
      setShowBulkDeleteConfirm(false);
      
      // Refresh the list
      fetchCandidates();
    } catch (err) {
      console.error("Failed to delete candidates:", err);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      position: "",
      experience: "",
      status: ""
    });
    setCurrentPage(1);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setRowsPerPage(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading && candidates.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Candidate Management</h1>
              <p className="text-slate-600 mt-1">Manage and track all candidates in your system</p>
            </div>
            <div className="flex items-center gap-3">
              {/* <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="h-10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
                {(filters.position || filters.experience || filters.status) && (
                  <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </Button> */}
              <Dialog
                open={isAddModalOpen}
                onOpenChange={(open) => {
                  setIsAddModalOpen(open);
                  if (open) {
                    setForm({});
                    setFieldErrors({});
                    setGeneralError("");
                    setSelectedPositionQuestionCount(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button 
                    className="h-10 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Candidate
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={form.name || ""}
                        onChange={(e) => {
                          handleChange(e);
                          validateField("name", e.target.value);
                        }}
                        className={fieldErrors.name ? "border-red-500" : ""}
                      />
                      {fieldErrors.name && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email || ""}
                        onChange={(e) => {
                          handleChange(e);
                          validateField("email", e.target.value);
                        }}
                        className={fieldErrors.email ? "border-red-500" : ""}
                      />
                      {fieldErrors.email && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="1234567890"
                        value={form.phone || ""}
                        onChange={(e) => {
                          handleChange(e);
                          validateField("phone", e.target.value);
                        }}
                        className={fieldErrors.phone ? "border-red-500" : ""}
                      />
                      {fieldErrors.phone && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level *</Label>
                      <Select
                        value={form.experience || ""}
                        onValueChange={(value) => {
                          setForm((prev) => ({ ...prev, experience: value }));
                          validateField("experience", value);
                        }}
                      >
                        <SelectTrigger className={fieldErrors.experience ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                          <SelectItem value="1-2">1-2 Years</SelectItem>
                          <SelectItem value="3-5">3-5 Years</SelectItem>
                          <SelectItem value="5+">5+ Years</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldErrors.experience && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.experience}
                        </p>
                      )}
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Select
                        value={form.position || ""}
                        onValueChange={(value) => {
                          const selectedPos = positions.find(p => p._id === value);
                          setSelectedPositionQuestionCount(selectedPos?.questionCount || 0);
                          setForm((prev) => ({ ...prev, position: value }));
                          validateField("position", value);
                          // Re-validate questionsAskedToCandidate if it exists
                          if (form.questionsAskedToCandidate) {
                            validateField("questionsAskedToCandidate", form.questionsAskedToCandidate);
                          }
                        }}
                      >
                        <SelectTrigger className={fieldErrors.position ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos._id} value={pos._id}>
                              {pos.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldErrors.position && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.position}
                        </p>
                      )}
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2">
                      <Label htmlFor="schedule">Interview Schedule *</Label>
                      <Input
                        id="schedule"
                        name="schedule"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        value={form.schedule || ""}
                        onChange={(e) => {
                          handleChange(e);
                          validateField("schedule", e.target.value);
                        }}
                        className={fieldErrors.schedule ? "border-red-500" : ""}
                      />
                      {fieldErrors.schedule && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.schedule}
                        </p>
                      )}
                    </div>

                    {/* Questions Asked To Candidate */}
                    <div className="space-y-2">
                      <Label htmlFor="questionsAskedToCandidate">Questions Asked To Candidate *</Label>
                      <Input
                        id="questionsAskedToCandidate"
                        name="questionsAskedToCandidate"
                        type="number"
                        min="0"
                        placeholder="Enter number of questions"
                        value={form.questionsAskedToCandidate || ""}
                        onChange={(e) => {
                          handleChange(e);
                          validateField("questionsAskedToCandidate", e.target.value);
                        }}
                        className={fieldErrors.questionsAskedToCandidate ? "border-red-500" : ""}
                      />
                      {selectedPositionQuestionCount !== null && (
                        <p className="text-xs text-slate-500">
                          Available questions for selected position {selectedPositionQuestionCount}
                        </p>
                      )}
                      {fieldErrors.questionsAskedToCandidate && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.questionsAskedToCandidate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Technical and Logical Questions Section - Show when questionsAskedToCandidate has a value */}
                  {form.questionsAskedToCandidate && form.questionsAskedToCandidate !== "" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                      <div className="space-y-2">
                        <Label htmlFor="technicalQuestions">Technical Questions</Label>
                        <Input
                          id="technicalQuestions"
                          name="technicalQuestions"
                          type="number"
                          min="0"
                          placeholder="Enter number of technical questions"
                          value={form.technicalQuestions || ""}
                          onChange={(e) => {
                            handleChange(e);
                            validateField("technicalQuestions", e.target.value);
                          }}
                          className={fieldErrors.technicalQuestions ? "border-red-500" : ""}
                        />
                        {fieldErrors.technicalQuestions && (
                          <p className="flex items-center gap-1 text-sm text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.technicalQuestions}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logicalQuestions">Logical Questions</Label>
                        <Input
                          id="logicalQuestions"
                          name="logicalQuestions"
                          type="number"
                          min="0"
                          placeholder="Enter number of logical questions"
                          value={form.logicalQuestions || ""}
                          onChange={(e) => {
                            handleChange(e);
                            validateField("logicalQuestions", e.target.value);
                          }}
                          className={fieldErrors.logicalQuestions ? "border-red-500" : ""}
                        />
                        {fieldErrors.logicalQuestions && (
                          <p className="flex items-center gap-1 text-sm text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.logicalQuestions}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* General error */}
                  {generalError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{generalError}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setForm({});
                      setFieldErrors({});
                      setGeneralError("");
                      setIsAddModalOpen(false);
                    }}
                    disabled={isAddingCandidate}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAdd} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isAddingCandidate}
                  >
                    {isAddingCandidate ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding Candidate...
                      </>
                    ) : (
                      "Add Candidate"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Candidates</p>
                  <p className="text-3xl font-bold text-blue-900">{totalCandidates}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Scheduled</p>
                  <p className="text-3xl font-bold text-green-900">
                    {candidates.filter(c => c.schedule && new Date(c.schedule) > new Date()).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Experienced</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {candidates.filter(c => c.experience && c.experience !== 'fresher').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">With Resume</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {candidates.filter(c => c.resume).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-80 h-10"
                  />
                </div>
                
                {/* Quick Position Filter */}
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium text-slate-700 whitespace-nowrap">Position:</Label>
                  <Select 
                    value={filters.position || "all"} 
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, position: value === "all" ? "" : value }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className={`w-48 h-10 ${filters.position ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos._id} value={pos._id}>{pos.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Clear Position Filter */}
                  {filters.position && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, position: "" }));
                        setCurrentPage(1);
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Showing {candidates.length} of {totalCandidates} candidates
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        {/* {showFilters && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-700">Filter Options</h3>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Position</Label>
                    <Select 
                      value={filters.position || "all"} 
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, position: value === "all" ? "" : value }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Positions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {positions.map((pos) => (
                          <SelectItem key={pos._id} value={pos._id}>
                            {pos.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Experience</Label>
                    <Select 
                      value={filters.experience || "all"} 
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, experience: value === "all" ? "" : value }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Experience Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Experience Levels</SelectItem>
                        <SelectItem value="fresher">Fresher</SelectItem>
                        <SelectItem value="1-2">1-2 Years</SelectItem>
                        <SelectItem value="3-5">3-5 Years</SelectItem>
                        <SelectItem value="5+">5+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Status</Label>
                    <Select 
                      value={filters.status || "all"} 
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Candidates Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">All Candidates</CardTitle>
                <CardDescription>
                  Manage and view all candidate information
                </CardDescription>
              </div>
              
              {/* Bulk Delete Button - Inline with heading */}
              {showBulkDelete && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCandidates([]);
                        setShowBulkDelete(false);
                        setIsAllSelected(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowBulkDeleteConfirm(true)}
                    >
                      Delete {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No candidates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Candidate</TableHead>
                      <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                      <TableHead className="font-semibold text-slate-700">Experience</TableHead>
                      <TableHead className="font-semibold text-slate-700">Position</TableHead>
                      <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                      <TableHead className="font-semibold text-slate-700">Questions Asked</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate._id} className="hover:bg-slate-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedCandidates.includes(candidate._id)}
                            onCheckedChange={() => handleSelectCandidate(candidate._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{candidate.name || 'N/A'}</p>
                            <p className="text-sm text-slate-500">ID: {candidate._id?.slice(-8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="text-sm text-slate-600">{candidate.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="text-sm text-slate-600">{candidate.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getExperienceBadgeVariant(candidate.experience)}>
                            {getExperienceDisplayText(candidate.experience)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {candidate.positionName || positions.find(p => p._id === candidate.position)?.name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {formatDate(candidate.schedule)}
                              </span>
                            </div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScheduleStatus(candidate.isSubmitted).bg} ${getScheduleStatus(candidate.isSubmitted).color}`}>
                              {getScheduleStatus(candidate.isSubmitted).status}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">
                              {candidate.questionsAskedToCandidate !== undefined && candidate.questionsAskedToCandidate !== null 
                                ? candidate.questionsAskedToCandidate 
                                : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Modal */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setEditingId(candidate._id);
                                    setForm(candidate);
                                    setOriginalForm(candidate);
                                    // Set question count for the candidate's position
                                    const candidatePos = positions.find(p => p._id === candidate.position);
                                    if (candidatePos) {
                                      setSelectedPositionQuestionCount(candidatePos.questionCount || 0);
                                    }
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Edit2 className="w-5 h-5" />
                                    Edit Candidate
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Full Name *</Label>
                                      <Input
                                        id="edit-name"
                                        name="name"
                                        value={form.name || ""}
                                        onChange={handleChange}
                                        className={fieldErrors.name ? "border-red-500" : ""}
                                      />
                                      {fieldErrors.name && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          {fieldErrors.name}
                                        </p>
                                      )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">Email Address *</Label>
                                      <Input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        value={form.email || ""}
                                        onChange={handleChange}
                                        className={fieldErrors.email ? "border-red-500" : ""}
                                      />
                                      {fieldErrors.email && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          {fieldErrors.email}
                                        </p>
                                      )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-phone">Phone Number *</Label>
                                      <Input
                                        id="edit-phone"
                                        name="phone"
                                        value={form.phone || ""}
                                        onChange={handleChange}
                                        className={fieldErrors.phone ? "border-red-500" : ""}
                                      />
                                      {fieldErrors.phone && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          {fieldErrors.phone}
                                        </p>
                                      )}
                                    </div>

                                    {/* Experience */}
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-experience">Experience Level *</Label>
                                      <Select
                                        value={form.experience || ""}
                                        onValueChange={(value) => {
                                          setForm((prev) => ({ ...prev, experience: value }));
                                          validateField("experience", value);
                                        }}
                                      >
                                        <SelectTrigger className={fieldErrors.experience ? "border-red-500" : ""}>
                                          <SelectValue placeholder="Select experience level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                                          <SelectItem value="1-2">1-2 Years</SelectItem>
                                          <SelectItem value="3-5">3-5 Years</SelectItem>
                                          <SelectItem value="5+">5+ Years</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {fieldErrors.experience && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          {fieldErrors.experience}
                                        </p>
                                      )}
                                    </div>

                                    {/* Position */}
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-position">Position *</Label>
                                      <Select
                                        value={form.position || ""}
                                        onValueChange={(value) => {
                                          const selectedPos = positions.find(p => p._id === value);
                                          setSelectedPositionQuestionCount(selectedPos?.questionCount || 0);
                                          setForm((prev) => ({ ...prev, position: value }));
                                          validateField("position", value);
                                          // Re-validate questionsAskedToCandidate if it exists
                                          if (form.questionsAskedToCandidate) {
                                            validateField("questionsAskedToCandidate", form.questionsAskedToCandidate);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className={fieldErrors.position ? "border-red-500" : ""}>
                                          <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {positions.map((pos) => (
                                            <SelectItem key={pos._id} value={pos._id}>
                                              {pos.name} 
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {fieldErrors.position && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          {fieldErrors.position}
                                        </p>
                                      )}
                                    </div>

                                    {/* Schedule */}
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-schedule">Interview Schedule *</Label>
                                      <Input
                                        id="edit-schedule"
                                        name="schedule"
                                        type="datetime-local"
                                        min={new Date().toISOString().slice(0, 16)}
                                        value={form.schedule || ""}
                                        onChange={(e) => {
                                          handleChange(e);
                                          validateField("schedule", e.target.value);
                                        }}
                                        className={fieldErrors.schedule ? "border-red-500" : ""}
                                      />
                                      {fieldErrors.schedule && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          {fieldErrors.schedule}
                                        </p>
                                      )}
                                    </div>

                                    {/* Questions Asked To Candidate */}
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-questionsAskedToCandidate">Questions Asked To Candidate *</Label>
                                      <Input
                                        id="edit-questionsAskedToCandidate"
                                        name="questionsAskedToCandidate"
                                        type="number"
                                        min="0"
                                        placeholder="Enter number of questions"
                                        value={form.questionsAskedToCandidate || ""}
                                        onChange={(e) => {
                                          handleChange(e);
                                          validateField("questionsAskedToCandidate", e.target.value);
                                        }}
                                        className={fieldErrors.questionsAskedToCandidate ? "border-red-500" : ""}
                                      />
                                      {selectedPositionQuestionCount !== null && (
                                        <p className="text-xs text-slate-500">
                                          Available questions for selected position: {selectedPositionQuestionCount}
                                        </p>
                                      )}
                                      {fieldErrors.questionsAskedToCandidate && (
                                        <p className="flex items-center gap-1 text-sm text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          {fieldErrors.questionsAskedToCandidate}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Technical and Logical Questions Section - Show when questionsAskedToCandidate has a value */}
                                  {form.questionsAskedToCandidate && form.questionsAskedToCandidate !== "" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-technicalQuestions">Technical Questions</Label>
                                        <Input
                                          id="edit-technicalQuestions"
                                          name="technicalQuestions"
                                          type="number"
                                          min="0"
                                          placeholder="Enter number of technical questions"
                                          value={form.technicalQuestions || ""}
                                          onChange={(e) => {
                                            handleChange(e);
                                            validateField("technicalQuestions", e.target.value);
                                          }}
                                          className={fieldErrors.technicalQuestions ? "border-red-500" : ""}
                                        />
                                        {fieldErrors.technicalQuestions && (
                                          <p className="flex items-center gap-1 text-sm text-red-600">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.technicalQuestions}
                                          </p>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-logicalQuestions">Logical Questions</Label>
                                        <Input
                                          id="edit-logicalQuestions"
                                          name="logicalQuestions"
                                          type="number"
                                          min="0"
                                          placeholder="Enter number of logical questions"
                                          value={form.logicalQuestions || ""}
                                          onChange={(e) => {
                                            handleChange(e);
                                            validateField("logicalQuestions", e.target.value);
                                          }}
                                          className={fieldErrors.logicalQuestions ? "border-red-500" : ""}
                                        />
                                        {fieldErrors.logicalQuestions && (
                                          <p className="flex items-center gap-1 text-sm text-red-600">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.logicalQuestions}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditingId(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                                    Update Candidate
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Delete Button */}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setDeleteId(candidate._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>

                            {/* Delete Confirmation Modal */}
                            <Dialog
                              open={deleteId === candidate._id}
                              onOpenChange={() => setDeleteId(null)}
                            >
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Delete</DialogTitle>
                                </DialogHeader>
                                <p>Are you sure you want to delete <strong>{candidate.name}</strong>? This action cannot be undone.</p>
                                <DialogFooter className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeleteId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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

        {/* Bulk Delete Confirmation Modal */}
        <Dialog
          open={showBulkDeleteConfirm}
          onOpenChange={() => setShowBulkDeleteConfirm(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk Delete</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete <strong>{selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''}</strong>? 
              This action cannot be undone.
            </p>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Delete {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pagination */}
        {candidates.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalCandidates)} of {totalCandidates} candidates
              </div>
              
              {/* Page Size Dropdown */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-slate-700 whitespace-nowrap">Show:</Label>
                <Select 
                  value={rowsPerPage.toString()} 
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-500">per page</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-8"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm font-medium px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-8"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

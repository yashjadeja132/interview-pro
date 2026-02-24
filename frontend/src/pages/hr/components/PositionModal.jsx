import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit3, AlertCircle, CheckCircle2, AlertTriangle, Loader2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axiosInstance from "@/Api/axiosInstance";

export default function PositionModal({ isOpen, onClose, initialData, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    salary: "",
    jobType: "",
    experienceYears: "",
    experienceMonths: "",
    vacancies: "",
    shift: "Day Shift",
    testDuration: "",
    questionCount: "",
    techQuestionCount: "",
    nonTechQuestionCount: "",
    subjects: [],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [availableCounts, setAvailableCounts] = useState({ tech: null, nonTech: null, total: null });
  const [loadingCounts, setLoadingCounts] = useState(false);
  const countsAbortRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          name: initialData.name || "",
          salary: initialData.salary || "",
          jobType: initialData.jobType || "",
          experienceYears: initialData.experience?.match(/(\d+)\s*year/)?.[1] || "0",
          experienceMonths: initialData.experience?.match(/(\d+)\s*month/)?.[1] || "0",
          vacancies: initialData.vacancies || "",
          shift: initialData.shift || "Day Shift",
          testDuration: initialData.testDuration || "",
          questionCount: initialData.questionCount || "",
          techQuestionCount: initialData.techQuestionCount || "",
          nonTechQuestionCount: initialData.nonTechQuestionCount || "",
          subjects: initialData.subjects?.map(s => s._id || s) || [],
        });
      } else {
        setForm({
          name: "",
          salary: "",
          jobType: "",
          experienceYears: "",
          experienceMonths: "",
          vacancies: "",
          shift: "Day Shift",
          testDuration: "",
          questionCount: "",
          techQuestionCount: "",
          nonTechQuestionCount: "",
          subjects: [],
        });
      }
      setFieldErrors({});
      setGeneralError("");
      fetchSubjects();
    }
  }, [isOpen, initialData]);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await axiosInstance.get("/subject?limit=100");
      if (response.data.success) {
        setSubjectsList(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch available question counts whenever subjects change
  const fetchQuestionCounts = useCallback(async (subjectIds) => {
    if (!subjectIds || subjectIds.length === 0) {
      setAvailableCounts({ tech: null, nonTech: null, total: null });
      return;
    }
    // Cancel previous request
    if (countsAbortRef.current) countsAbortRef.current.abort();
    const controller = new AbortController();
    countsAbortRef.current = controller;

    try {
      setLoadingCounts(true);
      const res = await axiosInstance.post("/position/question-counts", { subjects: subjectIds }, { signal: controller.signal });
      if (res.data.success) {
        setAvailableCounts({
          tech: res.data.data.technicalQuestionCount,
          nonTech: res.data.data.nonTechnicalQuestionCount,
          total: res.data.data.totalAvailable,
        });
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error("Failed to fetch question counts:", err);
      }
    } finally {
      setLoadingCounts(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && form.subjects.length > 0) {
      fetchQuestionCounts(form.subjects);
    } else {
      setAvailableCounts({ tech: null, nonTech: null, total: null });
    }
  }, [isOpen, form.subjects, fetchQuestionCounts]);

  // Helper to get question count validation status for a field
  const getCountStatus = (field) => {
    const entered = Number(form[field]) || 0;
    const available = field === 'techQuestionCount' ? availableCounts.tech : availableCounts.nonTech;
    const label = field === 'techQuestionCount' ? 'technical' : 'non-technical';

    if (form.subjects.length === 0) {
      return { type: 'info', message: 'Select subjects first' };
    }
    if (loadingCounts) {
      return { type: 'loading', message: 'Checking...' };
    }
    if (available === null) return null;
    if (available === 0) {
      return { type: 'error', message: `No ${label} questions in database for selected subjects` };
    }
    if (!form[field] || entered === 0) {
      return { type: 'info', message: `${available} ${label} questions available` };
    }
    if (entered > available) {
      return { type: 'error', message: `Only ${available} ${label} questions available (you entered ${entered})` };
    }
    return { type: 'success', message: `${available} available` };
  };

  // Total count validation
  const getTotalCountStatus = () => {
    if (form.subjects.length === 0 || loadingCounts || availableCounts.total === null) return null;
    const techEntered = Number(form.techQuestionCount) || 0;
    const nonTechEntered = Number(form.nonTechQuestionCount) || 0;
    const totalEntered = techEntered + nonTechEntered;
    if (totalEntered === 0) return null;
    if (totalEntered > availableCounts.total) {
      return { type: 'error', message: `Total questions (${totalEntered}) exceed available in database (${availableCounts.total})` };
    }
    return { type: 'success', message: `Total: ${totalEntered} of ${availableCounts.total} available` };
  };

  // Check if selected subjects have the right types for entered counts
  const getSubjectTypeWarning = () => {
    if (form.subjects.length === 0 || loadingCounts || availableCounts.tech === null) return null;
    const warnings = [];
    const techEntered = Number(form.techQuestionCount) || 0;
    const nonTechEntered = Number(form.nonTechQuestionCount) || 0;
    if (techEntered > 0 && availableCounts.tech === 0) {
      warnings.push('You entered technical questions but no technical subjects are selected/have questions');
    }
    if (nonTechEntered > 0 && availableCounts.nonTech === 0) {
      warnings.push('You entered non-technical questions but no non-technical subjects are selected/have questions');
    }
    return warnings.length > 0 ? warnings : null;
  };

  // 🔍 Validation logic (similar to CandidateModal)
  const validateField = (name, value) => {
    let message = "";

    if (name === "name" && !value.trim()) message = "Position name is required";
    if (name === "salary") {
      if (!value) message = "Salary is required";
      else if (isNaN(value) || Number(value) <= 0) message = "Enter a valid positive number";
    }
    if ((name === "experienceYears" || name === "experienceMonths")) {
      const years = parseInt(form.experienceYears || (name === "experienceYears" ? value : 0));
      const months = parseInt(form.experienceMonths || (name === "experienceMonths" ? value : 0));
      if (years === 0 && months === 0) message = "Experience cannot be 0";

      setFieldErrors((prev) => ({ ...prev, experience: message }));
      return message;
    }
    if (name === "vacancies") {
      if (!value) message = "Vacancies are required";
      else if (!Number.isInteger(Number(value)) || Number(value) <= 0)
        message = "Must be a positive integer";
    }
    if (name === "jobType" && !value.trim()) message = "Job type is required";
    if (name === "shift" && !value.trim()) message = "Shift is required";
    if (name === "testDuration" && !value) message = "Test duration is required";
    if (name === "questionCount" && !value) message = "Total questions count is required";
    if (name === "techQuestionCount" && value === "") message = "Technical count is required";
    if (name === "nonTechQuestionCount" && value === "") message = "Non-technical count is required";
    if (name === "subjects" && (!value || value.length === 0)) message = "At least one subject is required";

    setFieldErrors((prev) => ({ ...prev, [name]: message }));
    return message;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Restriction: Position Name - no numbers allowed
    if (name === "name") {
      value = value.replace(/[^a-zA-Z0-9\-]/g, "");
    }

    // Restriction: Salary and Vacancies - only numbers
    if (["salary", "vacancies", "testDuration", "techQuestionCount", "nonTechQuestionCount"].includes(name)) {
      value = value.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubjectToggle = (subjectId) => {
    setForm((prev) => {
      const newSubjects = prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId];

      validateField("subjects", newSubjects);
      return { ...prev, subjects: newSubjects };
    });
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async () => {
    const fieldsToValidate = ["name", "salary", "jobType", "experienceYears", "experienceMonths", "vacancies", "shift", "testDuration", "techQuestionCount", "nonTechQuestionCount", "subjects"];
    const errors = {};

    fieldsToValidate.forEach((field) => {
      const msg = validateField(field, form[field]);
      if (msg) errors[field] = msg;
    });

    // Validate against available counts
    const tech = Number(form.techQuestionCount) || 0;
    const nonTech = Number(form.nonTechQuestionCount) || 0;

    if (availableCounts.tech !== null && tech > availableCounts.tech) {
      errors.techQuestionCount = `Only ${availableCounts.tech} technical questions available`;
    }
    if (availableCounts.nonTech !== null && nonTech > availableCounts.nonTech) {
      errors.nonTechQuestionCount = `Only ${availableCounts.nonTech} non-technical questions available`;
    }
    if (availableCounts.total !== null && (tech + nonTech) > availableCounts.total) {
      errors.techQuestionCount = errors.techQuestionCount || `Total (${tech + nonTech}) exceeds available (${availableCounts.total})`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      const payload = {
        ...form,
        salary: Number(form.salary),
        vacancies: Number(form.vacancies),
        testDuration: Number(form.testDuration),
        questionCount: Number(form.techQuestionCount) + Number(form.nonTechQuestionCount),
        techQuestionCount: Number(form.techQuestionCount),
        nonTechQuestionCount: Number(form.nonTechQuestionCount),
      };

      if (initialData?._id) {
        await axiosInstance.put(`/position/${initialData._id}`, payload);
        toast.success("Position updated successfully");
      } else {
        await axiosInstance.post("/position", payload);
        toast.success("Position added successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      //   setGeneralError(err.response?.data?.message || "Failed to save position");
      toast.error("Failed to save position");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = () => {
    if (!initialData) return true; // Always allow adding new

    // Normalize subjects for comparison (array of IDs, sorted)
    const initialSubjectIds = (initialData.subjects || []).map(s => s._id || s).sort();
    const currentSubjectIds = [...form.subjects].sort();

    return (
      form.name !== (initialData.name || "") ||
      String(form.salary) !== String(initialData.salary || "") ||
      form.jobType !== (initialData.jobType || "") ||
      form.experienceYears !== (initialData.experience?.match(/(\d+)\s*year/)?.[1] || "0") ||
      form.experienceMonths !== (initialData.experience?.match(/(\d+)\s*month/)?.[1] || "0") ||
      String(form.vacancies) !== String(initialData.vacancies || "") ||
      form.shift !== (initialData.shift || "Day Shift") ||
      String(form.testDuration) !== String(initialData.testDuration || "") ||
      String(form.techQuestionCount) !== String(initialData.techQuestionCount || "0") ||
      String(form.nonTechQuestionCount) !== String(initialData.nonTechQuestionCount || "0") ||
      JSON.stringify(currentSubjectIds) !== JSON.stringify(initialSubjectIds)
    );
  };

  const techSubjects = subjectsList.filter((s) => s.type === 1);
  const nonTechSubjects = subjectsList.filter((s) => s.type === 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800 pm-modal-content">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold dark:text-white flex items-center gap-2">
            {initialData ? (
              <Edit3 className="w-5 h-5 text-blue-500" />
            ) : (
              <Plus className="w-5 h-5 text-blue-500" />
            )}
            {initialData ? "Edit Job Position" : "Add New Job Position"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">

          {/* Position Name + Salary  */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Position Name *
              </label>
              <Input
                name="name"
                placeholder="e.g., Software Engineer"
                value={form.name}
                onChange={handleChange}
                disabled={initialData?.hasCandidates}
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.name ? "border-red-500" : ""
                  } ${initialData?.hasCandidates ? "opacity-70 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50" : ""}`}
              />
              {initialData?.hasCandidates && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                  <Info className="w-3 h-3" />
                  Editing name is disabled because candidates have applied
                </p>
              )}
              {fieldErrors.name && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Salary *
              </label>
              <Input
                name="salary"
                type="number"
                placeholder="e.g., 50000"
                value={form.salary}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.salary ? "border-red-500" : ""
                  }`}
              />
              {fieldErrors.salary && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.salary}
                </p>
              )}
            </div>

          </div>
          {/* vacancies + Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Vacancies *
              </label>
              <Input
                name="vacancies"
                type="number"
                placeholder="e.g., 1"
                value={form.vacancies}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.vacancies ? "border-red-500" : ""
                  }`}
              />
              {fieldErrors.vacancies && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.vacancies}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Experience *
              </label>
              <div className="flex gap-3">
                <Select
                  value={form.experienceYears}
                  onValueChange={(v) => handleSelectChange("experienceYears", v)}
                >
                  <SelectTrigger
                    className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.experience ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Years" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 border-slate-700">
                    {[...Array(11)].map((_, i) => (
                      <SelectItem key={i} value={String(i)}>{i} {i === 1 ? 'Year' : 'Years'}{i === 10 ? '+' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={form.experienceMonths}
                  onValueChange={(v) => handleSelectChange("experienceMonths", v)}
                >
                  <SelectTrigger
                    className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.experience ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Months" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 border-slate-700">
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i} value={String(i)}>{i} {i === 1 ? 'Month' : 'Months'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {fieldErrors.experience && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.experience}
                </p>
              )}
            </div>
          </div>

          {/*  Job Type + duration*/}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Job Type *
              </label>
              <Select
                value={form.jobType}
                onValueChange={(v) => handleSelectChange("jobType", v)}
              >
                <SelectTrigger
                  className={`w-full h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.jobType ? "border-red-500" : ""
                    }`}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 border-slate-700">
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.jobType && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.jobType}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration (min) *
              </label>
              <Input
                name="testDuration"
                type="number"
                placeholder="e.g., 60"
                value={form.testDuration}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.testDuration ? "border-red-500" : ""}`}
              />
              {fieldErrors.testDuration && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.testDuration}
                </p>
              )}
            </div>
          </div>

          {/* Subjects Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Subjects *
            </label>
            <div className="border rounded-lg p-4 dark:border-slate-700">
              <Tabs defaultValue="technical" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="non-technical">Non Technical</TabsTrigger>
                </TabsList>
                <TabsContent value="technical" className="mt-0">
                  <div className="grid grid-cols-2 gap-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {techSubjects.map((subject) => {
                      const hasQuestions = subject.questionCount > 0;
                      return (
                        <div key={subject._id} className={`flex items-center space-x-2 ${!hasQuestions ? 'opacity-50' : ''}`}>
                          <Checkbox
                            id={subject._id}
                            checked={form.subjects.includes(subject._id)}
                            onCheckedChange={() => handleSubjectToggle(subject._id)}
                            disabled={!hasQuestions}
                          />
                          <label
                            htmlFor={subject._id}
                            className={`text-sm dark:text-slate-300 ${hasQuestions ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          >
                            {subject.name}
                            {!hasQuestions && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">(No questions)</span>}
                          </label>
                        </div>
                      );
                    })}
                    {techSubjects.length === 0 && !loadingSubjects && (
                      <p className="text-xs text-slate-500 col-span-2 italic">No technical subjects found.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="non-technical" className="mt-0">
                  <div className="grid grid-cols-2 gap-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {nonTechSubjects.map((subject) => {
                      const hasQuestions = subject.questionCount > 0;
                      return (
                        <div key={subject._id} className={`flex items-center space-x-2 ${!hasQuestions ? 'opacity-50' : ''}`}>
                          <Checkbox
                            id={subject._id}
                            checked={form.subjects.includes(subject._id)}
                            onCheckedChange={() => handleSubjectToggle(subject._id)}
                            disabled={!hasQuestions}
                          />
                          <label
                            htmlFor={subject._id}
                            className={`text-sm dark:text-slate-300 ${hasQuestions ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          >
                            {subject.name}
                            {!hasQuestions && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">(No questions)</span>}
                          </label>
                        </div>
                      );
                    })}
                    {nonTechSubjects.length === 0 && !loadingSubjects && (
                      <p className="text-xs text-slate-500 col-span-2 italic">No non-technical subjects found.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            {fieldErrors.subjects && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.subjects}
              </p>
            )}
            {/* Selected Subjects Display */}
            <div className="flex flex-wrap gap-2 mt-2">
              {form.subjects.map((subId) => {
                const sub = subjectsList.find((s) => s._id === subId);
                return sub ? (
                  <Badge key={subId} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none">
                    {sub.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
          {/* General Error */}
          {generalError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
            </div>
          )}

          {/* Question Counts with Live Validation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tech Questions *
              </label>
              <Input
                name="techQuestionCount"
                type="number"
                placeholder="Tech"
                value={form.techQuestionCount}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.techQuestionCount ? "border-red-500" : getCountStatus('techQuestionCount')?.type === 'error' ? "border-amber-500" : getCountStatus('techQuestionCount')?.type === 'success' ? "border-green-500" : ""}`}
              />
              {fieldErrors.techQuestionCount && (
                <p className="text-[10px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.techQuestionCount}
                </p>
              )}
              {!fieldErrors.techQuestionCount && (() => {
                const status = getCountStatus('techQuestionCount');
                if (!status) return null;
                if (status.type === 'loading') return (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin shrink-0" />{status.message}</p>
                );
                if (status.type === 'error') return (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />{status.message}</p>
                );
                if (status.type === 'success') return (
                  <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" />{status.message}</p>
                );
                if (status.type === 'info') return (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1"><Info className="w-3 h-3 shrink-0" />{status.message}</p>
                );
                return null;
              })()}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Non-Tech Questions *
              </label>
              <Input
                name="nonTechQuestionCount"
                type="number"
                placeholder="Non-Tech"
                value={form.nonTechQuestionCount}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.nonTechQuestionCount ? "border-red-500" : getCountStatus('nonTechQuestionCount')?.type === 'error' ? "border-amber-500" : getCountStatus('nonTechQuestionCount')?.type === 'success' ? "border-green-500" : ""}`}
              />
              {fieldErrors.nonTechQuestionCount && (
                <p className="text-[10px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.nonTechQuestionCount}
                </p>
              )}
              {!fieldErrors.nonTechQuestionCount && (() => {
                const status = getCountStatus('nonTechQuestionCount');
                if (!status) return null;
                if (status.type === 'loading') return (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin shrink-0" />{status.message}</p>
                );
                if (status.type === 'error') return (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />{status.message}</p>
                );
                if (status.type === 'success') return (
                  <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" />{status.message}</p>
                );
                if (status.type === 'info') return (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1"><Info className="w-3 h-3 shrink-0" />{status.message}</p>
                );
                return null;
              })()}
            </div>
          </div>

          {/* Total Count + Subject Type Warnings */}
          {(() => {
            const totalStatus = getTotalCountStatus();
            const subjectWarnings = getSubjectTypeWarning();
            if (!totalStatus && !subjectWarnings) return null;
            return (
              <div className="space-y-1">
                {totalStatus && (
                  <p className={`text-[11px] flex items-center gap-1 ${totalStatus.type === 'error' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                    {totalStatus.type === 'error' ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <CheckCircle2 className="w-3 h-3 shrink-0" />}
                    {totalStatus.message}
                  </p>
                )}
                {subjectWarnings && subjectWarnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />{w}
                  </p>
                ))}
              </div>
            );
          })()}

          {/* Shift */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Shift *
            </label>
            <div className="flex gap-6 h-11 items-center">
              {["Day Shift", "Night Shift"].map((shift) => (
                <div key={shift} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={shift}
                    name="shift"
                    value={shift}
                    checked={form.shift === shift}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={shift}
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {shift}
                  </label>
                </div>
              ))}
            </div>
            {fieldErrors.shift && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.shift}
              </p>
            )}
          </div>


          {/* Subjects Selection */}
          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Subjects *
            </label>
            <div className="border rounded-lg p-4 dark:border-slate-700">
              <Tabs defaultValue="technical" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="non-technical">Non Technical</TabsTrigger>
                </TabsList>
                <TabsContent value="technical" className="mt-0">
                  <div className="grid grid-cols-2 gap-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {techSubjects.map((subject) => {
                      const hasQuestions = subject.questionCount > 0;
                      return (
                        <div key={subject._id} className={`flex items-center space-x-2 ${!hasQuestions ? 'opacity-50' : ''}`}>
                          <Checkbox
                            id={subject._id}
                            checked={form.subjects.includes(subject._id)}
                            onCheckedChange={() => handleSubjectToggle(subject._id)}
                            disabled={!hasQuestions}
                          />
                          <label
                            htmlFor={subject._id}
                            className={`text-sm dark:text-slate-300 ${hasQuestions ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          >
                            {subject.name}
                            {!hasQuestions && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">(No questions)</span>}
                          </label>
                        </div>
                      );
                    })}
                    {techSubjects.length === 0 && !loadingSubjects && (
                      <p className="text-xs text-slate-500 col-span-2 italic">No technical subjects found.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="non-technical" className="mt-0">
                  <div className="grid grid-cols-2 gap-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {nonTechSubjects.map((subject) => {
                      const hasQuestions = subject.questionCount > 0;
                      return (
                        <div key={subject._id} className={`flex items-center space-x-2 ${!hasQuestions ? 'opacity-50' : ''}`}>
                          <Checkbox
                            id={subject._id}
                            checked={form.subjects.includes(subject._id)}
                            onCheckedChange={() => handleSubjectToggle(subject._id)}
                            disabled={!hasQuestions}
                          />
                          <label
                            htmlFor={subject._id}
                            className={`text-sm dark:text-slate-300 ${hasQuestions ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          >
                            {subject.name}
                            {!hasQuestions && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">(No questions)</span>}
                          </label>
                        </div>
                      );
                    })}
                    {nonTechSubjects.length === 0 && !loadingSubjects && (
                      <p className="text-xs text-slate-500 col-span-2 italic">No non-technical subjects found.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            {fieldErrors.subjects && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.subjects}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {form.subjects.map((subId) => {
                const sub = subjectsList.find((s) => s._id === subId);
                return sub ? (
                  <Badge key={subId} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none">
                    {sub.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div> */}
          {/* General Error */}
          {/* {generalError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
            </div>
          )} */}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !hasChanges()} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "Saving..." : (initialData ? "Update Job Post" : "Add Job Post")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

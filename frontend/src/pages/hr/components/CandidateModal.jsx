import { useState, useEffect, useCallback, useRef } from "react";
import {
    Plus,
    Edit2,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Info,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import api from '../../../Api/axiosInstance';
import { formatDateToIST } from "@/utils/dateHelper";
export default function CandidateModal({ isOpen, onClose, initialData, positions, onSuccess }) {
    const [form, setForm] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [duplicateData, setDuplicateData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPositionCounts, setSelectedPositionCounts] = useState(null);
    const [availableCounts, setAvailableCounts] = useState({ tech: null, nonTech: null, total: null });
    const [loadingCounts, setLoadingCounts] = useState(false);
    const [subjectsList, setSubjectsList] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const countsAbortRef = useRef(null);

    const fetchSubjects = async () => {
        try {
            setLoadingSubjects(true);
            const response = await api.get("/subject?limit=100");
            if (response.data.success) {
                setSubjectsList(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch subjects:", err);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const fetchQuestionCounts = useCallback(async (subjectIds) => {
        if (!subjectIds || subjectIds.length === 0) {
            setAvailableCounts({ tech: null, nonTech: null, total: null });
            return;
        }
        if (countsAbortRef.current) countsAbortRef.current.abort();
        const controller = new AbortController();
        countsAbortRef.current = controller;

        try {
            setLoadingCounts(true);
            const res = await api.post("/position/question-counts", { subjects: subjectIds }, { signal: controller.signal });
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
        if (isOpen) {
            fetchSubjects();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && form.position) {
            const pos = positions.find(p => p._id === form.position);
            if (pos && pos.subjects) {
                const subjectIds = pos.subjects.map(s => s._id || s);
                fetchQuestionCounts(subjectIds);
            }
        } else {
            setAvailableCounts({ tech: null, nonTech: null, total: null });
        }
    }, [isOpen, form.position, positions, fetchQuestionCounts]);

    const getCountStatus = (field) => {
        const entered = Number(form[field === 'technicalQuestions' ? 'technicalQuestions' : 'logicalQuestions']) || 0;
        const available = field === 'technicalQuestions' ? availableCounts.tech : availableCounts.nonTech;
        const preset = field === 'technicalQuestions' ? selectedPositionCounts?.technical : selectedPositionCounts?.logical;
        const label = field === 'technicalQuestions' ? 'technical' : 'non-technical';

        if (!form.position) return null;
        if (loadingCounts) return { type: 'loading', message: 'Checking...' };

        // Validation against preset (The "New Flow")
        if (preset !== undefined && entered > preset) {
            return { type: 'error', message: `Exceeds position preset of ${preset} questions` };
        }

        // Informational message about database availability
        if (available === 0) {
            return { type: 'error', message: `No ${label} questions available in database` };
        }
        if (available !== null && entered > available) {
            return { type: 'error', message: `Only ${available} questions available in database (you entered ${entered})` };
        }

        if (preset !== undefined) {
            return { type: 'info', message: `${preset} questions required by position (${available || 0} available in DB)` };
        }

        return null;
    };

    const getTotalCountStatus = () => {
        if (!form.position || loadingCounts) return null;
        const techEntered = Number(form.technicalQuestions) || 0;
        const nonTechEntered = Number(form.logicalQuestions) || 0;
        const totalEntered = techEntered + nonTechEntered;
        const totalPreset = selectedPositionCounts?.total;

        if (totalPreset !== undefined && totalEntered > totalPreset) {
            return { type: 'error', message: `Total questions (${totalEntered}) exceeds position limit (${totalPreset})` };
        }

        if (totalEntered === 0) return null;
        return { type: 'success', message: `Total: ${totalEntered} questions configured` };
    };
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Handle position - extract _id if it's an object
                const positionId = typeof initialData.position === 'object' ? initialData.position._id : initialData.position;
                // Extract years and months from "experience" string if available
                let years = "";
                let months = "";
                if (initialData.experience) {
                    const matchYears = initialData.experience.match(/(\d+)\s*year/);
                    const matchMonths = initialData.experience.match(/(\d+)\s*month/);
                    years = matchYears ? matchYears[1] : "0";
                    months = matchMonths ? matchMonths[1] : "0";
                }

                const formData = {
                    ...initialData,
                    position: positionId,
                    timeDurationForTest: initialData.timeforTest || initialData.timeDurationForTest,
                    experienceYears: years,
                    experienceMonths: months
                };

                setForm(formData);
                // Handle position question count
                const pos = positions.find(p => p._id === positionId);
                setSelectedPositionCounts(pos ? {
                    total: (pos.techQuestionCount || 0) + (pos.nonTechQuestionCount || 0),
                    technical: pos.techQuestionCount || 0,
                    logical: pos.nonTechQuestionCount || 0
                } : null);
            } else {
                setForm({});
                setSelectedPositionCounts(null);
            }
            setFieldErrors({});
            setFieldErrors({});
            setGeneralError("");
            setDuplicateData(null);
        }
    }, [isOpen, initialData, positions]);

    // Debug: Log form state whenever it changes
    useEffect(() => {
    }, [form]);

    const validateField = (name, value) => {
        let message = "";
        if (name === "name" && !value) message = "Name is required";
        if (name === "email") {
            if (!value) message = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(value)) message = "Enter a valid email";
        }
        if (name === "phone") {
            if (!value) message = "Phone is required";
            else if (!/^\d{10}$/.test(value)) message = "Enter a valid 10-digit phone";
        }
        if (name === "experience" || name === "experienceYears" || name === "experienceMonths") {
            let years = parseInt(form.experienceYears || 0);
            let months = parseInt(form.experienceMonths || 0);

            if (name === "experienceYears") years = parseInt(value || 0);
            if (name === "experienceMonths") months = parseInt(value || 0);

            if (years === 0 && months === 0) message = "Experience cannot be 0";

            // Set error on 'experience' key and return since this handles its own state update
            setFieldErrors(prev => ({ ...prev, experience: message }));
            return message;
        }
        if (name === "position" && !value) message = "Position is required";
        if (name === "schedule") {
            if (!value) message = "Schedule is required";
            else if (new Date(value) < new Date()) message = "Interview schedule cannot be in the past";
        }
        if (name === "technicalQuestions") {
            if (!value && value !== 0) message = "Technical questions is required";
            else {
                const count = parseInt(value);
                if (isNaN(count) || count < 0) message = "Must be a positive number";
            }
        }
        if (name === "logicalQuestions") {
            if (!value && value !== 0) message = "Non-Technical questions is required";
            else {
                const count = parseInt(value);
                if (isNaN(count) || count < 0) message = "Must be a positive number";
            }
        }
        if (name === "timeDurationForTest") {
            if (!value) message = "Test duration is required";
            else {
                const num = parseFloat(value);
                if (isNaN(num) || num <= 0) message = "Must be a positive number";
                else if (!Number.isInteger(num)) message = "Must be a whole number";
            }
        }
        if (name === "negativeMarkingValue" && form.isNagativeMarking) {
            if (!value) message = "Value is required";
            else if (isNaN(value)) message = "Must be a number";
        }
        if (name === "description" && !value) {
            message = "Description is required";
        }

        setFieldErrors(prev => ({ ...prev, [name]: message }));
        return message;
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Restriction: Full Name - only letters and spaces
        if (name === "name") {
            value = value.replace(/[^a-zA-Z\s]/g, "");
        }

        // Restriction: Phone Number - only numbers, max 10 digits
        if (name === "phone") {
            value = value.replace(/[^0-9]/g, "").slice(0, 10);
        }

        // Restriction: Question counts and Duration - only numbers
        if (["questionsAskedToCandidate", "technicalQuestions", "logicalQuestions", "timeDurationForTest"].includes(name)) {
            value = value.replace(/\D/g, "");
        }

        setForm(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleSubmit = async () => {
        const errors = {};
        const fieldsToValidate = [
            "name", "email", "phone", "experience", "position",
            "schedule", "technicalQuestions", "logicalQuestions", "timeDurationForTest", "description"
        ];

        fieldsToValidate.forEach(field => {
            const msg = validateField(field, form[field]);
            if (msg) errors[field] = msg;
        });

        // Validate against position presets
        const tech = Number(form.technicalQuestions) || 0;
        const nonTech = Number(form.logicalQuestions) || 0;
        const techPreset = selectedPositionCounts?.technical || 0;
        const nonTechPreset = selectedPositionCounts?.logical || 0;

        if (tech > techPreset) {
            errors.technicalQuestions = `Cannot exceed position preset of ${techPreset} questions`;
        }
        if (nonTech > nonTechPreset) {
            errors.logicalQuestions = `Cannot exceed position preset of ${nonTechPreset} questions`;
        }

        // Also cross-check with available (optional but good for UX)
        if (availableCounts.tech !== null && tech > availableCounts.tech) {
            errors.technicalQuestions = errors.technicalQuestions || `Only ${availableCounts.tech} questions available in database`;
        }
        if (availableCounts.nonTech !== null && nonTech > availableCounts.nonTech) {
            errors.logicalQuestions = errors.logicalQuestions || `Only ${availableCounts.nonTech} questions available in database`;
        }

        if (form.isNagativeMarking && !form.negativeMarkingValue) {
            errors.negativeMarkingValue = "Negative marking value is required";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setGeneralError("");
        try {
            if (initialData?._id) {
                await api.put(`/hr/${initialData._id}`, form);
            } else {
                await api.post("/hr", form);
            }
            console.log('duplicateData', duplicateData)
            onSuccess();
            onClose();
        } catch (err) {
            console.log(err.response)
            if (err.response?.status === 409 && err.response?.data?.candidate) {
                setDuplicateData(err.response.data.candidate);
                setGeneralError(err.response.data.message || "Candidate already exists");
            } else {
                setGeneralError(err.response?.data?.message || "Failed to save candidate");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanges = () => {
        if (!initialData) return true; // Always allow adding new

        // Helper to compare dates (handling potential TZ/format differences)
        const areDatesEqual = (d1, d2) => {
            if (!d1 || !d2) return d1 === d2;
            return new Date(d1).getTime() === new Date(d2).getTime();
        };

        const initialPositionId = typeof initialData.position === 'object' ? initialData.position._id : initialData.position;
        const initialTimeDuration = initialData.timeforTest || initialData.timeDurationForTest;
        return (
            form.name !== initialData.name ||
            form.email !== initialData.email ||
            form.phone !== initialData.phone ||
            form.experience !== initialData.experience ||
            form.position !== initialPositionId ||
            !areDatesEqual(form.schedule, initialData.schedule) ||
            parseInt(form.technicalQuestions || 0) !== parseInt(initialData.technicalQuestions || 0) ||
            parseInt(form.logicalQuestions || 0) !== parseInt(initialData.logicalQuestions || 0) ||
            parseInt(form.timeDurationForTest || 0) !== parseInt(initialTimeDuration || 0) ||
            !!form.isNagativeMarking !== !!initialData.isNagativeMarking ||
            String(form.negativeMarkingValue || "") !== String(initialData.negativeMarkingValue || "") ||
            String(form.description || "") !== String(initialData.description || "")
        );
    };

    // Function to handle "Yes" click - proceed with updating existing candidate
    const handleDuplicateProceed = async () => {
        if (!duplicateData) return;
        setIsSubmitting(true);
        setGeneralError("");
        try {
            // Use the duplicate candidate's ID to update
            await api.post("/hr", { ...form, allowDuplicate: true });
            onSuccess();
            onClose();
        } catch (err) {
            setGeneralError(err.response?.data?.message || "Failed to add candidate");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle "No" click - clear duplicate state
    const handleDuplicateCancel = () => {
        setDuplicateData(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 border-slate-200 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800"
            >

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-white">
                        {initialData ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {initialData ? "Edit Candidate" : "Add New Candidate"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Position */}
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Position *</Label>
                            <Select
                                value={form.position || ""}
                                onValueChange={(val) => {
                                    const pos = positions.find(p => p._id === val);
                                    setSelectedPositionCounts(pos ? {
                                        total: (pos.techQuestionCount || 0) + (pos.nonTechQuestionCount || 0),
                                        technical: pos.techQuestionCount || 0,
                                        logical: pos.nonTechQuestionCount || 0
                                    } : null);
                                    setForm(prev => ({
                                        ...prev,
                                        position: val,
                                        technicalQuestions: pos ? pos.techQuestionCount : 0,
                                        logicalQuestions: pos ? pos.nonTechQuestionCount : 0,
                                        timeDurationForTest: pos ? pos.testDuration : 0
                                    }));
                                    validateField("position", val);
                                    if (pos && pos.subjects) {
                                        fetchQuestionCounts(pos.subjects.map(s => s._id || s));
                                    }
                                }}
                            >
                                <SelectTrigger className={`w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.position ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-800 border-slate-700">
                                    {positions.map(pos => (
                                        <SelectItem key={pos._id} value={pos._id} className="dark:text-white">{pos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {fieldErrors.position && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.position}</p>}
                        </div>

                        {/* Schedule */}
                        <div className="space-y-2">
                            <Label htmlFor="schedule" className="dark:text-slate-300">Interview Schedule *</Label>
                            <Input
                                id="schedule"
                                name="schedule"
                                type="datetime-local"
                                min={new Date().toISOString().slice(0, 16)}
                                value={form.schedule ? (() => {
                                    const date = new Date(form.schedule);
                                    const offset = date.getTimezoneOffset();
                                    const localDate = new Date(date.getTime() - (offset * 60000));
                                    return localDate.toISOString().slice(0, 16);
                                })() : ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.schedule ? "border-red-500" : ""}`}
                            />
                            {fieldErrors.schedule && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.schedule}</p>}
                        </div>

                        {/* Position Fields */}
                        {/* {form.position && (
                            <>
                                <div className="space-y-2">
                                    <Label className="dark:text-slate-300">Technical Questions *</Label>
                                    <Input
                                        name="technicalQuestions"
                                        type="number"
                                        value={form.technicalQuestions ?? ""}
                                        onChange={handleChange}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.technicalQuestions ? "border-red-500" : getCountStatus('technicalQuestions')?.type === 'error' ? "border-amber-500" : getCountStatus('technicalQuestions')?.type === 'success' ? "border-green-500" : ""}`}
                                    />
                                    {fieldErrors.technicalQuestions && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.technicalQuestions}</p>}
                                    {!fieldErrors.technicalQuestions && (() => {
                                        const status = getCountStatus('technicalQuestions');
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
                                <div className="space-y-2">
                                    <Label className="dark:text-slate-300">Non-Technical *</Label>
                                    <Input
                                        name="logicalQuestions"
                                        type="number"
                                        value={form.logicalQuestions ?? ""}
                                        onChange={handleChange}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.logicalQuestions ? "border-red-500" : getCountStatus('logicalQuestions')?.type === 'error' ? "border-amber-500" : getCountStatus('logicalQuestions')?.type === 'success' ? "border-green-500" : ""}`}
                                    />
                                    {fieldErrors.logicalQuestions && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.logicalQuestions}</p>}
                                    {!fieldErrors.logicalQuestions && (() => {
                                        const status = getCountStatus('logicalQuestions');
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
                                <div className="col-span-2">
                                    {(() => {
                                        const totalStatus = getTotalCountStatus();
                                        if (!totalStatus) return null;
                                        return (
                                            <p className={`text-[11px] flex items-center gap-1 ${totalStatus.type === 'error' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                                                {totalStatus.type === 'error' ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <CheckCircle2 className="w-3 h-3 shrink-0" />}
                                                {totalStatus.message}
                                            </p>
                                        );
                                    })()}
                                </div>
                                <div className="space-y-2">
                                    <Label className="dark:text-slate-300">Test Duration (min) *</Label>
                                    <Input
                                        name="timeDurationForTest"
                                        type="number"
                                        value={form.timeDurationForTest ?? ""}
                                        onChange={handleChange}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", ".", "*", "/"].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.timeDurationForTest ? "border-red-500" : ""}`}
                                    />
                                    {fieldErrors.timeDurationForTest && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.timeDurationForTest}</p>}
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Position Subjects
                                    </label>
                                    <div className="border rounded-lg p-4 dark:border-slate-700">
                                        <Tabs defaultValue="technical" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800">
                                                <TabsTrigger value="technical">Technical</TabsTrigger>
                                                <TabsTrigger value="non-technical">Non Technical</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="technical" className="mt-0">
                                                <div className="grid grid-cols-2 gap-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                    {(() => {
                                                        const pos = positions.find(p => p._id === form.position);
                                                        const posSubjects = pos?.subjects?.map(s => s._id || s) || [];
                                                        const techSubjects = subjectsList.filter(s => s.type === 1 && posSubjects.includes(s._id));
                                                        return techSubjects.length > 0 ? techSubjects.map((subject) => (
                                                            <div key={subject._id} className="flex items-center space-x-2 opacity-80">
                                                                <Checkbox
                                                                    id={subject._id}
                                                                    checked={true}
                                                                    disabled={true}
                                                                />
                                                                <label
                                                                    htmlFor={subject._id}
                                                                    className="text-sm cursor-default dark:text-slate-300"
                                                                >
                                                                    {subject.name}
                                                                </label>
                                                            </div>
                                                        )) : <p className="text-xs text-slate-500 col-span-2 italic">No technical subjects for this position.</p>;
                                                    })()}
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="non-technical" className="mt-0">
                                                <div className="grid grid-cols-2 gap-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                    {(() => {
                                                        const pos = positions.find(p => p._id === form.position);
                                                        const posSubjects = pos?.subjects?.map(s => s._id || s) || [];
                                                        const nonTechSubjects = subjectsList.filter(s => s.type === 2 && posSubjects.includes(s._id));
                                                        return nonTechSubjects.length > 0 ? nonTechSubjects.map((subject) => (
                                                            <div key={subject._id} className="flex items-center space-x-2 opacity-80">
                                                                <Checkbox
                                                                    id={subject._id}
                                                                    checked={true}
                                                                    disabled={true}
                                                                />
                                                                <label
                                                                    htmlFor={subject._id}
                                                                    className="text-sm cursor-default dark:text-slate-300"
                                                                >
                                                                    {subject.name}
                                                                </label>
                                                            </div>
                                                        )) : <p className="text-xs text-slate-500 col-span-2 italic">No non-technical subjects for this position.</p>;
                                                    })()}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            </>
                        )} */}


                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="dark:text-slate-300">Full Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={form.name || ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.name ? "border-red-500" : ""}`}
                            />
                            {fieldErrors.name && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="dark:text-slate-300">Email Address *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={form.email || ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.email ? "border-red-500" : ""}`}
                            />
                            {fieldErrors.email && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="dark:text-slate-300">Phone Number *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="1234567890"
                                value={form.phone || ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.phone ? "border-red-500" : ""}`}
                            />
                            {fieldErrors.phone && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.phone}</p>}
                        </div>

                        {/* Experience */}
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Experience *</Label>
                            <div className="flex gap-3">
                                {/* Years dropdown */}
                                <Select
                                    value={form.experienceYears || ""}
                                    onValueChange={(val) => {
                                        setForm((prev) => ({ ...prev, experienceYears: val }));
                                        validateField("experienceYears", val);
                                    }}
                                >
                                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white w-full">
                                        <SelectValue placeholder="Years" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-800 border-slate-700">
                                        <SelectItem value="0">0 Year</SelectItem>
                                        <SelectItem value="1">1 Year</SelectItem>
                                        <SelectItem value="2">2 Years</SelectItem>
                                        <SelectItem value="3">3 Years</SelectItem>
                                        <SelectItem value="4">4 Years</SelectItem>
                                        <SelectItem value="5">5 Years</SelectItem>
                                        <SelectItem value="6">6 Years</SelectItem>
                                        <SelectItem value="7">7 Years</SelectItem>
                                        <SelectItem value="8">8 Years</SelectItem>
                                        <SelectItem value="9">9 Years</SelectItem>
                                        <SelectItem value="10">10+ Years</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Months dropdown */}
                                <Select
                                    value={form.experienceMonths || ""}
                                    onValueChange={(val) => {
                                        setForm((prev) => ({ ...prev, experienceMonths: val }));
                                        validateField("experienceMonths", val);
                                    }}
                                >
                                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white w-full">
                                        <SelectValue placeholder="Months" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-800 border-slate-700">
                                        <SelectItem value="0">0 Month</SelectItem>
                                        <SelectItem value="1">1 Month</SelectItem>
                                        <SelectItem value="2">2 Months</SelectItem>
                                        <SelectItem value="3">3 Months</SelectItem>
                                        <SelectItem value="4">4 Months</SelectItem>
                                        <SelectItem value="5">5 Months</SelectItem>
                                        <SelectItem value="6">6 Months</SelectItem>
                                        <SelectItem value="7">7 Months</SelectItem>
                                        <SelectItem value="8">8 Months</SelectItem>
                                        <SelectItem value="9">9 Months</SelectItem>
                                        <SelectItem value="10">10 Months</SelectItem>
                                        <SelectItem value="11">11 Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {fieldErrors.experience && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{fieldErrors.experience}
                                </p>
                            )}
                        </div>


                        {/* Position */}
                        {/* <div className="space-y-2">
                            <Label className="dark:text-slate-300">Position *</Label>
                            <Select
                                value={form.position || ""}
                                onValueChange={(val) => {
                                    const pos = positions.find(p => p._id === val);
                                    setSelectedPositionCounts(pos ? {
                                        total: pos.questionCount || 0,
                                        technical: pos.technicalQuestionCount || 0,
                                        logical: pos.logicalQuestionCount || 0
                                    } : null);
                                    setForm(prev => ({ ...prev, position: val }));
                                    validateField("position", val);
                                }}
                            >
                                <SelectTrigger className={`w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.position ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-800 border-slate-700">
                                    {positions.map(pos => (
                                        <SelectItem key={pos._id} value={pos._id} className="dark:text-white">{pos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldErrors.position && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.position}</p>}
                        </div> */}

                        {/* Schedule */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="schedule" className="dark:text-slate-300">Interview Schedule *</Label>
                            <Input
                                id="schedule"
                                name="schedule"
                                type="datetime-local"
                                min={new Date().toISOString().slice(0, 16)}
                                value={form.schedule ? (() => {
                                    const date = new Date(form.schedule);
                                    const offset = date.getTimezoneOffset();
                                    const localDate = new Date(date.getTime() - (offset * 60000));
                                    return localDate.toISOString().slice(0, 16);
                                })() : ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.schedule ? "border-red-500" : ""}`}
                            />
                            {fieldErrors.schedule && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.schedule}</p>}
                        </div> */}

                        {/* Questions count */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="questionsAskedToCandidate" className="dark:text-slate-300">Questions Asked *</Label>
                            <Input
                                id="questionsAskedToCandidate"
                                name="questionsAskedToCandidate"
                                type="number"
                                value={form.questionsAskedToCandidate || ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.questionsAskedToCandidate ? "border-red-500" : ""}`}
                            />
                            {selectedPositionCounts && (
                                <h6 className="text-[10px] text-gray-500 dark:text-slate-300">
                                    Available: {selectedPositionCounts.total} (Technical: {selectedPositionCounts.technical}, Logical: {selectedPositionCounts.logical})
                                </h6>
                            )}
                            {fieldErrors.questionsAskedToCandidate && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.questionsAskedToCandidate}</p>}
                        </div> */}

                        {/* Test Duration */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="timeDurationForTest" className="dark:text-slate-300">Duration (min) *</Label>
                            <Input
                                id="timeDurationForTest"
                                name="timeDurationForTest"
                                type="number"
                                value={form.timeDurationForTest || ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.timeDurationForTest ? "border-red-500" : ""}`}
                            />
                            {fieldErrors.timeDurationForTest && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.timeDurationForTest}</p>}
                        </div> */}
                    </div>

                    {/* Negative Marking */}
                    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                        <Label className="dark:text-slate-300">Negative Marking</Label>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="neg-no"
                                    checked={!form.isNagativeMarking}
                                    onChange={() => setForm(prev => ({ ...prev, isNagativeMarking: false, negativeMarkingValue: "" }))}
                                />
                                <Label htmlFor="neg-no" className="dark:text-slate-300">No</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="neg-yes"
                                    checked={form.isNagativeMarking}
                                    onChange={() => setForm(prev => ({ ...prev, isNagativeMarking: true }))}
                                />
                                <Label htmlFor="neg-yes" className="dark:text-slate-300">Yes</Label>
                            </div>
                        </div>

                        {form.isNagativeMarking && (
                            <div className="flex flex-col gap-2">
                                <Select
                                    value={["0.5", "0.33", "0.25"].includes(String(form.negativeMarkingValue)) ? String(form.negativeMarkingValue) : "other"}
                                    onValueChange={(val) => {
                                        if (val === "other") setForm(prev => ({ ...prev, negativeMarkingValue: "" }));
                                        else setForm(prev => ({ ...prev, negativeMarkingValue: val }));
                                    }}
                                >
                                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                        <SelectValue placeholder="Select value" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-800 border-slate-700">
                                        <SelectItem value="0.5" className="dark:text-white">0.5 (1/2)</SelectItem>
                                        <SelectItem value="0.33" className="dark:text-white">0.33 (1/3)</SelectItem>
                                        <SelectItem value="0.25" className="dark:text-white">0.25 (1/4)</SelectItem>
                                        <SelectItem value="other" className="dark:text-white">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(!["0.5", "0.33", "0.25"].includes(String(form.negativeMarkingValue)) || fieldErrors.negativeMarkingValue) && (
                                    <Input
                                        placeholder="Custom value (e.g. 0.1)"
                                        name="negativeMarkingValue"
                                        value={form.negativeMarkingValue || ""}
                                        onChange={handleChange}
                                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.negativeMarkingValue ? "border-red-500" : ""}`}
                                    />
                                )}
                                {fieldErrors.negativeMarkingValue && <p className="text-xs text-red-600 font-medium">{fieldErrors.negativeMarkingValue}</p>}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="dark:text-slate-300">Description *</Label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Enter candidate description..."
                            value={form.description || ""}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 text-sm rounded-md border dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.description ? "border-red-500" : "border-slate-200"}`}
                        />
                        {fieldErrors.description && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.description}</p>}
                    </div>
                    {duplicateData && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium">
                                <AlertCircle className="w-5 h-5" />
                                Candidate Already Exists
                            </div>
                            <div className="text-sm text-yellow-800 dark:text-yellow-300 grid grid-cols-2 gap-2 mt-2">
                                <div><span className="font-semibold">Name:</span> {duplicateData.name}</div>
                                <div><span className="font-semibold">Email:</span> {duplicateData.email}</div>
                                <div><span className="font-semibold">Phone:</span> {duplicateData.phone}</div>
                                <div><span className="font-semibold">Attempts:</span> {duplicateData.attemptNumber}</div>
                                {duplicateData.scoreHistory && duplicateData.scoreHistory.length > 0 && (
                                    <div className="mt-3 border-t border-yellow-200 dark:border-yellow-800 pt-2">
                                        <div className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                                            Previous Attempts:
                                        </div>
                                        <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                                            {duplicateData.scoreHistory.map((attempt, index) => (
                                                <li key={index}>
                                                    Attempt {index + 1}:{" "}
                                                    <span className="font-semibold">
                                                        {formatDateToIST(attempt.date)}
                                                    </span><br />
                                                    Position: <span className="font-semibold">{attempt.position}</span>
                                                    <br />
                                                    Score: <span className="font-semibold">{attempt.score.toFixed(2)} %</span> | Marks:{" "}
                                                    <span className="font-semibold">{attempt.marks}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center items-center text-yellow-700 dark:text-yellow-400 font-medium py-2 rounded">
                                Do you Add this candidate ?
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2">
                    {duplicateData ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleDuplicateCancel}
                                disabled={isSubmitting}
                                className="dark:bg-slate-800 dark:text-white dark:border-slate-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                            >
                                No
                            </Button>
                            <Button
                                onClick={handleDuplicateProceed}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isSubmitting ? "Adding..." : "Yes"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting || !hasChanges()} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? "Saving..." : (initialData ? "Update Candidate" : "Add Candidate")}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

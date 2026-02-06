import { useState, useEffect } from "react";
import { Plus, Edit2, AlertCircle } from "lucide-react";
import {  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import api from '../../../Api/axiosInstance';

export default function CandidateModal({isOpen,onClose,initialData,positions,onSuccess}) {
    const [form, setForm] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPositionQuestionCount, setSelectedPositionQuestionCount] = useState(null);
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    ...initialData,
                    timeDurationForTest: initialData.timeforTest || initialData.timeDurationForTest
                });
                // Handle position question count
                const positionId = typeof initialData.position === 'object' ? initialData.position._id : initialData.position;
                const pos = positions.find(p => p._id === positionId);
                setSelectedPositionQuestionCount(pos?.questionCount || 0);
            } else {
                setForm({});
                setSelectedPositionQuestionCount(null);
            }
            setFieldErrors({});
            setGeneralError("");
        }
    }, [isOpen, initialData, positions]);

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
        if (name === "experience" && !value) message = "Experience is required";
        if (name === "position" && !value) message = "Position is required";
        if (name === "schedule") {
            if (!value) message = "Schedule is required";
            else if (new Date(value) < new Date()) message = "Interview schedule cannot be in the past";
        }
        if (name === "questionsAskedToCandidate") {
            if (!value || value === "") message = "Questions asked is required";
            else {
                const count = parseInt(value);
                if (isNaN(count) || count < 0) message = "Must be a positive number";
                else if (selectedPositionQuestionCount !== null && count > selectedPositionQuestionCount) {
                    message = `Only ${selectedPositionQuestionCount} questions available for this position.`;
                }
            }
        }
        if (name === "timeDurationForTest") {
            if (!value) message = "Time duration is required";
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

        setFieldErrors(prev => ({ ...prev, [name]: message }));
        return message;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleSubmit = async () => {
        const errors = {};
        const fieldsToValidate = [
            "name", "email", "phone", "experience", "position",
            "schedule", "questionsAskedToCandidate", "timeDurationForTest"
        ];

        fieldsToValidate.forEach(field => {
            const msg = validateField(field, form[field]);
            if (msg) errors[field] = msg;
        });

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
            onSuccess();
            onClose();
        } catch (err) {
            setGeneralError(err.response?.data?.message || "Failed to save candidate");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-white">
                        {initialData ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {initialData ? "Edit Candidate" : "Add New Candidate"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Label className="dark:text-slate-300">Experience Level *</Label>
                            <Select
                                value={form.experience || ""}
                                onValueChange={(val) => {
                                    setForm(prev => ({ ...prev, experience: val }));
                                    validateField("experience", val);
                                }}
                            >
                                <SelectTrigger className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.experience ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select experience" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-800 border-slate-700">
                                    <SelectItem value="fresher" className="dark:text-white">Fresher (0-1 years)</SelectItem>
                                    <SelectItem value="1-2" className="dark:text-white">1-2 Years</SelectItem>
                                    <SelectItem value="3-5" className="dark:text-white">3-5 Years</SelectItem>
                                    <SelectItem value="5+" className="dark:text-white">5+ Years</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.experience && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.experience}</p>}
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <Label className="dark:text-slate-300">Position *</Label>
                            <Select
                                value={form.position || ""}
                                onValueChange={(val) => {
                                    const pos = positions.find(p => p._id === val);
                                    setSelectedPositionQuestionCount(pos?.questionCount || 0);
                                    setForm(prev => ({ ...prev, position: val }));
                                    validateField("position", val);
                                }}
                            >
                                <SelectTrigger className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.position ? "border-red-500" : ""}`}>
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

                        {/* Questions count */}
                        <div className="space-y-2">
                            <Label htmlFor="questionsAskedToCandidate" className="dark:text-slate-300">Questions Asked *</Label>
                            <Input
                                id="questionsAskedToCandidate"
                                name="questionsAskedToCandidate"
                                type="number"
                                value={form.questionsAskedToCandidate || ""}
                                onChange={handleChange}
                                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.questionsAskedToCandidate ? "border-red-500" : ""}`}
                            />
                            {selectedPositionQuestionCount !== null && (
                                <p className="text-[10px] text-slate-500">Available: {selectedPositionQuestionCount}</p>
                            )}
                            {fieldErrors.questionsAskedToCandidate && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.questionsAskedToCandidate}</p>}
                        </div>

                        {/* Test Duration */}
                        <div className="space-y-2">
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
                        </div>
                    </div>

                    {/* Questions Breakdown */}
                    {form.questionsAskedToCandidate > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                            <div className="space-y-2">
                                <Label className="dark:text-slate-300">Technical Questions</Label>
                                <Input
                                    name="technicalQuestions"
                                    type="number"
                                    value={form.technicalQuestions || ""}
                                    onChange={handleChange}
                                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="dark:text-slate-300">Logical Questions</Label>
                                <Input
                                    name="logicalQuestions"
                                    type="number"
                                    value={form.logicalQuestions || ""}
                                    onChange={handleChange}
                                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                    )}
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
                    {generalError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? "Saving..." : (initialData ? "Update Candidate" : "Add Candidate")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

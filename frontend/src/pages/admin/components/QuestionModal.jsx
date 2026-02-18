import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, AlertCircle, X, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "../../../Api/axiosInstance";

const categories = [
    { value: 1, label: "Quantitative & Aptitude" },
    { value: 2, label: "Verbal & Language Skills" },
    { value: 3, label: "Programming Logic" }
];

export default function QuestionModal({ isOpen, onClose, initialData, positions, onSuccess }) {
    const [form, setForm] = useState({
        positionId: "",
        category: "",
        questionText: "",
        questionImage: null,
        options: [
            { optionText: "", optionImage: null, isCorrect: false },
            { optionText: "", optionImage: null, isCorrect: false },
            { optionText: "", optionImage: null, isCorrect: false },
            { optionText: "", optionImage: null, isCorrect: false },
        ],
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [questionImagePreview, setQuestionImagePreview] = useState(null);
    const [optionImagePreviews, setOptionImagePreviews] = useState({});

    // Refs for file inputs
    const questionImageRef = useRef(null);
    const optionImageRefs = useRef([]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit mode - populate form with existing data
                const positionId = typeof initialData.position === 'object' ? initialData.position._id : initialData.position;
                setForm({
                    positionId: positionId,
                    category: initialData.category || "",
                    questionText: initialData.questionText || "",
                    questionImage: null,
                    options: initialData.options || [
                        { optionText: "", optionImage: null, isCorrect: false },
                        { optionText: "", optionImage: null, isCorrect: false },
                        { optionText: "", optionImage: null, isCorrect: false },
                        { optionText: "", optionImage: null, isCorrect: false },
                    ],
                });
                setQuestionImagePreview(initialData.questionImage || null);

                // Initialize option image previews
                const previews = {};
                initialData.options?.forEach((option, index) => {
                    if (option.optionImage) {
                        previews[index] = option.optionImage;
                    }
                });
                setOptionImagePreviews(previews);
            } else {
                // Add mode - reset form
                setForm({
                    positionId: "",
                    category: "",
                    questionText: "",
                    questionImage: null,
                    options: [
                        { optionText: "", optionImage: null, isCorrect: false },
                        { optionText: "", optionImage: null, isCorrect: false },
                        { optionText: "", optionImage: null, isCorrect: false },
                        { optionText: "", optionImage: null, isCorrect: false },
                    ],
                });
                setQuestionImagePreview(null);
                setOptionImagePreviews({});
            }
            setFieldErrors({});
        }
    }, [isOpen, initialData]);

    const validateForm = () => {
        let errors = {};
        if (!form.positionId) errors.positionId = "Position is required";
        if (!form.questionText && !form.questionImage && !questionImagePreview) {
            errors.question = "Question text or image is required";
        }

        form.options.forEach((opt, idx) => {
            if (!opt.optionText && !opt.optionImage && !optionImagePreviews[idx]) {
                errors[`option${idx}`] = `Option ${idx + 1} is required`;
            }
        });

        if (!form.options.some((o) => o.isCorrect)) {
            errors.correct = "You must select a correct answer";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateField = (name, value) => {
        setFieldErrors((prev) => {
            const newErrors = { ...prev };
            if (value && newErrors[name]) {
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    const handleChange = (e, index = null) => {
        const { name, value } = e.target;
        if (index !== null) {
            const newOptions = [...form.options];
            newOptions[index] = { ...newOptions[index], optionText: value };
            setForm((prev) => ({ ...prev, options: newOptions }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleQuestionImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prev) => ({ ...prev, questionImage: file }));
            setQuestionImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOptionImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newOptions = [...form.options];
            newOptions[index] = { ...newOptions[index], optionImage: file };
            setForm((prev) => ({ ...prev, options: newOptions }));

            setOptionImagePreviews(prev => ({
                ...prev,
                [index]: URL.createObjectURL(file)
            }));
        }
    };

    const removeQuestionImage = () => {
        setForm((prev) => ({ ...prev, questionImage: null }));
        setQuestionImagePreview(null);
        if (questionImageRef.current) {
            questionImageRef.current.value = "";
        }
    };

    const removeOptionImage = (index) => {
        const newOptions = [...form.options];
        newOptions[index] = { ...newOptions[index], optionImage: null };
        setForm((prev) => ({ ...prev, options: newOptions }));

        setOptionImagePreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[index];
            return newPreviews;
        });

        if (optionImageRefs.current[index]) {
            optionImageRefs.current[index].value = "";
        }
    };

    const addOption = () => {
        setForm((prev) => ({
            ...prev,
            options: [...prev.options, { optionText: "", optionImage: null, isCorrect: false }]
        }));
    };

    const removeOption = (index) => {
        if (form.options.length > 2) {
            const newOptions = form.options.filter((_, i) => i !== index);
            setForm((prev) => ({ ...prev, options: newOptions }));

            setOptionImagePreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[index];
                // Shift remaining previews
                const shiftedPreviews = {};
                Object.keys(newPreviews).forEach(key => {
                    const keyIndex = parseInt(key);
                    if (keyIndex > index) {
                        shiftedPreviews[keyIndex - 1] = newPreviews[key];
                    } else if (keyIndex < index) {
                        shiftedPreviews[keyIndex] = newPreviews[key];
                    }
                });
                return shiftedPreviews;
            });
        }
    };

    const hasChanges = () => {
        if (!initialData) return true; // Always allow adding new

        const initialPositionId = typeof initialData.position === 'object' ? initialData.position._id : initialData.position;

        if (form.positionId !== initialPositionId) return true;
        if (form.questionText !== (initialData.questionText || "")) return true;
        if (form.questionImage instanceof File) return true;
        if (initialData.questionImage && !questionImagePreview) return true;
        if (form.options.length !== (initialData.options?.length || 0)) return true;

        for (let i = 0; i < form.options.length; i++) {
            const current = form.options[i];
            const original = initialData.options[i];

            if (!original) return true;
            if (current.optionText !== original.optionText) return true;
            if (current.isCorrect !== original.isCorrect) return true;
            if (current.optionImage instanceof File) return true;
            if (current.optionImage !== original.optionImage) return true;
        }

        return false;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("positionId", form.positionId);
            formData.append("questionText", form.questionText);

            // Category (optional) - send as number
            if (form.category) {
                formData.append("category", Number(form.category));
            }

            // Question image
            if (form.questionImage) {
                formData.append("questionImage", form.questionImage);
            }

            // Option images (all under same field name 'optionImages')
            form.options.forEach((opt) => {
                if (opt.optionImage) {
                    formData.append("optionImages", opt.optionImage);
                }
            });

            // Send options array as JSON string
            formData.append("options", JSON.stringify(form.options));

            // Send request
            let res;
            if (initialData?._id) {
                res = await api.put(`/question/${initialData._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                res = await api.post("/question", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            if (res.status === 200 || res.status === 201) {
                toast.success(initialData ? "Question updated successfully" : "Question created successfully");
                onSuccess();
                onClose();
            } else {
                toast.warning("Something went wrong");
            }
        } catch (err) {
            console.error("Failed to save question:", err);
            toast.error(initialData ? "Failed to update question" : "Failed to create question");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-white">
                        {initialData ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {initialData ? "Edit Question" : "Add New Question"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Position and Category Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Position Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium dark:text-gray-300">Position *</Label>
                            <Select
                                value={form.positionId || ""}
                                onValueChange={(value) => {
                                    setForm((prev) => ({ ...prev, positionId: value }));
                                    validateField("positionId", value);
                                }}
                            >
                                <SelectTrigger className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.positionId ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                    {positions.map((pos) => (
                                        <SelectItem key={pos._id} value={pos._id} className="dark:text-white dark:focus:bg-slate-700">
                                            {pos.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldErrors.positionId && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {fieldErrors.positionId}
                                </p>
                            )}
                        </div>

                        {/* Category Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium dark:text-gray-300">Category (optional)</Label>
                            <Select
                                value={form.category ? String(form.category) : ""}
                                onValueChange={(value) => {
                                    setForm((prev) => ({ ...prev, category: value ? Number(value) : "" }));
                                }}
                            >
                                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={String(cat.value)} className="dark:text-white dark:focus:bg-slate-700">
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium dark:text-gray-300">Question Text</Label>
                        <Input
                            name="questionText"
                            value={form.questionText}
                            onChange={(e) => {
                                handleChange(e);
                                validateField("question", e.target.value);
                            }}
                            placeholder="Enter your question here..."
                            className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.question ? "border-red-500" : ""}`}
                        />
                        {fieldErrors.question && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {fieldErrors.question}
                            </p>
                        )}
                    </div>

                    {/* Question Image */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium dark:text-gray-300">Question Image (Optional)</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            ref={questionImageRef}
                            onChange={handleQuestionImageChange}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-white file:dark:text-white"
                        />
                        {questionImagePreview && (
                            <div className="relative inline-block">
                                <img
                                    src={questionImagePreview}
                                    alt="preview"
                                    className="w-450 h-40 object-cover rounded border dark:border-slate-700"
                                />
                                <button
                                    type="button"
                                    onClick={removeQuestionImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium dark:text-gray-300">Answer Options *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                                className="text-blue-600 hover:text-blue-700 dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Option
                            </Button>
                        </div>

                        {form.options.map((option, index) => (
                            <Card key={index} className="border border-gray-200 dark:border-slate-700 dark:bg-slate-800/50">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium dark:text-gray-300">Option {index + 1}</Label>
                                            {form.options.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeOption(index)}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <Input
                                            value={option.optionText}
                                            onChange={(e) => {
                                                const newOptions = [...form.options];
                                                newOptions[index] = {
                                                    ...newOptions[index],
                                                    optionText: e.target.value,
                                                };
                                                setForm((prev) => ({
                                                    ...prev,
                                                    options: newOptions,
                                                }));
                                                validateField(`option${index}`, e.target.value);
                                            }}
                                            placeholder={`Enter option ${index + 1} text...`}
                                            className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors[`option${index}`] ? "border-red-500" : ""}`}
                                        />

                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-600 dark:text-slate-400">Option Image (Optional)</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                ref={(el) => (optionImageRefs.current[index] = el)}
                                                onChange={(e) => handleOptionImageChange(e, index)}
                                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white file:dark:text-white"
                                            />
                                            {optionImagePreviews[index] && (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={optionImagePreviews[index]}
                                                        alt={`option ${index + 1} preview`}
                                                        className="w-32 h-24 object-cover rounded border dark:border-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOptionImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Radio button for correct answer - ONLY ONE can be selected */}
                                        <RadioGroup
                                            value={option.isCorrect ? String(index) : ""}
                                            onValueChange={(value) => {
                                                const selectedIndex = parseInt(value, 10);
                                                const newOptions = form.options.map((o, i) => ({
                                                    ...o,
                                                    isCorrect: i === selectedIndex,
                                                }));
                                                setForm((prev) => ({
                                                    ...prev,
                                                    options: newOptions,
                                                }));
                                                validateField("correct", true);
                                            }}
                                        >
                                            <Label className="flex items-center gap-2 cursor-pointer text-sm dark:text-gray-300">
                                                <RadioGroupItem value={String(index)} className="dark:border-slate-400 dark:text-blue-500" />
                                                Mark as correct answer
                                            </Label>
                                        </RadioGroup>

                                        {fieldErrors[`option${index}`] && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {fieldErrors[`option${index}`]}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {fieldErrors.correct && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {fieldErrors.correct}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !hasChanges()}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Question" : "Create Question")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

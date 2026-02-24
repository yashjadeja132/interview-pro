import { useState, useEffect } from "react";
import { Plus, Edit2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import api from '../../../Api/axiosInstance';

export default function SubjectModal({ isOpen, onClose, initialData, onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        type: 1 // 1=Technical
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    name: initialData.name || "",
                    type: initialData.type || 1
                });
            } else {
                setForm({
                    name: "",
                    type: 1
                });
            }
            setFieldErrors({});
            setGeneralError("");
        }
    }, [isOpen, initialData]);

    const validateField = (name, value) => {
        let message = "";
        if (name === "name" && !value.trim()) {
            message = "Subject name is required";
        }
        setFieldErrors(prev => ({ ...prev, [name]: message }));
        return message;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === "name") {
            let sanitizedValue = value;
            sanitizedValue = sanitizedValue.replace(/[^a-zA-Z\s]/g, "");
            setForm(prev => ({ ...prev, name: sanitizedValue }));
        }
    validateField(name, sanitizedValue);
    };

    const handleTypeChange = (value) => {
        setForm(prev => ({ ...prev, type: value }));
    };

    const handleSubmit = async () => {
        const nameError = validateField("name", form.name);
        if (nameError) return;

        setIsSubmitting(true);
        setGeneralError("");
        try {
            if (initialData?._id) {
                await api.put(`/subject/${initialData._id}`, form);
            } else {
                await api.post("/subject", form);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setGeneralError(err.response?.data?.message || "Failed to save subject");
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanges = () => {
        if (!initialData) return true;
        return (
            form.name !== initialData.name ||
            form.type !== initialData.type
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                className="max-w-md dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-white">
                        {initialData ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {initialData ? "Edit Subject" : "Add New Subject"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Subject Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="dark:text-slate-300">Subject Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. React.js, Node.js"
                            value={form.name}
                            onChange={handleChange}
                            className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.name ? "border-red-500" : ""}`}
                        />
                        {fieldErrors.name && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                            </p>
                        )}
                    </div>

                    {/* Subject Type */}
                    <div className="space-y-3">
                        <Label className="dark:text-slate-300">Subject Type *</Label>
                        <RadioGroup
                            value={form.type.toString()}
                            onValueChange={(val) => handleTypeChange(parseInt(val))}
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1" id="technical" className="dark:border-slate-500 text-blue-600" />
                                <Label htmlFor="technical" className="dark:text-slate-300">Technical</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2" id="non-technical" className="dark:border-slate-500 text-blue-600" />
                                <Label htmlFor="non-technical" className="dark:text-slate-300">Non Technical</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {generalError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {generalError}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !hasChanges()}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                        >
                            {isSubmitting ? "Saving..." : (initialData ? "Update Subject" : "Add Subject")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

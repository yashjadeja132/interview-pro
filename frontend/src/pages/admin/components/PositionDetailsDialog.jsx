import { useState, useEffect } from "react";
import { Building2, Clock, Save, X, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDateToIST } from "@/utils/dateHelper";
import axiosInstance from "@/Api/axiosInstance";
import { toast } from "sonner";

export default function PositionDetailsDialog({ open, onOpenChange, position, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        salary: "",
        experience: "",
        vacancies: "",
        jobType: "",
        shift: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (position) {
            setFormData({
                name: position.name || "",
                salary: position.salary || "",
                experience: position.experience || "",
                vacancies: position.vacancies || "",
                jobType: position.jobType || "Full-time",
                shift: position.shift || "Day Shift",
            });
            setFieldErrors({});
            setIsEditing(false);
        }
    }, [position]);

    const validateField = (name, value) => {
        let message = "";

        if (name === "name" && !value.trim()) message = "Position name is required";
        if (name === "salary") {
            if (!value) message = "Salary is required";
            else if (isNaN(value) || Number(value) <= 0) message = "Enter a valid positive number";
        }
        if (name === "experience" && !value.trim()) message = "Experience is required";
        if (name === "vacancies") {
            if (!value) message = "Vacancies are required";
            else if (!Number.isInteger(Number(value)) || Number(value) <= 0)
                message = "Must be a positive integer";
        }
        if (name === "jobType" && !value.trim()) message = "Job type is required";
        if (name === "shift" && !value.trim()) message = "Shift is required";

        setFieldErrors((prev) => ({ ...prev, [name]: message }));
        return message;
    };

    const handleInputChange = (field, value) => {
        let sanitizedValue = value;

        // Restriction: Position Name - no numbers allowed
        if (field === "name") {
            sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
        }

        // Restriction: Salary and Vacancies - only numbers
        if (["salary", "vacancies"].includes(field)) {
            // Allow only digits
            sanitizedValue = value.replace(/\D/g, "");
        }


        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
        validateField(field, sanitizedValue);
    };

    const hasChanges = () => {
        if (!position) return false;
        return (
            formData.name !== (position.name || "") ||
            formData.salary.toString() !== (position.salary || "").toString() ||
            formData.experience.toString() !== (position.experience || "").toString() ||
            formData.vacancies.toString() !== (position.vacancies || "").toString() ||
            formData.jobType !== (position.jobType || "Full-time") ||
            formData.shift !== (position.shift || "Day Shift")
        );
    };

    const handleSave = async () => {
        const fieldsToValidate = ["name", "salary", "jobType", "experience", "vacancies", "shift"];
        const errors = {};

        fieldsToValidate.forEach((field) => {
            const msg = validateField(field, formData[field]);
            if (msg) errors[field] = msg;
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.put(`/position/${position._id}`, {
                ...formData,
                salary: Number(formData.salary),
                vacancies: Number(formData.vacancies),
            });

            if (response.data.success) {
                toast.success("Position updated successfully");
                setIsEditing(false);
                if (onUpdate) {
                    onUpdate(response.data.data);
                }
            }
        } catch (error) {
            console.error("Failed to update position:", error);
            toast.error(error.response?.data?.message || "Failed to update position");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (position) {
            setFormData({
                name: position.name || "",
                salary: position.salary || "",
                experience: position.experience || "",
                vacancies: position.vacancies || "",
                jobType: position.jobType || "Full-time",
                shift: position.shift || "Day Shift",
            });
        }
        setFieldErrors({});
        setIsEditing(false);
    };

    if (!position) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md dark:bg-slate-900 dark:border-slate-800"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-orange-600" />
                        {isEditing ? "Edit Position" : position.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {isEditing ? (
                        // Edit Mode
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="position-name" className="dark:text-slate-300">Position Name</Label>
                                <Input
                                    id="position-name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.name ? "border-red-500" : ""}`}
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salary" className="dark:text-slate-300">Salary</Label>
                                    <Input
                                        id="salary"
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => handleInputChange("salary", e.target.value)}
                                        onKeyDown={(e) => {
    // Prevent typing non-numeric characters
    if (
      ["e", "E", "+", "-", ".", ",", "*", "/", "@", "#", "$", "%"].includes(e.key)
    ) {
      e.preventDefault();
    }
  }}
                                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.salary ? "border-red-500" : ""}`}
                                    />
                                    {fieldErrors.salary && (
                                        <p className="text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.salary}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experience" className="dark:text-slate-300">Experience (years)</Label>
                                    <Input
                                        id="experience"
                                        type="text"
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange("experience", e.target.value)}
                                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.experience ? "border-red-500" : ""}`}
                                    />
                                    {fieldErrors.experience && (
                                        <p className="text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.experience}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vacancies" className="dark:text-slate-300">Vacancies</Label>
                                    <Input
                                        id="vacancies"
                                        type="text"
                                        value={formData.vacancies}
                                        onChange={(e) => handleInputChange("vacancies", e.target.value)}
                                        onKeyDown={(e) => {
                                            // Prevent typing non-numeric characters
                                            if (
                                                ["e", "E", "+", "-", ".", ",", "*", "/", "@", "#", "$", "%"].includes(e.key)
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.vacancies ? "border-red-500" : ""
                                            }`}
                                    />

                                    {fieldErrors.vacancies && (
                                        <p className="text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.vacancies}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jobType" className="dark:text-slate-300">Job Type</Label>
                                    <Select
                                        value={formData.jobType}
                                        onValueChange={(value) => handleInputChange("jobType", value)}
                                    >
                                        <SelectTrigger className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.jobType ? "border-red-500" : ""}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Freelancer">Freelancer</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.jobType && (
                                        <p className="text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.jobType}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="shift" className="dark:text-slate-300">Shift</Label>
                                    <Select
                                        value={formData.shift}
                                        onValueChange={(value) => handleInputChange("shift", value)}
                                    >
                                        <SelectTrigger className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.shift ? "border-red-500" : ""}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Day Shift">Day Shift</SelectItem>
                                            <SelectItem value="Night Shift">Night Shift</SelectItem>
                                            <SelectItem value="Flexible">Flexible</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.shift && (
                                        <p className="text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.shift}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        // View Mode
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Salary</p>
                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                    {position.salary ? `$${position.salary}` : "N/A"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Experience</p>
                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                    {position.experience || "N/A"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vacancies</p>
                                <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                    {position.vacancies || 0} Openings
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Job Type</p>
                                <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-200">
                                    {position.jobType || "Full-time"}
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Shift</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                                        {position.shift || "Day Shift"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Created On</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                                        {position.createdAt ? formatDateToIST(position.createdAt) : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6">
                    {isEditing ? (
                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1 dark:text-white"
                                disabled={loading}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                disabled={loading || !hasChanges()}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                            Edit Position
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

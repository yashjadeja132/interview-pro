import { useState, useEffect } from "react";
import { Plus, Edit3, AlertCircle } from "lucide-react";
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
import { toast } from "sonner";
import axiosInstance from "@/Api/axiosInstance";

export default function PositionModal({ isOpen, onClose, initialData, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    salary: "",
    jobType: "",
    experience: "",
    vacancies: "",
    shift: "Day Shift",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          name: initialData.name || "",
          salary: initialData.salary || "",
          jobType: initialData.jobType || "",
          experience: initialData.experience || "",
          vacancies: initialData.vacancies || "",
          shift: initialData.shift || "Day Shift",
        });
      } else {
        setForm({
          name: "",
          salary: "",
          jobType: "",
          experience: "",
          vacancies: "",
          shift: "Day Shift",
        });
      }
      setFieldErrors({});
      setGeneralError("");
    }
  }, [isOpen, initialData]);

  // 🔍 Validation logic (similar to CandidateModal)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async () => {
    const fieldsToValidate = ["name", "salary", "jobType", "experience", "vacancies", "shift"];
    const errors = {};

    fieldsToValidate.forEach((field) => {
      const msg = validateField(field, form[field]);
      if (msg) errors[field] = msg;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
    //   toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      if (initialData?._id) {
        await axiosInstance.put(`/position/${initialData._id}`, {
          ...form,
          salary: Number(form.salary),
          vacancies: Number(form.vacancies),
        });
        toast.success("Position updated successfully");
      } else {
        await axiosInstance.post("/position", {
          ...form,
          salary: Number(form.salary),
          vacancies: Number(form.vacancies),
        });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
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
          {/* Position Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Position Name *
            </label>
            <Input
              name="name"
              placeholder="e.g., Software Engineer"
              value={form.name}
              onChange={handleChange}
              className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                fieldErrors.name ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Salary + Experience */}
          <div className="grid grid-cols-2 gap-4">
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
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                  fieldErrors.salary ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.salary && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.salary}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Experience *
              </label>
              <Input
                name="experience"
                placeholder="e.g., 2+ years"
                value={form.experience}
                onChange={handleChange}
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                  fieldErrors.experience ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.experience && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.experience}
                </p>
              )}
            </div>
          </div>

          {/* Vacancies + Job Type */}
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
                className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                  fieldErrors.vacancies ? "border-red-500" : ""
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
                Job Type *
              </label>
              <Select
                value={form.jobType}
                onValueChange={(v) => handleSelectChange("jobType", v)}
              >
                <SelectTrigger
                  className={`h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                    fieldErrors.jobType ? "border-red-500" : ""
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
          </div>

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

          {/* General Error */}
          {generalError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
            </div>
          )}
        </div>

       <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? "Saving..." : (initialData ? "Update Job Post" : "Add Job Post")}
                    </Button>
                </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

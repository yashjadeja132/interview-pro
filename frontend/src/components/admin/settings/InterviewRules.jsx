import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import api from '../../../Api/axiosInstance';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function InterviewRules() {
    const [formData, setFormData] = useState({
        timeDurationForTest: '',
    });
    const [initialData, setInitialData] = useState({
        timeDurationForTest: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchLoginTime = async () => {
        try {
            const res = await api.get("/admin/login-time");
            if (res.data.success && res.data.data) {
                const fetchedData = {
                    timeDurationForTest: res.data.data.timeDurationForTest || '',
                };
                setFormData(fetchedData);
                setInitialData(fetchedData);
            }
        } catch (err) {
            console.error("Failed to fetch login time", err.message);
        }
    };

    useEffect(() => {
        fetchLoginTime();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        if (name === 'timeDurationForTest') {
            if (value < 0 || value > 120) {
                setErrors((prev) => ({ ...prev, [name]: 'Time must be between 0 and 120 minutes' }));
            } else {
                setErrors((prev) => ({ ...prev, [name]: '' }));
            }
        }

        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const hasChanges = () => {
        return formData.timeDurationForTest !== initialData.timeDurationForTest;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};
        // Required field check
        if (!formData.timeDurationForTest) {
            newErrors.timeDurationForTest = 'Time is required';
        }
        // Range check
        else if (formData.timeDurationForTest < 0 || formData.timeDurationForTest > 120) {
            newErrors.timeDurationForTest = 'Time must be between 0 and 120 minutes';
        }

        setErrors(newErrors);

        // Stop submission if any error
        if (Object.keys(newErrors).length > 0) return;

        setIsLoading(true);
        try {
            const res = await api.post("/admin/login-time", formData);
            if (res.data.success) {
                toast.success("Login time updated successfully");
                setInitialData(formData);
            } else {
                toast.warning("Something went wrong");
            }
        } catch (err) {
            console.error("Failed to set login time", err);
            toast.error("Failed to update login time");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space">
            <div className="grid grid-cols-1 gap-4">

                <div className="flex items-center justify-between p-4 border rounded-lg  transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Login Time for Student</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Set duration in minutes</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Input
                            id="timeDurationForTest"
                            name="timeDurationForTest"
                            type="number"
                            min="0"
                            max="120"
                            value={formData.timeDurationForTest}
                            onChange={handleChange}
                            placeholder="Enter minutes"
                            className={`w-32 ${errors.timeDurationForTest ? 'border-red-500' : ''}`}
                        />
                        {errors.timeDurationForTest && (
                            <p className="text-xs text-red-500">{errors.timeDurationForTest}</p>
                        )}
                    </div>
                </div>

            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !!errors.timeDurationForTest || !hasChanges()}
                >
                    <Save size={18} />
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </div>
            <Toaster />
        </form>
    );
}

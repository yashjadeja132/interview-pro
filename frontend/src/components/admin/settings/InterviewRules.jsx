import React, { useState } from 'react';
import { Save, FileText, Repeat, CheckCircle, AlertOctagon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import api from '../../../Api/axiosInstance';

export default function InterviewRules() {
    const [formData, setFormData] = useState({
        timeDurationForTest: '',
    });

    const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // ✅ Required field check
    if (!formData.timeDurationForTest) {
        newErrors.timeDurationForTest = 'Time is required';
    } 
    // ✅ Range check
    else if (formData.timeDurationForTest < 0 || formData.timeDurationForTest > 120) {
        newErrors.timeDurationForTest = 'Time must be between 0 and 120 minutes';
    }

    setErrors(newErrors);

    // ✅ Stop submission if any error
    if (Object.keys(newErrors).length > 0) return;

    try {
        const res = await api.post("/admin/login-time", formData);
        console.log(res.data);
    } catch (err) {
        console.error("Failed to set login time", err);
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Set duration in minutes (Max 120)</p>
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
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={!!errors.timeDurationForTest}
                >
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </form>
    );
}

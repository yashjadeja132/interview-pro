import React, { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, AlertCircle } from 'lucide-react';
import axiosInstance from '@/Api/axiosInstance';

export default function ProfileSettings() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        image: '',
    });
    const [initialData, setInitialData] = useState({
        name: '',
        email: '',
        phone: '',
        image: '',
    });

    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const data = {
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                image: user.image || '',
            };
            setFormData(data);
            setInitialData(data);
        }
    }, []);

    // ✅ Trim spaces on change
    const handleChange = (e) => {
        const { name, value } = e.target;
        let sanitizedValue = value;

        if (name === "name") {
            // Only letters and spaces allowed
            sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
        }

        if (name === "email") {
            // Allow only typical email characters
            sanitizedValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
        }

        if (name === "phone") {
            // Only numbers allowed
            sanitizedValue = value.replace(/[^0-9]/g, "");
        }

        setFormData({ ...formData, [name]: sanitizedValue });

        // Clear field error as user types
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: "" });
        }
    };

    // ✅ Helper: Compare trimmed values only
    const isFormChanged = () => {
        const trimmedForm = Object.fromEntries(
            Object.entries(formData).map(([k, v]) => [k, v.trim()])
        );
        const trimmedInitial = Object.fromEntries(
            Object.entries(initialData).map(([k, v]) => [k, v.trim()])
        );
        return JSON.stringify(trimmedForm) !== JSON.stringify(trimmedInitial);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setFieldErrors({ name: '', email: '', phone: '' });

        const errors = {};
        if (!formData.name.trim()) {
            errors.name = "Full name is required";
        }

        if (!formData.email.trim()) {
            errors.email = "Email address is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }

        if (formData.phone && formData.phone.length > 0 && formData.phone.length < 10) {
            errors.phone = "Phone number must be at least 10 digits";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setLoading(false);
            return;
        }

        // ✅ Trim before sending
        const trimmedData = Object.fromEntries(
            Object.entries(formData).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        );

        try {
            const response = await axiosInstance.put('/admin/update-profile', trimmedData);

            if (response.data.user) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const updatedUser = { ...user, ...response.data.user };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                setInitialData(trimmedData);
                setFormData(trimmedData);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-white flex items-center gap-2">
                        <User size={16} /> Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md transition-all duration-200 outline-none focus:ring-2 
                            ${fieldErrors.name
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200"} 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    />
                    {fieldErrors.name && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                            <AlertCircle size={14} />
                            {fieldErrors.name}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-white flex items-center gap-2">
                        <Mail size={16} /> Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md transition-all duration-200 outline-none focus:ring-2 
                            ${fieldErrors.email
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200"} 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    />
                    {fieldErrors.email && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                            <AlertCircle size={14} />
                            {fieldErrors.email}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-white flex items-center gap-2">
                        <Phone size={16} /> Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className={`w-full p-2 border rounded-md transition-all duration-200 outline-none focus:ring-2 
                            ${fieldErrors.phone
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200"} 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {fieldErrors.phone && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                            <AlertCircle size={14} />
                            {fieldErrors.phone}
                        </div>
                    )}
                </div>
            </div>

            {message.text && (
                <div
                    className={`p-3 rounded-md text-sm ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading || !isFormChanged()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
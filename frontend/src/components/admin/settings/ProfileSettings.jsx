import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Mail, Phone, Camera } from 'lucide-react';
import axiosInstance from '@/Api/axiosInstance';

export default function ProfileSettings() {
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        image: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                image: user.image || '',
            });
            setImageError(false);
        }
    }, []);

    // 🔹 Image error fallback
    const handleImageError = () => {
        setImageError(true);
    };

    // 🔹 Input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 🔹 Image upload + preview
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image');
            return;
        }

        const imageURL = URL.createObjectURL(file);

        setFormData((prev) => ({
            ...prev,
            image: imageURL, // preview
        }));

        setImageError(false);
    };

    // 🔹 Submit profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axiosInstance.put(
                '/admin/update-profile',
                formData
            );

            if (response.data.user) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const updatedUser = { ...user, ...response.data.user };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text:
                    error.response?.data?.message ||
                    'Failed to update profile',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ================= PROFILE IMAGE ================= */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                        {formData.image && !imageError ? (
                            <img
                                src={formData.image}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                            />
                        ) : (
                            <User size={40} className="text-gray-400 dark:text-gray-500" />
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-md hover:bg-blue-700 transition"
                    >
                        <Camera size={14} />
                    </button>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Profile Photo
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Update your profile picture
                    </p>
                </div>
            </div>

            {/* ================= FORM FIELDS ================= */}
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
                        className="w-full p-2 border dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    />
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
                        className="w-full p-2 border dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    />
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
                        className="w-full p-2 border dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            {/* ================= MESSAGE ================= */}
            {message.text && (
                <div
                    className={`p-3 rounded-md text-sm ${
                        message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* ================= SAVE BUTTON ================= */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

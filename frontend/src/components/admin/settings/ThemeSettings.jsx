import React, { useState, useEffect, useContext } from 'react';
import { Save, Sun, Moon, Palette, Image } from 'lucide-react';
import { ThemeContext } from '@/context/ThemeContext';

export default function ThemeSettings({ settings, onUpdate, loading }) {
    const { updateTheme } = useContext(ThemeContext);
    const [formData, setFormData] = useState({
        darkMode: settings.darkMode || false,
        logoUrl: settings.logoUrl || '',
    });
    const [initialData, setInitialData] = useState({
        darkMode: settings.darkMode || false,
        logoUrl: settings.logoUrl || '',
    });

    // Sync formData when settings prop changes (e.g., after fetching from backend)
    useEffect(() => {
        const newData = {
            darkMode: settings.darkMode || false,
            logoUrl: settings.logoUrl || '',
        };
        setFormData(newData);
        setInitialData(newData);
    }, [settings]);

    // Check if there are any changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hasChanges) return;
        try {
            // Save to backend
            await onUpdate({ section: 'theme', data: formData });
            // Immediately update global theme context for instant UI update
            if (updateTheme) {
                updateTheme(formData);
            }
            // Update initial data after successful save
            setInitialData({ ...formData });
        } catch (error) {
            console.error('Failed to update theme settings', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            </div>

            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance Mode</h3>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        {formData.darkMode ? <Moon size={20} className="text-indigo-500 dark:text-indigo-400" /> : <Sun size={20} className="text-orange-500 dark:text-orange-400" />}
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{formData.darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-300">{formData.darkMode ? 'Disable dark theme for admin portal' : 'Enable dark theme for admin portal'}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="darkMode"
                            checked={formData.darkMode}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

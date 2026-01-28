import React, { useState } from 'react';
import { Save, Mail, Server, Key, Lock, Send } from 'lucide-react';

export default function EmailSettings({ settings, onUpdate, loading }) {
    const [formData, setFormData] = useState({
        smtpHost: settings.smtpHost || '',
        smtpEmail: settings.smtpEmail || '',
        smtpPassword: settings.smtpPassword || '',
        sendInterviewLink: settings.sendInterviewLink !== undefined ? settings.sendInterviewLink : true,
        sendResultEmail: settings.sendResultEmail !== undefined ? settings.sendResultEmail : true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ section: 'email', data: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
                <Mail className="text-blue-600 mt-1" size={20} />
                <div>
                    <h4 className="font-semibold text-blue-900">SMTP Configuration</h4>
                    <p className="text-xs text-blue-700 mt-1">
                        Configure your email provider settings to enable sending system emails.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Server size={16} /> SMTP Host
                    </label>
                    <input
                        type="text"
                        name="smtpHost"
                        placeholder="smtp.gmail.com"
                        value={formData.smtpHost}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail size={16} /> SMTP Email
                    </label>
                    <input
                        type="email"
                        name="smtpEmail"
                        placeholder="admin@company.com"
                        value={formData.smtpEmail}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Key size={16} /> SMTP Password
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            name="smtpPassword"
                            placeholder="App Password"
                            value={formData.smtpPassword}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-900">Email Triggers</h3>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Send size={20} className="text-gray-500" />
                        <div>
                            <p className="font-medium text-gray-900">Send Interview Link</p>
                            <p className="text-xs text-gray-500">Auto-send email when candidate is invited</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="sendInterviewLink"
                            checked={formData.sendInterviewLink}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Lock size={20} className="text-gray-500" />
                        <div>
                            <p className="font-medium text-gray-900">Send Result Email</p>
                            <p className="text-xs text-gray-500">Auto-send result summary to candidate/admin</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="sendResultEmail"
                            checked={formData.sendResultEmail}
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

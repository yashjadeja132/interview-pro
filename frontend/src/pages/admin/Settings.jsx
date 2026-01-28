import React, { useState, useEffect, useContext } from 'react';
import {
    User, Shield, Settings as SettingsIcon, Mail, Users, FileText, Palette, Activity
} from 'lucide-react';
import axiosInstance from '@/Api/axiosInstance';
import { ThemeContext } from '@/context/ThemeContext';

// Import Components
import ProfileSettings from '@/components/admin/settings/ProfileSettings';
import SecuritySettings from '@/components/admin/settings/SecuritySettings';
import SystemSettings from '@/components/admin/settings/SystemSettings';
import EmailSettings from '@/components/admin/settings/EmailSettings';
import RoleSettings from '@/components/admin/settings/RoleSettings';
import InterviewRules from '@/components/admin/settings/InterviewRules';
import ThemeSettings from '@/components/admin/settings/ThemeSettings';
import AuditLogs from '@/components/admin/settings/AuditLogs';

export default function Settings() {
    const { updateTheme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('settingsActiveTab') || 'profile');
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [globalMessage, setGlobalMessage] = useState(null);

    // Update localStorage whenever activeTab changes
    useEffect(() => {
        localStorage.setItem('settingsActiveTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/settings');
            if (response.data && response.data.settings) {
                const fetchedSettings = response.data.settings;
                setSettings(fetchedSettings);
                
                // Sync theme and primaryColor from backend settings to ThemeContext
                if (updateTheme) {
                    updateTheme({ 
                        darkMode: fetchedSettings.darkMode,
                        primaryColor: fetchedSettings.primaryColor 
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async ({ section, data }) => {
        try {
            setLoading(true);
            setGlobalMessage(null);

            const payload = {};
            // Merge current settings with updates
            // This is a bit simplified, ideally we patch only what's needed
            // But our API expects a flat body for all settings, or we can send everything merged

            // Actually my backend controller does: Settings.findOneAndUpdate({}, updates)
            // So I can just send the partial object!

            const response = await axiosInstance.put('/settings', data);

            if (response.data && response.data.settings) {
                setSettings(response.data.settings);
                setGlobalMessage({ type: 'success', text: 'Settings updated successfully!' });
                setTimeout(() => setGlobalMessage(null), 3000);
            }
        } catch (error) {
            console.error("Failed to update settings", error);
            setGlobalMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, component: ProfileSettings },
        { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
        { id: 'system', label: 'System', icon: SettingsIcon, component: SystemSettings },
        { id: 'email', label: 'Email', icon: Mail, component: EmailSettings },
        { id: 'roles', label: 'Roles', icon: Users, component: RoleSettings },
        { id: 'rules', label: 'Rules', icon: FileText, component: InterviewRules },
        { id: 'theme', label: 'Theme', icon: Palette, component: ThemeSettings },
        { id: 'logs', label: 'Audit Logs', icon: Activity, component: AuditLogs }, // Logs fetch their own data
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and system preferences</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">

                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6 min-h-[500px]">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {tabs.find(t => t.id === activeTab)?.label} Settings
                                </h2>
                                <div className="h-1 w-20 bg-blue-500 rounded-full mt-2"></div>
                            </div>

                            {globalMessage && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${globalMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    }`}>
                                    <span>{globalMessage.text}</span>
                                    <button onClick={() => setGlobalMessage(null)} className="text-sm font-semibold hover:underline">Dismiss</button>
                                </div>
                            )}

                            {/* Render Active Tab Component */}
                            {tabs.map((tab) => {
                                if (tab.id !== activeTab) return null;
                                const Component = tab.component;
                                // Pass appropriate props
                                // Profile & Security fetch their own data or use local storage user
                                // Logs fetches its own data
                                // Others use the centralized 'settings' object
                                return (
                                    <div key={tab.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <Component
                                            settings={settings}
                                            onUpdate={updateSettings}
                                            loading={loading}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

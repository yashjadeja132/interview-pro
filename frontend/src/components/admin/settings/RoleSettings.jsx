import React, { useState, useEffect } from 'react';
import { Save, Shield, Users, Check, X } from 'lucide-react';

export default function RoleSettings({ settings, onUpdate, loading }) {
    // Mock data for roles matrix if not present in settings
    const defaultRoles = {
        Admin: {
            createQuestion: true,
            deleteQuestion: false,
            viewAnalytics: true,
            manageSettings: false
        },
        SuperAdmin: {
            createQuestion: true,
            deleteQuestion: true,
            viewAnalytics: true,
            manageSettings: true
        }
    };

    const [roles, setRoles] = useState(settings.roles || defaultRoles);
    const [initialRoles, setInitialRoles] = useState(settings.roles || defaultRoles);

    // Sync when settings change
    useEffect(() => {
        const rolesData = settings.roles || defaultRoles;
        setRoles(rolesData);
        setInitialRoles(rolesData);
    }, [settings]);

    // Check if there are any changes
    const hasChanges = () => {
        return JSON.stringify(roles) !== JSON.stringify(initialRoles);
    };

    const modules = [
        { key: 'createQuestion', label: 'Create Question' },
        { key: 'deleteQuestion', label: 'Delete Question' },
        { key: 'viewAnalytics', label: 'View Analytics' },
        { key: 'manageSettings', label: 'Manage Settings' }
    ];

    const handleToggle = (role, moduleKey) => {
        setRoles({
            ...roles,
            [role]: {
                ...roles[role],
                [moduleKey]: !roles[role][moduleKey]
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!hasChanges()) return;
        onUpdate({ section: 'roles', data: { roles } });
        // Update initial data after submit
        setInitialRoles({ ...roles });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg flex items-start gap-3 border border-purple-100">
                <Shield className="text-purple-600 mt-1" size={20} />
                <div>
                    <h4 className="font-semibold text-purple-900">Role Permissions</h4>
                    <p className="text-xs text-purple-700 mt-1">
                        Manage access control and permissions for different administrator roles.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Module / Permission</th>
                            <th className="px-6 py-3 text-center">Admin</th>
                            <th className="px-6 py-3 text-center">Super Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map((module) => (
                            <tr key={module.key} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {module.label}
                                </td>

                                {['Admin', 'SuperAdmin'].map((role) => (
                                    <td key={role} className="px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(role, module.key)}
                                            className={`p-1 rounded-full transition-colors ${roles[role]?.[module.key]
                                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                        >
                                            {roles[role]?.[module.key] ? <Check size={18} /> : <X size={18} />}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading || !hasChanges()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

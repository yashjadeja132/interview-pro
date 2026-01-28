import React, { useState, useEffect } from 'react';
import { Activity, User, Clock, Search } from 'lucide-react';
import axiosInstance from '@/Api/axiosInstance';
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/settings/audit-logs');
            if (response.data && response.data.logs) {
                setLogs(response.data.logs);
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
            setError("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity size={20} className="text-blue-500" /> Activity Logs
                </h3>
                <button onClick={fetchLogs} className="text-sm text-blue-600 hover:underline">Refresh</button>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No activity logs found.
                    </div>
                ) : (
                    <div className="divide-y">
                        {logs.map((log) => (
                            <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                <div className="bg-blue-100 p-2 rounded-full mt-1">
                                    <User size={16} className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-gray-900">{log.action}</p>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Performed by: <span className="font-semibold">{log.adminId?.name || 'Unknown Admin'}</span> ({log.adminId?.email})
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Target: {log.target}
                                    </p>
                                    {log.details && (
                                        <div className="mt-2 bg-gray-50 p-2 rounded text-xs font-mono text-gray-600 overflow-x-auto">
                                            {JSON.stringify(log.details)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

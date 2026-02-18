import React, { useState, useEffect } from 'react';
import { Activity, Clock, Shield, ChevronLeft, ChevronRight, User } from 'lucide-react';
import axiosInstance from '@/Api/axiosInstance';
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchLogs();
    }, [currentPage, rowsPerPage]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/settings/audit-logs', {
                params: {
                    page: currentPage,
                    limit: rowsPerPage === 'all' ? 1000 : rowsPerPage
                }
            });
            if (response.data) {
                setLogs(response.data.logs || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
                setTotalLogs(response.data.pagination?.total || 0);
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
            setError("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    const formatAction = (action) => {
        return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const getLogMessage = (log) => {
        const action = formatAction(log.action);
        const adminName = log.adminId?.name || 'Unknown Admin';
        const target = log.target || 'system';

        let detailsText = '';
        if (log.details) {
            if (log.details.name) detailsText = ` (${log.details.name})`;
            else if (log.details.text) detailsText = ` (${log.details.text.substring(0, 30)}${log.details.text.length > 30 ? '...' : ''})`;
        }

        return (
            <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-slate-100 italic">
                    {action} {target} {detailsText}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <User size={12} /> Performed by: {adminName} ({log.adminId?.email || 'N/A'})
                </span>
            </div>
        );
    };

    const handlePageSizeChange = (value) => {
        setRowsPerPage(value === 'all' ? 'all' : parseInt(value));
        setCurrentPage(1);
    };

    if (loading && logs.length === 0) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" /> Activity Logs
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track all administrative actions and changes</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs} className="dark:bg-slate-800">
                    Refresh
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="w-[80px] font-bold">Sr No.</TableHead>
                            <TableHead className="font-bold">Log Activity</TableHead>
                            <TableHead className="w-[200px] font-bold">Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                                    No activity logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log, index) => (
                                <TableRow key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <TableCell className="font-medium text-slate-500">
                                        {(currentPage - 1) * (rowsPerPage === 'all' ? 0 : rowsPerPage) + index + 1}
                                    </TableCell>
                                    <TableCell>
                                        {getLogMessage(log)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Clock size={14} className="text-slate-400" />
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs pl-5">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400 text-nowrap">Rows per page:</span>
                        <Select
                            value={rowsPerPage.toString()}
                            onValueChange={handlePageSizeChange}
                        >
                            <SelectTrigger className="w-20 h-8 dark:bg-slate-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-4">
                            Showing {logs.length} of {totalLogs} logs
                        </span>
                    </div>

                    {rowsPerPage !== 'all' && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || loading}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft size={18} />
                            </Button>

                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="h-8 w-8 p-0 font-medium"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || loading}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-lg flex items-center gap-3">
                    <Shield size={20} className="text-red-500" />
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}

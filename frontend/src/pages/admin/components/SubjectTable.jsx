import React, { useState, useEffect } from "react";
import {
    Search,
    Edit2,
    Trash2,
    AlertCircle,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    XCircle,
    ChevronDown,
    ChevronUp,
    Video,
    Clock
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import api from '../../../Api/axiosInstance';
import { formatDateToIST } from "@/utils/dateHelper";

export default function SubjectTable({ onEdit, refreshTrigger }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubjects, setTotalSubjects] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteId, setDeleteId] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    }

    const fetchSubjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: search.trim(),
            };
            const { data } = await api.get("/subject", { params });
            setSubjects(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalSubjects(data.pagination?.total || 0);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch subjects");
            console.error("Failed to fetch subjects:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [currentPage, search, rowsPerPage, refreshTrigger]);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/subject/${deleteId}`);
            setDeleteId(null);
            fetchSubjects();
        } catch (err) {
            console.error("Failed to delete subject:", err);
        }
    };

    const handlePageSizeChange = (newPageSize) => {
        setRowsPerPage(parseInt(newPageSize));
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-sm dark:bg-slate-900">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Search subjects..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 h-10 w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearch("");
                                        setCurrentPage(1);
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {subjects.length} of {totalSubjects} subjects
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold dark:text-white">All Subjects</CardTitle>
                            <CardDescription className="dark:text-slate-400">Manage and view your test subjects</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Show:</Label>
                            <Select
                                value={rowsPerPage.toString()}
                                onValueChange={handlePageSizeChange}
                            >
                                <SelectTrigger className="w-20 h-8 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-800 border-slate-700">
                                    <SelectItem value="5" className="dark:text-white">5</SelectItem>
                                    <SelectItem value="10" className="dark:text-white">10</SelectItem>
                                    <SelectItem value="15" className="dark:text-white">15</SelectItem>
                                    <SelectItem value="20" className="dark:text-white">20</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full dark:bg-slate-800" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">No subjects found</p>
                        </div>
                    ) : (
                        <>
                            <div className="sm-table-wrapper">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                            <TableHead className="w-10 md:hidden"></TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 w-12 hidden sm:table-cell">#</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 ">Subject Name</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center hidden md:table-cell">Type</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center hidden lg:table-cell">Date Created</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right pr-2 md:pr-6 w-[110px] sm:w-auto">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjects.map((subject, idx) => (
                                            <React.Fragment key={subject._id}>
                                                <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                                    <TableCell className="md:hidden">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRow(subject._id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {expandedRows.has(subject._id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="dark:text-slate-300 hidden sm:table-cell">{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3 min-w-0">
                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0 sm-subject-icon">
                                                                <BookOpen className="w-4 h-4 dark:text-white" />
                                                            </div>
                                                            <div className="min-w-0 flex-1 relative">
                                                                <div className="font-medium text-slate-900 dark:text-white break-words">{subject.name || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center hidden md:table-cell">
                                                        <Badge
                                                            variant={subject.type === 1 ? "default" : "secondary"}
                                                            className={subject.type === 1 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200 dark:border-blue-800" : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-purple-200 dark:border-purple-800"}
                                                        >
                                                            {subject.type === 1 ? 'Technical' : subject.type === 2 ? 'Non Technical' : 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                                                        {subject.createdAt ? formatDateToIST(subject.createdAt) : 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-2 md:pr-6 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                                                onClick={() => onEdit(subject)}
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-red-900/50"
                                                                onClick={() => setDeleteId(subject._id)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedRows.has(subject._id) && (
                                                    <TableRow className="md:hidden bg-slate-50/50 dark:bg-slate-800/20 border-none hover:bg-transparent">
                                                        <TableCell colSpan={5} className="p-4">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                                                <div className="md:hidden">
                                                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider subject-detail">Type</p>
                                                                    <div className="mt-1 subject-detail">
                                                                        <Badge
                                                                            variant={subject.type === 1 ? "default" : "secondary"}
                                                                            className={subject.type === 1 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200 dark:border-blue-800" : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-purple-200 dark:border-purple-800"}
                                                                        >
                                                                            {subject.type === 1 ? 'Technical' : subject.type === 2 ? 'Non Technical' : 'N/A'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="lg:hidden">
                                                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider subject-detail">Date Created</p>
                                                                    <p className="text-slate-800 dark:text-white mt-1 font-medium subject-detail">
                                                                        {subject.createdAt ? formatDateToIST(subject.createdAt) : 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination UI */}
                            <div className="flex justify-end items-center mt-6">
                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 dark:disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                            if (pageNum > totalPages || pageNum < 1) return null;
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === currentPage ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-8 h-8 p-0 ${pageNum === currentPage ? "" : "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"}`}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 dark:disabled:opacity-50"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="dark:text-white">Are you sure you want to delete this subject? This action cannot be undone.</p>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

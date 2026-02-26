import { useState, useEffect } from "react";
import axios from "axios";
import {
    Search,
    Filter,
    Building2,
    Trash2,
    Edit3,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    CalendarIcon
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import axiosInstance from "@/Api/axiosInstance";
import "@/assets/css/PositionManagement.css";

// Date formatting utility for display
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
};

// Date formatting utility for API
const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function PositionTable({ onEdit, onView, refreshTrigger }) {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPositions, setTotalPositions] = useState(0);

    const [filters, setFilters] = useState({
        vacancy: "",
        jobType: "all",
        salary: "",
        shift: "all",
        experience: "all",
        startDate: null,
        endDate: null
    });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const fetchPositions = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: searchTerm.trim(),
                ...filters
            };

            // Clean up filters to match backend expectations (remove 'all' values and format dates)
            const cleanFilters = {};
            if (params.search) cleanFilters.search = params.search;
            if (params.vacancy) cleanFilters.vacancy = params.vacancy;
            if (params.jobType !== 'all') cleanFilters.jobType = params.jobType;
            if (params.salary) cleanFilters.salary = params.salary;
            if (params.shift !== 'all') cleanFilters.shift = params.shift;
            if (params.experience !== 'all') cleanFilters.experience = params.experience;
            if (params.startDate) cleanFilters.startDate = formatDateForAPI(params.startDate);
            if (params.endDate) cleanFilters.endDate = formatDateForAPI(params.endDate);

            cleanFilters.page = params.page;
            cleanFilters.limit = params.limit;

            const { data } = await axiosInstance.get("/position", { params: cleanFilters });
            setPositions(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalPositions(data.pagination?.total || 0);
        } catch (err) {
            console.error("Error fetching positions", err);
            toast.error("Failed to load positions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, [searchTerm, filters, refreshTrigger, currentPage, rowsPerPage]);

    const handlePageSizeChange = (newPageSize) => {
        setRowsPerPage(parseInt(newPageSize));
        setCurrentPage(1);
    };

    const deletePosition = async (id) => {
        try {
            const res = await axiosInstance.delete(`/position/${id}`);
            if (res.status === 200) {
                toast.success("Position deleted successfully");
                fetchPositions();
            }
            setDeleteConfirm({ open: false, id: null });
        } catch (err) {
            console.error("Error deleting position", err);
            toast.error("Failed to delete position");
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Section */}
            <Card className="border-0 shadow-sm mb-6 dark:bg-slate-900">
                <CardContent className="p-6">
                    <div className="pm-controls-container mb-4">
                        <div className="pm-search-filter-group">
                            <div className="pm-search-input-wrapper">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search positions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10 w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`h-10 whitespace-nowrap dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}`}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                                {(filters.vacancy || filters.jobType !== 'all' || filters.salary || filters.shift !== 'all' || filters.experience !== 'all' || filters.startDate || filters.endDate) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFilters({ vacancy: "", jobType: "all", salary: "", shift: "all", experience: "all", startDate: null, endDate: null })}
                                        className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            Showing {positions.length} of {totalPositions}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="pm-filter-grid">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Job Type</label>
                                <Select value={filters.jobType} onValueChange={(v) => setFilters({ ...filters, jobType: v })}>
                                    <SelectTrigger className="h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Experience</label>
                                <Select value={filters.experience} onValueChange={(v) => setFilters({ ...filters, experience: v })}>
                                    <SelectTrigger className="h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="0-1 years">0-1 years</SelectItem>
                                        <SelectItem value="1-3 years">1-3 years</SelectItem>
                                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                                        <SelectItem value="5+ years">5+ years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Shift</label>
                                <Select value={filters.shift} onValueChange={(v) => setFilters({ ...filters, shift: v })}>
                                    <SelectTrigger className="h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="Day Shift">Day Shift</SelectItem>
                                        <SelectItem value="Night Shift">Night Shift</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.startDate ? formatDate(filters.startDate) : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 dark:bg-slate-900 dark:border-slate-700">
                                        <Calendar
                                            mode="single"
                                            selected={filters.startDate}
                                            onSelect={(date) => {
                                                setFilters(prev => ({ ...prev, startDate: date }));
                                                setCurrentPage(1);
                                            }}
                                            initialFocus
                                            className="dark:bg-slate-900 dark:text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.endDate ? formatDate(filters.endDate) : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 dark:bg-slate-900 dark:border-slate-700">
                                        <Calendar
                                            mode="single"
                                            selected={filters.endDate}
                                            onSelect={(date) => {
                                                setFilters(prev => ({ ...prev, endDate: date }));
                                                setCurrentPage(1);
                                            }}
                                            initialFocus
                                            className="dark:bg-slate-900 dark:text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Positions Table */}
            <Card className="border-0 shadow-sm dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold dark:text-white">All Jobs</CardTitle>
                            <CardDescription className="dark:text-slate-400">Manage and organize job positions in your organization</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Show:</Label>
                                <Select
                                    value={rowsPerPage.toString()}
                                    onValueChange={handlePageSizeChange}
                                >
                                    <SelectTrigger className="w-20 h-8 dark:bg-slate-800 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-slate-600 dark:text-slate-400">Loading positions...</span>
                            </div>
                        </div>
                    ) : positions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Building2 className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">No positions found</h3>
                        </div>
                    ) : (
                        <div className="pm-table-wrapper">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent pm-table-header-row">
                                        <TableHead className="w-8 md:hidden px-2"></TableHead>
                                        <TableHead className="w-8 font-semibold text-slate-700 dark:text-slate-300 px-2 text-center">#</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 ">Position Name</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 desktop-only text-center">Salary</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 desktop-only text-center">Experience</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 desktop-only text-center">Vacancies</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 desktop-only text-center">Shift</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 desktop-only text-center">Job Type</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 desktop-only text-center">Created</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {positions.map((pos, index) => (
                                        <>
                                            <TableRow key={pos._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                                <TableCell className="md:hidden w-8 px-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRow(pos._id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {expandedRows.has(pos._id) ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="w-8 px-2 text-center text-slate-600 dark:text-slate-400">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                                                <TableCell className="min-w-0">
                                                    <div className="flex items-center  space-x-3 min-w-0">
                                                        <div className="pm-job-icon w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                                            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="font-medium text-slate-800 dark:text-slate-200 break-words line-clamp-2">{pos.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="desktop-only text-center">{pos.salary || 0}</TableCell>
                                                <TableCell className="desktop-only text-center">{pos.experience || 'N/A'}</TableCell>
                                                <TableCell className="desktop-only text-center">{pos.vacancies || 0}</TableCell>
                                                <TableCell className="desktop-only text-center">{pos.shift}</TableCell>
                                                <TableCell className="desktop-only text-center">{pos.jobType}</TableCell>
                                                <TableCell className="desktop-only text-center">
                                                    {pos.createdAt ? new Date(pos.createdAt).toLocaleDateString() : "N/A"}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onView ? onView(pos) : console.log('View', pos)}
                                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-blue-900/50"
                                                            title="View Position"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onEdit(pos)}
                                                            className="h-8 w-8 p-0 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                                            title="Edit Position"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setDeleteConfirm({ open: true, id: pos._id })}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:bg-slate-800 dark:border-red-900/50"
                                                            title="Delete Position"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedRows.has(pos._id) && (
                                                <TableRow className="md:hidden border-none overflow-hidden hover:bg-transparent">
                                                    <TableCell colSpan={4} className="p-2 border-none pt-0">
                                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-100 dark:border-slate-700/50 p-5 mx-2 backdrop-blur-sm mt-1 mb-4">
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Salary</p>
                                                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{pos.salary || 0}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Vacancies</p>
                                                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{pos.vacancies || 0}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Job Type</p>
                                                                        <p className="text-slate-800 dark:text-slate-200 font-medium capitalize">{pos.jobType}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Experience</p>
                                                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{pos.experience || 'N/A'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Shift</p>
                                                                        <p className="text-slate-800 dark:text-slate-200 font-medium capitalize">{pos.shift}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Created</p>
                                                                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                                                                            {pos.createdAt ? new Date(pos.createdAt).toLocaleDateString() : "N/A"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {/* Pagination UI */}
                {positions.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center">
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
                )}
            </Card>

            {/* Delete Order Confirmation Dialog */}
            <Dialog
                open={deleteConfirm.open}
                onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null })}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl font-semibold dark:text-white">Confirm Delete</DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 dark:text-white">
                        <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this job post ? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
                            <Button variant="destructive" onClick={() => deletePosition(deleteConfirm.id)}>Delete Position</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

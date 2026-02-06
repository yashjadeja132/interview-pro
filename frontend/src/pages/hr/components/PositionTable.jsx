import { useState, useEffect } from "react";
import axios from "axios";
import {
    Search,
    Filter,
    Building2,
    Trash2,
    Edit3,
    AlertTriangle,
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
import { toast } from "sonner";
import axiosInstance from "@/Api/axiosInstance";

export default function PositionTable({ onEdit, refreshTrigger }) {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        vacancy: "",
        jobType: "all",
        salary: "",
        shift: "all",
        experience: "all",
    });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    const fetchPositions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filters.vacancy) params.append('vacancy', filters.vacancy);
            if (filters.jobType !== 'all') params.append('jobType', filters.jobType);
            if (filters.salary) params.append('salary', filters.salary);
            if (filters.shift !== 'all') params.append('shift', filters.shift);
            if (filters.experience !== 'all') params.append('experience', filters.experience);

            const res = await axios.get(`http://localhost:5000/api/position?${params.toString()}`);
            setPositions(res.data.data || []);
        } catch (err) {
            console.error("Error fetching positions", err);
            toast.error("Failed to load positions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, [searchTerm, filters, refreshTrigger]);

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
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search positions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-80 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`h-10 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 ${showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter {showFilters ? '▲' : '▼'}
                            </Button>
                            {(filters.vacancy || filters.jobType !== 'all' || filters.salary || filters.shift !== 'all' || filters.experience !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilters({ vacancy: "", jobType: "all", salary: "", shift: "all", experience: "all" })}
                                    className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {positions.length} position{positions.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Vacancies</label>
                                    <Input
                                        type="number"
                                        placeholder="Min vacancies"
                                        value={filters.vacancy}
                                        onChange={(e) => setFilters({ ...filters, vacancy: e.target.value })}
                                        className="h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
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
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Min Salary</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 50000"
                                        value={filters.salary}
                                        onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                                        className="h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
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
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Positions Table */}
            <Card className="border-0 shadow-sm dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold dark:text-white">All Jobs</CardTitle>
                    <CardDescription className="dark:text-slate-400">Manage and organize job positions in your organization</CardDescription>
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
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">#</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Position Name</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Salary</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Experience</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Vacancies</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Shift</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Job Type</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Created</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {positions.map((pos, index) => (
                                        <TableRow key={pos._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">{pos.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{pos.salary || 0}</TableCell>
                                            <TableCell>{pos.experience || 'N/A'}</TableCell>
                                            <TableCell>{pos.vacancies || 0}</TableCell>
                                            <TableCell>{pos.shift}</TableCell>
                                            <TableCell>{pos.jobType}</TableCell>
                                            <TableCell>
                                                {pos.createdAt ? new Date(pos.createdAt).toLocaleDateString() : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onEdit(pos)}
                                                        className="h-8 w-8 p-0 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDeleteConfirm({ open: true, id: pos._id })}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:bg-slate-800 dark:border-red-900/50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
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
                        <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this position? This action cannot be undone.</p>
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

import { useState, useEffect } from "react";
import {
    Search,
    Edit2,
    Trash2,
    AlertCircle,
    Clock,
    Mail,
    Phone,
    XCircle,
    Check,
    Users,
    ChevronLeft,
    ChevronRight
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
import { Checkbox } from "@/components/ui/checkbox";
import api from '../../../Api/axiosInstance';

export default function CandidateTable({ positions, onEdit, refreshTrigger }) {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCandidates, setTotalCandidates] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        position: "",
        experience: "",
        status: ""
    });

    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [showBulkDelete, setShowBulkDelete] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: search.trim(),
                ...filters
            };
            const { data } = await api.get("/hr", { params });
            setCandidates(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalCandidates(data.pagination?.total || 0);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch candidates");
            console.error("Failed to fetch candidates:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [currentPage, search, filters, rowsPerPage, refreshTrigger]);

    const getScheduleStatus = (isSubmitted) => {
        if (isSubmitted === 1) {
            return { status: 'completed', color: 'text-green-600', bg: 'bg-green-100' };
        } else {
            return { status: 'pending', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        }
    };

    const getExperienceBadgeVariant = (experience) => {
        switch (experience) {
            case 'fresher': return 'secondary';
            case '1-2': return 'default';
            case '3-5': return 'default';
            case '5+': return 'default';
            default: return 'outline';
        }
    };

    const getExperienceDisplayText = (experience) => {
        switch (experience) {
            case 'fresher': return 'Fresher (0-1 years)';
            case '1-2': return '1-2 Years';
            case '3-5': return '3-5 Years';
            case '5+': return '5+ Years';
            default: return experience || 'N/A';
        }
    };

    const handleSelectCandidate = (candidateId) => {
        setSelectedCandidates(prev => {
            const newSelection = prev.includes(candidateId)
                ? prev.filter(id => id !== candidateId)
                : [...prev, candidateId];
            setShowBulkDelete(newSelection.length > 0);
            setIsAllSelected(newSelection.length === candidates.length && candidates.length > 0);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedCandidates([]);
            setShowBulkDelete(false);
            setIsAllSelected(false);
        } else {
            const allIds = candidates.map(c => c._id);
            setSelectedCandidates(allIds);
            setShowBulkDelete(allIds.length > 0);
            setIsAllSelected(allIds.length > 0);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await api.delete('/hr/bulk', {
                data: { candidateIds: selectedCandidates }
            });
            setSelectedCandidates([]);
            setShowBulkDelete(false);
            setIsAllSelected(false);
            setShowBulkDeleteConfirm(false);
            fetchCandidates();
        } catch (err) {
            console.error("Failed to delete candidates:", err);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/hr/${deleteId}`);
            setDeleteId(null);
            fetchCandidates();
        } catch (err) {
            console.error("Failed to delete candidate:", err);
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
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search candidates..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap hidden sm:block">Position:</Label>
                                <Select
                                    value={filters.position || "all"}
                                    onValueChange={(value) => {
                                        setFilters(prev => ({ ...prev, position: value === "all" ? "" : value }));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className={`w-40 sm:w-48 h-10 ${filters.position ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'dark:bg-slate-800 dark:border-slate-700 dark:text-white'}`}>
                                        <SelectValue placeholder="All Positions" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                        <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">All Positions</SelectItem>
                                        {positions.map((pos) => (
                                            <SelectItem key={pos._id} value={pos._id} className="dark:text-white dark:focus:bg-slate-700">{pos.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filters.position && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setFilters(prev => ({ ...prev, position: "" }));
                                            setCurrentPage(1);
                                        }}
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {candidates.length} of {totalCandidates} candidates
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold dark:text-white">All Candidates</CardTitle>
                            <CardDescription className="dark:text-slate-400">Manage and view all candidate information</CardDescription>
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
                            {showBulkDelete && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCandidates([]);
                                            setShowBulkDelete(false);
                                            setIsAllSelected(false);
                                        }}
                                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowBulkDeleteConfirm(true)}
                                    >
                                        Delete ({selectedCandidates.length})
                                    </Button>
                                </div>
                            )}
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
                    ) : candidates.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">No candidates found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={handleSelectAll}
                                                    className="dark:border-slate-500"
                                                />
                                            </TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">#</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Candidate</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Contact</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Experience</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Job Post</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Test Duration</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {candidates.map((candidate, idx) => (
                                            <TableRow key={candidate._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedCandidates.includes(candidate._id)}
                                                        onCheckedChange={() => handleSelectCandidate(candidate._id)}
                                                        className="dark:border-slate-500"
                                                    />
                                                </TableCell>
                                                <TableCell>{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                                                <TableCell>
                                                    <p className="font-medium text-slate-900 dark:text-white">{candidate.name || 'N/A'}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            <span className="text-sm text-slate-600 dark:text-slate-300">{candidate.email || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            <span className="text-sm text-slate-600 dark:text-slate-300">{candidate.phone || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getExperienceBadgeVariant(candidate.experience)} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                                        {getExperienceDisplayText(candidate.experience)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                                        {candidate.positionName || positions.find(p => p._id === candidate.position)?.name || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScheduleStatus(candidate.isSubmitted).bg} ${getScheduleStatus(candidate.isSubmitted).color}`}>
                                                        {getScheduleStatus(candidate.isSubmitted).status}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                                            {candidate.timeforTest ? `${candidate.timeforTest} min` : 'No time'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                                            disabled={candidate.isSubmitted === 1}
                                                            onClick={() => onEdit(candidate)}
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-red-900/50"
                                                            onClick={() => setDeleteId(candidate._id)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination UI */}
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    >
                                        <ChevronRight className="w-4 h-4" />
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
                        <p className="dark:text-white">Are you sure you want to delete this candidate? This action cannot be undone.</p>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete UI */}
            <Dialog open={showBulkDeleteConfirm} onOpenChange={() => setShowBulkDeleteConfirm(false)}>
                <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Confirm Bulk Delete</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="dark:text-white">Are you sure you want to delete {selectedCandidates.length} candidates? This action cannot be undone.</p>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)} className="dark:bg-slate-800 dark:text-white dark:border-slate-700">Cancel</Button>
                        <Button variant="destructive" onClick={handleBulkDelete}>Delete All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

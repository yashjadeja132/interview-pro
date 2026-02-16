import React, { useState, useEffect } from "react";
import axiosInstance from "../../Api/axiosInstance";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Briefcase, GraduationCap, ChevronLeft, ChevronRight, Filter, Search, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "../../assets/css/ShortlistedCandidate.css";

export default function SelectForInterview() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
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

    const fetchSelectedCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit,
                search: search.trim(),
                isSelectedForInterview: true
            };
            const { data } = await axiosInstance.get("/test", { params });
            setResults(data.data);
            setTotalPages(data.pagination.totalPages);
            setTotalResults(data.pagination.total);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch selected candidates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSelectedCandidates();
    }, [page, limit, search]);

    const getScoreBadgeVariant = (score) => {
        if (score >= 80) return "default";
        if (score >= 60) return "secondary";
        return "destructive";
    };

    const getExperienceDisplayText = (experience) => {
        switch (experience) {
            case 'fresher': return 'Fresher';
            case '1-2': return '1-2 Years';
            case '3-5': return '3-5 Years';
            case '5+': return '5+ Years';
            default: return experience || 'N/A';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                            <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Selected for Interview</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Shortlisted candidates for the next round</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Search Section */}
                <Card className="border-0 shadow-sm dark:bg-slate-900">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search selected candidates..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Show:</Label>
                                    <Select
                                        value={limit.toString()}
                                        onValueChange={(val) => {
                                            setLimit(parseInt(val));
                                            setPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-20 h-8 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
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
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    Total Selected: <span className="font-semibold text-slate-900 dark:text-white">{totalResults}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card className="border-0 shadow-sm dark:bg-slate-900 overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">Loading candidates...</span>
                                </div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                    <UserCheck className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No candidates selected yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                    Go to Candidate Monitoring to shortlist candidates for interview.
                                </p>
                            </div>
                        ) : (
                            <div className="pm-table-wrapper">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 pm-table-header-row">
                                            <TableHead className="w-8 md:hidden p-0 text-center"></TableHead>
                                            <TableHead className="w-12 text-center font-bold">#</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Candidate Name</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 desktop-only">Email Address</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 desktop-only">Experience</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-center">Test Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((r, idx) => (
                                            <React.Fragment key={r._id}>
                                                <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800 transition-colors">
                                                    <TableCell className="md:hidden w-8 p-0 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRow(r._id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {expandedRows.has(r._id) ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium text-slate-500 dark:text-slate-400">
                                                        {(page - 1) * limit + idx + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                                                                <User className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <span className="font-semibold text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-none block">{r.candidateName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="desktop-only">
                                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                            <Mail className="w-4 h-4 text-slate-400" />
                                                            {r.candidateEmail}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="desktop-only">
                                                        <Badge variant="outline" className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                                            {getExperienceDisplayText(r.experience)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={getScoreBadgeVariant(r.score)} className="font-bold px-3 py-1">
                                                            {Math.round(r.score)}%
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedRows.has(r._id) && (
                                                    <TableRow className="md:hidden bg-slate-50/50 dark:bg-slate-800/20 border-none hover:bg-transparent">
                                                        <TableCell colSpan={2} className="border-none p-0 w-16"></TableCell> {/* Skip Chevron & Index */}
                                                        <TableCell colSpan={3} className="p-4 align-top border-none min-w-0">
                                                            <div className="grid grid-cols-1 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Contact Details</p>
                                                                    <div className="mt-1.5 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                        <span className="break-all">{r.candidateEmail}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider">Experience Level</p>
                                                                    <div className="mt-1.5">
                                                                        <Badge variant="outline" className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                                                            {getExperienceDisplayText(r.experience)}
                                                                        </Badge>
                                                                    </div>
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
                        )}
                    </CardContent>
                </Card>

                {/* Pagination Section */}
                {results.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                            Showing <span className="font-medium text-slate-900 dark:text-white">{results.length}</span> of <span className="font-medium text-slate-900 dark:text-white">{totalResults}</span> candidates
                        </div>
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 dark:disabled:opacity-50 h-9"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                    if (pageNum > totalPages || pageNum < 1) return null;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(pageNum)}
                                            className={`w-9 h-9 p-0 ${pageNum === page ? "bg-green-600 hover:bg-green-700" : "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"}`}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 dark:disabled:opacity-50 h-9"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Mail } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTimeToIST } from "@/utils/dateHelper";

// Experience pluralization helper
const formatExperience = (exp) => {
    if (!exp) return 'N/A';
    return exp
        .replace(/(\d+)\s*year\b/gi, (match, p1) => parseInt(p1) === 1 ? `${p1} year` : `${p1} years`)
        .replace(/(\d+)\s*month\b/gi, (match, p1) => parseInt(p1) === 1 ? `${p1} month` : `${p1} months`);
};
export default function CandidatesListDialog({
    open,
    onOpenChange,
    positionName,
    candidates,
    loading,
}) {
    console.log(candidates);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl dark:bg-slate-900 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold dark:text-white">
                        Candidates for {positionName}
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full dark:bg-slate-800" />
                            ))}
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            No candidates found for this position.
                        </div>
                    ) : (
                        <div className="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                                            <TableHead className="font-bold">#</TableHead>
                                            <TableHead className="font-bold">Name</TableHead>
                                            <TableHead className="font-bold">Phone</TableHead>
                                            <TableHead className="font-bold">Experience</TableHead>
                                            <TableHead className="font-bold">Test Status</TableHead>
                                            <TableHead className="font-bold">Scheduled Test Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {candidates.map((candidate, idx) => (
                                            <TableRow key={candidate._id} className="dark:border-slate-800">
                                                <TableCell className="dark:text-slate-400">{idx + 1}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium dark:text-white">{candidate.name}</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {candidate.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="dark:text-slate-300">
                                                    {candidate.phone || "N/A"}
                                                </TableCell>
                                                <TableCell className="dark:text-slate-300">
                                                    {formatExperience(candidate.experience)}
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                     ${candidate.isSubmitted === 0  ? "bg-yellow-100 text-yellow-800"
                                     : candidate.isSubmitted === 1? "bg-green-100 text-green-800"
                                     : candidate.isSubmitted === 2? "bg-red-100 text-red-800"
                                     : "bg-gray-100 text-gray-700"
                                     }
                                                    `}
                                                    >
                                                        {candidate.isSubmitted === 0 ? "Pending" : candidate.isSubmitted === 1 ? "Completed" : candidate.isSubmitted === 2 ? "expired" : ""}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="dark:text-slate-300 whitespace-nowrap">
                                                    {formatDateTimeToIST(candidate.schedule)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {candidates.map((candidate, idx) => (
                                    <div key={candidate._id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                                                <h3 className="font-bold dark:text-white">{candidate.name}</h3>
                                            </div>
                                            <div
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${candidate.isSubmitted === 1
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    }`}
                                            >
                                                {candidate.isSubmitted === 1 ? "Completed" : "Pending"}
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate">{candidate.email}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Phone</p>
                                                    <p className="dark:text-slate-300">{candidate.phone || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Experience</p>
                                                    <p className="dark:text-slate-300">{formatExperience(candidate.experience)}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Scheduled Date</p>
                                                <p className="dark:text-slate-300">{formatDateTimeToIST(candidate.schedule)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

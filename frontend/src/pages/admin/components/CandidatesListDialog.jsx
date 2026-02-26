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
import { formatDateToIST } from "@/utils/dateHelper";

export default function CandidatesListDialog({
    open,
    onOpenChange,
    positionName,
    candidates,
    loading,
}) {
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
                        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto pr-2 custom-scrollbar">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                                        <TableHead className="font-bold">#</TableHead>
                                        <TableHead className="font-bold">Name</TableHead>
                                        <TableHead className="font-bold">Experience</TableHead>
                                        <TableHead className="font-bold">Test Status</TableHead>
                                        <TableHead className="font-bold">Date</TableHead>
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
                                                {candidate.experience || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${candidate.isSubmitted === 1
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        }`}
                                                >
                                                    {candidate.isSubmitted === 1 ? "Completed" : "Pending"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-slate-300 whitespace-nowrap">
                                                {formatDateToIST(candidate.schedule)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

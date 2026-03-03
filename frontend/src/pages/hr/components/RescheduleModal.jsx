import { useState, useEffect } from "react";
import { Calendar, AlertCircle, Clock, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "../../../Api/axiosInstance";

export default function RescheduleModal({ isOpen, onClose, candidate, onSuccess }) {
    const [newSchedule, setNewSchedule] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (isOpen) {
            setNewSchedule("");
            setError("");
            setSuccessMsg("");
        }
    }, [isOpen]);

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return "Not scheduled";
        return new Date(dateStr).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const handleSubmit = async () => {
        setError("");
        setSuccessMsg("");

        if (!newSchedule) {
            setError("Please select a new schedule time");
            return;
        }

        const newDate = new Date(newSchedule);
        if (newDate < new Date()) {
            setError("New schedule cannot be in the past");
            return;
        }

        if (candidate?.schedule) {
            const oldDate = new Date(candidate.schedule);
            if (newDate.getTime() === oldDate.getTime()) {
                setError("New schedule must be different from the current schedule");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await api.put(`/hr/${candidate._id}/reschedule`, { newSchedule });
            setSuccessMsg("Interview rescheduled successfully! Notification email sent.");
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reschedule interview");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                className="max-w-md dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-white">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Reschedule Interview
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Candidate Info */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {candidate?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {candidate?.positionName || "N/A"}
                        </p>
                    </div>

                    {/* Previous Schedule */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium dark:text-slate-300">
                            Previous Schedule
                        </Label>
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <Clock className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-sm font-medium text-red-700 dark:text-red-400 line-through">
                                {formatDisplayDate(candidate?.schedule)}
                            </span>
                        </div>
                    </div>

                    {/* New Schedule */}
                    <div className="space-y-1.5">
                        <Label htmlFor="newSchedule" className="text-sm font-medium dark:text-slate-300">
                            New Schedule *
                        </Label>
                        <Input
                            id="newSchedule"
                            type="datetime-local"
                            min={new Date().toISOString().slice(0, 16)}
                            value={newSchedule}
                            onChange={(e) => {
                                setNewSchedule(e.target.value);
                                setError("");
                            }}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {successMsg && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                                <Calendar className="w-4 h-4 shrink-0" />
                                {successMsg}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newSchedule}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Rescheduling...
                            </span>
                        ) : (
                            "Reschedule"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

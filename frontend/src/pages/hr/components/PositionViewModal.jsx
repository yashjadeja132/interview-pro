import {Dialog,DialogContent, DialogHeader,DialogTitle,DialogFooter,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {Building2,Clock,Users,Briefcase,Banknote,Calendar,Layout,HelpCircle,Code,Lightbulb} 
from "lucide-react";

export default function PositionViewModal({ isOpen, onClose, data }) {
    if (!data) return null;
    const totalQuestions = data.techQuestionCount + data.nonTechQuestionCount;
     const DetailItem = ({ icon: Icon, label, value, colorClass = "text-slate-600 dark:text-slate-400" }) => (
        <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className={`mt-0.5 ${colorClass}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{value || "N/A"}</p>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
                <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <DialogTitle className="text-xl font-bold dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>Position Details</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-8">
                    {/* Main Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem icon={Layout} label="Position Name" value={data.name} colorClass="text-blue-500" />
                        <DetailItem icon={Banknote} label="Salary" value={data.salary ? `₹${data.salary.toLocaleString()}` : "0"} colorClass="text-green-500" />
                        <DetailItem icon={Users} label="Total Vacancies" value={data.vacancies} colorClass="text-purple-500" />
                        <DetailItem icon={Clock} label="Test Duration" value={`${data.testDuration} Minutes`} colorClass="text-orange-500" />
                        <DetailItem icon={Briefcase} label="Experience Required" value={data.experience} colorClass="text-indigo-500" />
                        <DetailItem icon={Building2} label="Job Type" value={data.jobType} colorClass="text-pink-500" />
                        <DetailItem icon={Clock} label="Shift" value={data.shift} colorClass="text-cyan-500" />
                        <DetailItem icon={Calendar} label="Created On" value={new Date(data.createdAt).toLocaleDateString()} colorClass="text-slate-500" />
                    </div>

                    {/* Subjects Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <Layout className="w-4 h-4 text-blue-500" />
                            Assigned Subjects
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.subjects && data.subjects.length > 0 ? (
                                data.subjects.map((sub, idx) => (
                                    <Badge
                                        key={sub._id || idx}
                                        variant="outline"
                                        className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                    >
                                        {sub.name || (typeof sub === 'string' ? sub : 'Unnamed Subject')}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic">No subjects assigned.</p>
                            )}
                        </div>
                    </div>

                    {/* Questions Stats Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-indigo-500" />
                            Question Configuration
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Technical</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{data.techQuestionCount || 0}</p>
                                    <span className="text-[10px] text-slate-400 font-medium">/ {data.technicalQuestionCount || 0} Avail.</span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Questions to be Asked</p>
                            </div>

                            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-900/10 hover:border-purple-200 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Non-Technical</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{data.nonTechQuestionCount || 0}</p>
                                    <span className="text-[10px] text-slate-400 font-medium">/ {data.nonTechnicalQuestionCount || 0} Avail.</span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Questions to be Asked</p>
                            </div>

                            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <Layout className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">Total Target</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalQuestions || 0}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Total to be Asked</p>
                            </div>
                        </div>

                        {/* Warning if not enough questions */}
                        {(data.technicalQuestionCount < data.techQuestionCount) && (
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-amber-500" />
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    <span className="font-bold">Notice:</span> Available Technical questions ({data.technicalQuestionCount}) are less than configured ({data.techQuestionCount}).
                                </p>
                            </div>
                        )}
                        {(data.nonTechnicalQuestionCount < data.nonTechQuestionCount) && (
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-amber-500" />
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    <span className="font-bold">Notice:</span> Available Non-Technical questions ({data.nonTechnicalQuestionCount}) are less than configured ({data.nonTechQuestionCount}).
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubjectTable from "./components/SubjectTable";
import SubjectModal from "./components/SubjectModal";
import "@/assets/css/SubjectManagement.css";

function SubjectManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleOpenAddModal = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (subject) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
                <div className="max-w-10xl mx-auto sm-header-container flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="sm-header-info flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Subject Management</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Configure and organize your exam subjects</p>
                        </div>
                    </div>
                    <Button
                        className="h-10 bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto shadow-md shadow-blue-500/10 transition-all active:scale-95"
                        onClick={handleOpenAddModal}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-2 sm:pt-4 max-w-8xl mx-auto">
                <SubjectTable
                    onEdit={handleOpenEditModal}
                    refreshTrigger={refreshTrigger}
                />
            </div>

            {/* Add/Edit Modal */}
            <SubjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingSubject}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

export default SubjectManagement;
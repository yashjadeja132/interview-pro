import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import PositionTable from "./components/PositionTable";
import PositionModal from "./components/PositionModal";

export default function PositionManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAddModal = () => {
    setEditingPosition(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (position) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Toaster richColors position="top-right" closeButton />

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Job Post Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage job positions and roles in your organization</p>
            </div>
          </div>
          <Button
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleOpenAddModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job Post
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <PositionTable onEdit={handleOpenEditModal} refreshTrigger={refreshTrigger} />
      </div>

      {/* Add/Edit Modal */}
      <PositionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingPosition}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import PositionTable from "./components/PositionTable";
import PositionModal from "./components/PositionModal";
import PositionViewModal from "./components/PositionViewModal";
import "@/assets/css/PositionManagement.css";

export default function PositionManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [viewingPosition, setViewingPosition] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAddModal = () => {
    setEditingPosition(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (position) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (position) => {
    setViewingPosition(position);
    setIsViewModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Toaster richColors position="top-right" closeButton />

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto pm-header-container">
          <div className="pm-header-info">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Job Post Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage job positions and roles in your organization</p>
            </div>
          </div>
          <Button
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
            onClick={handleOpenAddModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job Post
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-2 sm:pt-4 max-w-8xl mx-auto">
        <PositionTable
          onEdit={handleOpenEditModal}
          onView={handleOpenViewModal}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Add/Edit Modal */}
      <PositionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingPosition}
        onSuccess={handleSuccess}
      />

      {/* View Modal */}
      <PositionViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={viewingPosition}
      />
    </div>
  );
}

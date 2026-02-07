import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CandidateTable from "./components/CandidateTable";
import CandidateModal from "./components/CandidateModal";
import api from "../../Api/axiosInstance";
export default function CandidateManagement() {
  const [positions, setPositions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch positions once
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await api.get("/position");
        setPositions(res.data.data || []);
      } catch (err) {
        console.error("Failed to load positions", err);
      }
    };
    fetchPositions();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCandidate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Candidate Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and track all candidates in your system</p>
            </div>
            <Button
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleOpenAddModal}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <CandidateTable
          positions={positions}
          onEdit={handleOpenEditModal}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Add/Edit Modal */}
      <CandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingCandidate}
        positions={positions}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

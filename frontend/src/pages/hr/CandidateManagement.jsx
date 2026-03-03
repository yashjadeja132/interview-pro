import { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CandidateTable from "./components/CandidateTable";
import CandidateModal from "./components/CandidateModal";
import RescheduleModal from "./components/RescheduleModal";
import api from "../../Api/axiosInstance";
import "@/assets/css/candidateManagement.css";

export default function CandidateManagement() {
  const [positions, setPositions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleCandidate, setRescheduleCandidate] = useState(null);

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

  const handleOpenRescheduleModal = (candidate) => {
    setRescheduleCandidate(candidate);
    setIsRescheduleOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
        <div className="max-w-10xl mx-auto pm-header-container">
          <div className="pm-header-info">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Candidate Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and track all candidates in your system</p>
            </div>
          </div>
          <Button
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
            onClick={handleOpenAddModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-2 sm:pt-4 max-w-8xl mx-auto">
        <CandidateTable
          positions={positions}
          onEdit={handleOpenEditModal}
          onReschedule={handleOpenRescheduleModal}
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

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        candidate={rescheduleCandidate}
        onSuccess={handleSuccess}
      />
    </div>
  );
}


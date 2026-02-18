import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Building2,
  Target,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/Api/axiosInstance";
import PositionDetailsDialog from "./components/PositionDetailsDialog";
import CandidatesListDialog from "./components/CandidatesListDialog";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalCandidates: 0,
    totalPositions: 0,
    positionDistribution: {},
    totalVacancies: 0,
    vacanciesDistribution: {},
    appliedCandidates: {}
  });
  const [showCandidatesDialog, setShowCandidatesDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [positionCandidates, setPositionCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [positions, setPositions] = useState([]);

  // Function to fetch dashboard stats from API
  const getDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/admin/dashboard/stats');

      if (response.data.success) {
        const data = response.data.data;
        const totalVacancies = Object.values(data.distributions.vacancies || {}).reduce(
          (sum, count) => sum + count,
          0
        );
        console.log(data.distributions);
        setDashboardData({
          totalCandidates: data.overview.totalCandidates,
          totalPositions: data.overview.totalPositions,
          positionDistribution: data.distributions.candidates || {},
          totalVacancies,
          vacanciesDistribution: data.distributions.vacancies || {},
          appliedCandidates: data.distributions.appliedCandidates || {}
        });
      } else {
        console.error('❌ API returned error:', response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const { data } = await axiosInstance.get("/position");
      setPositions(data.data || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  };

  const handlePositionClick = async (positionName) => {
    setSelectedPosition(positionName);
    setShowCandidatesDialog(true);
    setCandidatesLoading(true);
    try {
      // Find position ID by name
      let posId = "";
      const pos = positions.find(p => p.name === positionName);
      if (pos) {
        posId = pos._id;
      }

      if (posId) {
        const { data } = await axiosInstance.get("/hr", {
          params: { position: posId, limit: 100 } // Get a reasonable number of candidates
        });
        console.log(data);
        setPositionCandidates(data.data || []);
      } else {
        setPositionCandidates([]);
      }
    } catch (err) {
      console.error("Failed to fetch candidates for position:", err);
      setPositionCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const [showPositionDialog, setShowPositionDialog] = useState(false);
  const [selectedPositionDetails, setSelectedPositionDetails] = useState(null);

  const handleVacancyClick = (positionName) => {
    const position = positions.find(p => p.name === positionName);
    if (position) {
      setSelectedPositionDetails(position);
      setShowPositionDialog(true);
    }
  };

  const handlePositionUpdate = (updatedPosition) => {
    // Update the positions list with the updated position
    setPositions(prev =>
      prev.map(p => p._id === updatedPosition._id ? updatedPosition : p)
    );
    setSelectedPositionDetails(updatedPosition);
    // Refresh dashboard stats to reflect changes
    getDashboardStats();
  };
  // Call API on component mount
  useEffect(() => {
    getDashboardStats();
    fetchPositions();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 dark:bg-slate-900 "

    // style={{ backgroundColor: primaryColor }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">Overview of your interview system</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-10"
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Current Hiring Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Current Hiring</p>
                    <p className="text-3xl font-bold text-orange-900">{dashboardData.totalVacancies}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Position Distribution
                </CardTitle>
                <CardDescription>
                  Vacancies for each position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.keys(dashboardData.vacanciesDistribution).length > 0 ? (
                    Object.entries(dashboardData.vacanciesDistribution).map(([position, count]) => (
                      <button
                        key={position}
                        onClick={() => handleVacancyClick(position)}
                        className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="text-sm font-medium text-slate-700">{position}</span>
                        </div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700">
                          {count} Vacancies
                        </Badge>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                      <p className="text-gray-600">
                        {loading ? 'Loading position distribution...' : 'No position distribution data found.'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Total Candidates Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Candidates</p>
                    <p className="text-3xl font-bold text-blue-900">{dashboardData.totalCandidates}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Applied*/}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Candidate Applied
                </CardTitle>
                <CardDescription>
                  Candidates applied for each position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.keys(dashboardData.appliedCandidates).length > 0 ? (
                    Object.entries(dashboardData.appliedCandidates).map(([position, count]) => (
                      <button
                        key={position}
                        onClick={() => handlePositionClick(position)}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-black">{position}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100">
                          {count} candidates
                        </Badge>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                      <p className="text-gray-600">
                        {loading ? 'Loading position distribution...' : 'No position distribution data found.'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      {/* Position Details Dialog - Editable */}
      <PositionDetailsDialog
        open={showPositionDialog}
        onOpenChange={setShowPositionDialog}
        position={selectedPositionDetails}
        onUpdate={handlePositionUpdate}
      />

      {/* Candidates List Dialog - Read-only */}
      <CandidatesListDialog
        open={showCandidatesDialog}
        onOpenChange={setShowCandidatesDialog}
        positionName={selectedPosition}
        candidates={positionCandidates}
        loading={candidatesLoading}
      />
    </div>
  );
}

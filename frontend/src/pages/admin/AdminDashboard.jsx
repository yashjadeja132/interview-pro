import { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Target,
  Zap
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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalCandidates: 0,
    totalPositions: 0,
    positionDistribution: {}
  });

  // Function to fetch dashboard stats from API
  const getDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/admin/dashboard/stats');
      
      if (response.data.success) {
        const data = response.data.data;
        setDashboardData({
          totalCandidates: data.overview.totalCandidates,
          totalPositions: data.overview.totalPositions,
          positionDistribution: data.distributions.position || {}
        });
        
        console.log('📊 Dashboard Stats from Backend:', {
          totalCandidates: data.overview.totalCandidates,
          totalPositions: data.overview.totalPositions,
          positionDistribution: data.distributions.position
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

  // Call API on component mount
  useEffect(() => {
    getDashboardStats();
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Candidates</p>
                  <p className="text-3xl font-bold text-blue-900">{dashboardData.totalCandidates}</p>
                  <p className="text-xs text-blue-700 mt-1">All registered candidates</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Available Positions</p>
                  <p className="text-3xl font-bold text-orange-900">{dashboardData.totalPositions}</p>
                  <p className="text-xs text-orange-700 mt-1">Open positions</p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Position Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Position Distribution
            </CardTitle>
            <CardDescription>
              Candidates applied for each position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.keys(dashboardData.positionDistribution).length > 0 ? (
                Object.entries(dashboardData.positionDistribution).map(([position, count]) => (
                  <div key={position} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-slate-700">{position}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {count} candidates
                    </Badge>
                  </div>
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
  );
}

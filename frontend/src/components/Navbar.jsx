import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Settings, User, LogOut, Home, ChevronDown, Mail, Briefcase, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import axiosInstance from "@/Api/axiosInstance";

export default function Navbar({ heading = "Admin Dashboard" }) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // const [retestRequests, setRetestRequests] = useState([]);
  // const [pendingCount, setPendingCount] = useState(0);
  // const [loadingRequests, setLoadingRequests] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch retest requests
  // const fetchRetestRequests = async () => {
  //   try {
  //     setLoadingRequests(true);
  //     const response = await axiosInstance.get('/admin/retest-requests/pending');
  //     if (response.data.success) {
  //       setRetestRequests(response.data.requests || []);
  //       setPendingCount(response.data.count || 0);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching retest requests:', error);
  //     setRetestRequests([]);
  //     setPendingCount(0);
  //   } finally {
  //     setLoadingRequests(false);
  //   }
  // };

  // Fetch pending count on mount and when notification panel opens
  // useEffect(() => {
  //   fetchRetestRequests();
  //   // Refresh every 30 seconds
  //   const interval = setInterval(fetchRetestRequests, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   if (isNotificationOpen) {
  //     fetchRetestRequests();
  //   }
  // }, [isNotificationOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle approve/reject retest request
  // const handleApproveRetest = async (requestId) => {
  //   try {
  //     const response = await axiosInstance.put(`/admin/retest-requests/${requestId}/approve`);
  //     if (response.data.success) {
  //       fetchRetestRequests(); // Refresh list
  //     }
  //   } catch (error) {
  //     console.error('Error approving retest request:', error);
  //     alert('Failed to approve retest request');
  //   }
  // };

  // const handleRejectRetest = async (requestId) => {
  //   const reason = prompt('Please provide a reason for rejection (optional):');
  //   try {
  //     const response = await axiosInstance.put(`/admin/retest-requests/${requestId}/reject`, { reason });
  //     if (response.data.success) {
  //       fetchRetestRequests(); // Refresh list
  //     }
  //   } catch (error) {
  //     console.error('Error rejecting retest request:', error);
  //     alert('Failed to reject retest request');
  //   }
  // };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("token");
    sessionStorage.clear();
    // Navigate to login page
    navigate("/admin/login");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  // Get user info from localStorage or sessionStorage
  const getUserInfo = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // You can decode JWT token here if needed
        return {
          name: "Admin User",
          email: "admin@interviewpro.com",
          role: "Administrator"
        };
      } catch (error) {
        return {
          name: "Admin User",
          email: "admin@interviewpro.com",
          role: "Administrator"
        };
      }
    }
    return {
      name: "Admin User",
      email: "admin@interviewpro.com",
      role: "Administrator"
    };
  };

  const userInfo = getUserInfo();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm transition-colors duration-200">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200" />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{heading}</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 h-8 px-3 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm font-medium">{userInfo.name}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-50">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium dark:text-slate-100">{userInfo.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{userInfo.email}</p>
                <p className="text-xs text-blue-600 font-medium">{userInfo.role}</p>
              </div>
              <div className="py-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm dark:text-slate-300 dark:hover:bg-slate-800"
                  asChild
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Link to="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Sidebar */}
      {/* <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-xl font-bold text-slate-800">Notifications</SheetTitle>
                  <p className="text-sm text-slate-500 mt-1">Retest requests from candidates</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchRetestRequests}
                  disabled={loadingRequests}
                  className="h-8"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingRequests ? (
                <div className="text-center py-8 text-slate-500">Loading requests...</div>
              ) : retestRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No pending retest requests</p>
                </div>
              ) : (
                retestRequests.map((request) => {
                  const candidate = request.candidateId;
                  const position = request.positionId;
                  const initials = candidate?.name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'NA';
                  
                  const handleCardClick = (e) => {
                    // Don't navigate if clicking on buttons
                    if (e.target.closest('button')) {
                      return;
                    }
                    // Navigate to candidate history page
                    if (candidate?._id && position?._id) {
                      navigate(`/candidate/${candidate._id}/position/${position._id}/history`);
                      setIsNotificationOpen(false);
                    }
                  };

                  return (
                    <div
                      key={request._id}
                      onClick={handleCardClick}
                      className="group relative p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                              {candidate?.name || 'Unknown Candidate'}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                              Retest Request
                            </span>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="truncate">{candidate?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-700">{position?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveRetest(request._id);
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectRetest(request._id);
                              }}
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50 text-xs h-8"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet> */}
    </header>
  );
}

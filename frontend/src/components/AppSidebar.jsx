import {
  Home,
  UserCheck,
  Monitor,
  FileText,
  Building2,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    title: "Job Post Management",
    url: "/positionManagement",
    icon: Building2,
    description: "Job positions and roles",
  },
  {
    title: "Candidate Management",
    url: "/candidateManagement",
    icon: UserCheck,
    description: "Manage candidates",
  },
  {
    title: "Candidate Monitoring",
    url: "/candidateMonitoring",
    icon: Monitor,
    description: "Monitor interviews",
  },
 
  {
    title: "Question Management",
    url: "/questionManagement",
    icon: Database,
    description: "Manage questions by position",
  },
  
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
];

export default function AppSidebar() {
  const navigate = useNavigate();

  // ✅ LOGOUT HANDLER (FIXED)
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();

    // replace: true = back button disable
    navigate("/admin/login", { replace: true });
  };

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="border-r border-slate-200"
    >
      {/* ================= HEADER ================= */}
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    InterviewPro
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Admin Portal
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ================= NAVIGATION ================= */}
      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="h-12 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Link
                  to={item.url}
                  className="flex items-center space-x-3 w-full"
                >
                  <item.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.title}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* ================= FOOTER / LOGOUT ================= */}
      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* ✅ IMPORTANT: SidebarMenuButton use kiya */}
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-12 w-full justify-start rounded-lg
                         hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:text-slate-200 dark:hover:text-red-400"
              tooltip="Logout"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

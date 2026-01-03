import { 
  Home, 
  Users, 
  UserCheck, 
  Monitor, 
  FileText, 
  Building2, 
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Database,
  ClipboardList
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
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import sparrowLogo from "../assets/sparrowlogo.png";

const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/admin/dashboard", 
    icon: Home,
    description: "Overview and analytics"
  },
  { 
    title: "Position Management", 
    url: "/positionManagement", 
    icon: Building2,
    description: "Job positions and roles"
  },
  { 
    title: "Candidate Management", 
    url: "/candidateManagement", 
    icon: UserCheck,
    description: "Manage candidates"
  },
  // { 
  //   title: "Attempt Management", 
  //   url: "/attemptManagement", 
  //   icon: ClipboardList,
  //   description: "View and manage test attempts"
  // },
  // { 
  //   title: "Attempt Test", 
  //   url: "/attemptManagementTest", 
  //   icon: ClipboardList,
  //   description: "Test API connection"
  // },
  { 
    title: "Candidate Monitoring", 
    url: "/candidateMonitoring", 
    icon: Monitor,
    description: "Monitor interviews"
  },
  { 
    title: "Create Questions", 
    url: "/createQuestion", 
    icon: FileText,
    description: "Add new questions"
  },
  { 
    title: "Question Management", 
    url: "/questionManagement", 
    icon: Database,
    description: "Manage questions by position"
  },
  { 
    title: "Analytics", 
    url: "/admin/analytics", 
    icon: BarChart3,
    description: "Reports and insights"
  },
  { 
    title: "Settings", 
    url: "/admin/settings", 
    icon: Settings,
    description: "System configuration"
  },
];

export default function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("token");
    sessionStorage.clear();
    // Navigate to login page
    navigate("/adminAndHRLogin");
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-slate-200">
      {/* Header */}
      <SidebarHeader className="border-b border-slate-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-slate-800">InterviewPro</span>
                  <span className="text-xs text-slate-500">Admin Portal</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-12 hover:bg-slate-100 rounded-lg">
                <Link to={item.url} className="flex items-center space-x-3 w-full">
                  <item.icon className="w-5 h-5 text-slate-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-slate-800">{item.title}</span>
                    <span className="text-xs text-slate-500">{item.description}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start h-12 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

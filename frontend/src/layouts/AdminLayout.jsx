import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // If no session token, check if there's a legacy localStorage token and migrate/clear it
    const legacyToken = localStorage.getItem("token");
    if (legacyToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate, token]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-background p-3">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

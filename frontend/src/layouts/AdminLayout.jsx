import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
    const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar heading="Admin Dashboard" />

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-background p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

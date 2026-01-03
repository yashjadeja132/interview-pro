import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar heading="Admin Dashboard" />
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-slate-50/50 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AlertTriangle, Bell, User } from "lucide-react";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card px-4 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex-1 flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">PrivacyAtlas</span>
              <span className="text-muted-foreground">/ Compliance Console</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/30 rounded-full px-3 py-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Auto-generated content requires human review
            </div>
            <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">MS</div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium">Maria Santos</span>
                <span className="text-[10px] text-muted-foreground">DPO · Acme Corp</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

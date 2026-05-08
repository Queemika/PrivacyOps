import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AlertTriangle, Bell, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCompliance } from "@/context/ComplianceContext";
import ComplianceModeSelect from "./ComplianceModeSelect";
import InsightPanel from "./InsightPanel";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { guidanceEnabled, setGuidanceEnabled } = useCompliance();
  const nav = useNavigate();
  const initials = user ? (user.firstName[0] + user.lastName[0]).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-3 border-b bg-card px-4 sticky top-0 z-30">
          <div className="flex-1 flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">PrivacyAtlas</span>
            <span className="text-muted-foreground">/ Compliance Console</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/30 rounded-full px-3 py-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Auto-generated content requires human review
          </div>

            <ComplianceModeSelect />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" aria-label="Settings">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">Settings</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={guidanceEnabled} onCheckedChange={setGuidanceEnabled}>
                  Enable Compliance Guidance
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" aria-label="Notifications">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 border-l hover:opacity-90">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">{initials}</div>
                  <div className="hidden sm:flex flex-col leading-tight items-start">
                    <span className="text-xs font-medium">{user ? `${user.firstName} ${user.lastName}` : "Guest"}</span>
                    <span className="text-[10px] text-muted-foreground">{user?.email ?? "Not signed in"}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">
                  <div>{user ? `${user.firstName} ${user.lastName}` : "Guest"}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); nav("/login", { replace: true }); }}>
                  <LogOut className="h-4 w-4 mr-2" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <div className="flex-1 flex min-w-0">
          <main className="flex-1 p-6 overflow-x-hidden min-w-0">
            <Outlet />
          </main>
          <InsightPanel />
        </div>
      </div>
    </div>
  );
}


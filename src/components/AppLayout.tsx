import { Outlet, useNavigate, Link } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AlertTriangle, Bell, LogOut, Settings, ArrowLeft, Home, Search, Sparkles, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCompliance } from "@/context/ComplianceContext";
import ComplianceModeSelect from "./ComplianceModeSelect";
import InsightPanel from "./InsightPanel";
import { useEffect, useState } from "react";
import { ensureSeedEngagement } from "@/lib/pia/store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { guidanceEnabled, setGuidanceEnabled } = useCompliance();
  const nav = useNavigate();
  const initials = user ? (user.firstName[0] + user.lastName[0]).toUpperCase() : "U";
  const [engagement, setEngagement] = useState<{ id: string; clientName: string } | null>(null);

  useEffect(() => {
    try { const e = ensureSeedEngagement(); setEngagement({ id: e.id, clientName: e.clientName }); } catch { /* noop */ }
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-2 border-b bg-card px-4 sticky top-0 z-30">
          {/* Back + Home */}
          <button onClick={() => nav(-1)} className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" title="Back" aria-label="Back">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <Link to="/" className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" title="Home" aria-label="Home">
            <Home className="h-4 w-4 text-muted-foreground" />
          </Link>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground pl-2 border-l">
            <span className="font-medium text-foreground">PrivacyAtlas</span>
            <span>/ Compliance Console</span>
          </div>

          {/* Engagement chip */}
          {engagement && (
            <Link to="/engagements" title="Switch engagement"
              className="hidden lg:inline-flex items-center gap-1.5 ml-2 h-7 px-2.5 rounded-full border bg-accent/5 hover:bg-accent/10 text-[11px] font-medium">
              <Briefcase className="h-3 w-3 text-accent" />
              {engagement.clientName}
              <span className="text-muted-foreground">· {engagement.id}</span>
            </Link>
          )}

          {/* Global search */}
          <div className="flex-1 mx-3 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search PIAs, DRL, engagements…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = (e.target as HTMLInputElement).value.trim();
                    if (q) nav(`/library?q=${encodeURIComponent(q)}`);
                  }
                }}
                className="w-full h-8 pl-8 pr-2 rounded-md bg-muted/40 border text-xs outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="hidden xl:flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/30 rounded-full px-3 py-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Auto-generated content requires human review
          </div>

          {/* DPbot stub */}
          <button
            onClick={() => toast.info("DPbot is coming soon — privacy law assistant", { description: "Will answer DPA / NPC / GDPR / CCPA questions in plain language." })}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/20 text-xs font-medium"
            title="DPbot — Privacy law assistant"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="hidden sm:inline">DPbot</span>
          </button>

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

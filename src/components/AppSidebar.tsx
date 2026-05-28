import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, Library, BarChart3, ListChecks,
  Shield, Lock, Camera, Eye, BookOpen, Mail, Settings, LogOut, ShieldCheck, HelpCircle, ScrollText, Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useMyRoles } from "@/lib/roles/store";
import { useEffect, useState } from "react";
import { ensureSeedEngagement, loadEngagements, getActiveEngagementId } from "@/lib/pia/store";
import { isPathVisible, getViewAsRole, setViewAsRole } from "@/lib/admin/roleVisibility";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

type Item = { title: string; url: string; icon: any };

const items: Item[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: CalendarIcon },
  { title: "Transcript", url: "/upload", icon: Upload },
  { title: "PIA", url: "/library", icon: Library },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "DRL / IRL", url: "/drl", icon: ListChecks },
  { title: "PRADAR (5-in-1)", url: "/pradar", icon: Shield },
  { title: "Tech Security", url: "/tsa", icon: Lock },
  { title: "Physical Inspection", url: "/inspection", icon: Camera },
  { title: "Privacy Notice", url: "/notice", icon: Eye },
  { title: "Manuals and Outputs", url: "/manuals", icon: BookOpen },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Audit Log", url: "/audit", icon: ScrollText },
  { title: "Help & FAQ", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { isAdmin } = useMyRoles();
  const nav = useNavigate();
  const initials = user ? ((user.firstName?.[0] || "") + (user.lastName?.[0] || user.email?.[0] || "U")).toUpperCase().slice(0, 2) : "U";
  const [client, setClient] = useState<string>("");
  const [viewAs, setViewAs] = useState(getViewAsRole());
  const [, force] = useState(0);

  useEffect(() => {
    try {
      const all = loadEngagements();
      const id = getActiveEngagementId();
      const e = all.find(x => x.id === id) || all[0] || ensureSeedEngagement();
      setClient(e.clientName);
    } catch { /* noop */ }
    const onStorage = () => {
      try {
        const all = loadEngagements();
        const id = getActiveEngagementId();
        const e = all.find(x => x.id === id) || all[0];
        if (e) setClient(e.clientName);
      } catch { /* noop */ }
    };
    const onVis = () => { setViewAs(getViewAsRole()); force(n => n + 1); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pa:visibility-change", onVis);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("pa:visibility-change", onVis); };
  }, [pathname]);

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));
  const visibleItems = items.filter(i => isPathVisible(i.url));

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 z-40 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Brand + Engagement context */}
      <NavLink to="/engagements" className="px-4 pt-4 pb-3 flex items-start gap-2.5 hover:bg-sidebar-accent/30 transition-colors" title="Switch engagement">
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(var(--accent)/0.5)] shrink-0">
          <ShieldCheck className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-sidebar-accent-foreground leading-tight">PrivacyOps</div>
          <div className="text-[11px] text-sidebar-foreground/55 truncate mt-0.5" title={client}>{client || "Select engagement"}</div>
        </div>
      </NavLink>

      <div className="h-px bg-sidebar-border mx-3" />

      {viewAs && (
        <div className="mx-3 my-2 text-[10px] rounded-md border border-warning/40 bg-warning/10 text-warning-foreground px-2 py-1.5 flex items-center justify-between">
          <span>Viewing as <b>{viewAs}</b></span>
          <button onClick={() => { setViewAsRole(null); setViewAs(null); }} className="underline hover:no-underline">Clear</button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const on = isActive(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] transition-all",
                on
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("h-[15px] w-[15px] shrink-0", on ? "text-accent" : "text-sidebar-foreground/60")} />
              <span className="flex-1 truncate">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>


      <div className="border-t border-sidebar-border px-2 py-2 space-y-0.5">
        <NavLink to="/settings" className="w-full flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all">
          <Settings className="h-[15px] w-[15px] text-sidebar-foreground/60" />
          <span>Settings</span>
        </NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2 h-11 rounded-md hover:bg-sidebar-accent/50 transition-all">
              <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[11px] font-semibold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[12px] font-medium text-sidebar-accent-foreground truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56">
            <DropdownMenuLabel className="text-xs">
              <div>{user ? `${user.firstName} ${user.lastName}` : "Guest"}</div>
              <div className="text-[10px] text-muted-foreground font-normal">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => nav("/admin/users")}>
              <ShieldCheck className="h-4 w-4 mr-2" />{isAdmin ? "User Management" : "Become Admin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => { await logout(); nav("/login", { replace: true }); }}>
              <LogOut className="h-4 w-4 mr-2" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

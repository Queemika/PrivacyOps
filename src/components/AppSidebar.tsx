import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, FileText, Library, Layers,
  Table2, BookOpen, ShieldCheck, ClipboardCheck, GitCompare, Mail, ScrollText,
  Search, Settings, Workflow, Wrench, User, ChevronRight,
  Briefcase, Camera, FileCheck2, Lock, BarChart3, FolderArchive, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type Item = { title: string; url: string; icon: any };
type Section = { id: string; title: string; icon: any; groups: { label: string; items: Item[] }[] };

const sections: Section[] = [
  {
    id: "workspace",
    title: "Workspace",
    icon: Workflow,
    groups: [
      {
        label: "Overview",
        items: [
          { title: "Dashboard", url: "/", icon: LayoutDashboard },
          { title: "Engagement Manager", url: "/engagements", icon: Briefcase },
        ],
      },
    ],
  },
  {
    id: "assessment",
    title: "Assessment",
    icon: ClipboardCheck,
    groups: [
      {
        label: "Intake",
        items: [
          { title: "Transcript Processing", url: "/upload", icon: Upload },
          { title: "DRL / IRL Manager", url: "/drl", icon: ShieldCheck },
          { title: "Physical Inspection", url: "/inspection", icon: Camera },
        ],
      },
      {
        label: "Reviews",
        items: [
          { title: "PIA Library", url: "/library", icon: Library },
          { title: "Generated PIA", url: "/pia", icon: FileText },
          { title: "PRADAR Module", url: "/pradar", icon: ClipboardCheck },
          { title: "Privacy Notice Review", url: "/notice", icon: FileCheck2 },
          { title: "Technical Security", url: "/tsa", icon: Lock },
        ],
      },
    ],
  },
  {
    id: "outputs",
    title: "Outputs",
    icon: Wrench,
    groups: [
      {
        label: "Deliverables",
        items: [
          { title: "ROPA & NPC-RS", url: "/ropa", icon: Table2 },
          { title: "Compilation Builder", url: "/compile", icon: Layers },
          { title: "Executive Summary", url: "/summary", icon: BookOpen },
          { title: "Manuals & Deliverables", url: "/manuals", icon: FolderArchive },
        ],
      },
      {
        label: "Communication",
        items: [
          { title: "Email Generator", url: "/email", icon: Mail },
        ],
      },
    ],
  },
  {
    id: "insights",
    title: "Insights",
    icon: BarChart2,
    groups: [
      {
        label: "Analytics",
        items: [
          { title: "Analytics Hub", url: "/analytics", icon: BarChart3 },
          { title: "Consistency Checker", url: "/consistency", icon: GitCompare },
          { title: "Audit Log", url: "/audit", icon: ScrollText },
        ],
      },
    ],
  },
];

function findSectionForPath(pathname: string) {
  for (const s of sections) {
    for (const g of s.groups) {
      if (g.items.some(i => (i.url === "/" ? pathname === "/" : pathname.startsWith(i.url)))) {
        return s.id;
      }
    }
  }
  return sections[0].id;
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const initials = user ? (user.firstName[0] + user.lastName[0]).toUpperCase() : "U";

  const [activeId, setActiveId] = useState<string>(() => findSectionForPath(pathname));
  const [query, setQuery] = useState("");

  const active = sections.find(s => s.id === activeId)!;

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return active.groups;
    const q = query.toLowerCase();
    return active.groups
      .map(g => ({ ...g, items: g.items.filter(i => i.title.toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0);
  }, [active, query]);

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <aside className="flex shrink-0 h-screen sticky top-0 z-40">
      {/* Icon rail */}
      <div className="w-[60px] bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-white font-semibold text-[11px] tracking-wider shadow-[0_4px_12px_-4px_hsl(244_75%_61%_/_0.5)]">
          PA
        </div>
        <div className="h-px w-6 bg-sidebar-border my-2" />

        <nav className="flex flex-col gap-1.5 flex-1">
          {sections.map((s) => {
            const Icon = s.icon;
            const isOn = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                title={s.title}
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                  isOn
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            );
          })}
        </nav>

        <button
          title="Settings"
          className="h-10 w-10 rounded-lg flex items-center justify-center text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-all"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
        <div
          title={user?.email}
          className="h-9 w-9 rounded-full bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center text-[11px] font-semibold border border-sidebar-border"
        >
          {initials || <User className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded panel */}
      <div className="w-[260px] bg-[hsl(0_0%_10%)] border-r border-sidebar-border flex flex-col">
        <div className="px-5 pt-5 pb-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/40">PrivacyAtlas</div>
          <h2 className="text-[15px] font-semibold text-sidebar-accent-foreground mt-0.5">{active.title}</h2>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full h-8 pl-8 pr-2 rounded-md bg-sidebar-accent/60 border border-sidebar-border text-xs text-sidebar-accent-foreground placeholder:text-sidebar-foreground/40 outline-none focus:border-accent/60 focus:bg-sidebar-accent transition-colors"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {filteredGroups.map((g) => (
            <div key={g.label}>
              <div className="px-2 mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/35">
                {g.label}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  const on = isActive(item.url);
                  return (
                    <li key={item.url}>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "group flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] transition-all",
                          on
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border))]"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Icon className={cn("h-[15px] w-[15px] shrink-0", on ? "text-accent" : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground")} />
                        <span className="flex-1 truncate">{item.title}</span>
                        {on && <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/50" />}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-sidebar-foreground/40">No matches</div>
          )}
        </nav>

        <div className="px-5 py-3 border-t border-sidebar-border text-[10px] text-sidebar-foreground/40">
          Prototype · Sample data only
        </div>
      </div>
    </aside>
  );
}

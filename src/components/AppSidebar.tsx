import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, FileText, Library, Layers,
  Table2, BookOpen, ShieldCheck, ClipboardCheck, GitCompare, Mail, ScrollText
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";

const workflow = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Upload Transcript", url: "/upload", icon: Upload },
  { title: "Generated PIA", url: "/pia", icon: FileText },
  { title: "PIA Library", url: "/library", icon: Library },
  { title: "Compilation Builder", url: "/compile", icon: Layers },
  { title: "RoPA & NPC-RS", url: "/ropa", icon: Table2 },
  { title: "Executive Summary", url: "/summary", icon: BookOpen },
];

const tools = [
  { title: "DRL / IRL Generator", url: "/drl", icon: ShieldCheck },
  { title: "PRADAR Checklist", url: "/pradar", icon: ClipboardCheck },
  { title: "Consistency Checker", url: "/consistency", icon: GitCompare },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Audit Log", url: "/audit", icon: ScrollText },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="h-8 w-8 rounded-lg bg-sidebar-accent border border-sidebar-border flex items-center justify-center text-sidebar-foreground font-semibold text-[11px] tracking-wider">
            PA
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium text-sidebar-foreground tracking-tight">PrivacyAtlas</span>
            <span className="text-[10px] text-sidebar-foreground/50">PIA · RoPA · NPC-RS</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflow.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-[10px] text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          Prototype · Sample data only
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

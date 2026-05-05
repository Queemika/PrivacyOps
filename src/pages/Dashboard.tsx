import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/StatusChip";
import { mockPIAs } from "@/lib/mockData";
import {
  FileText, Upload, Library, FolderPlus, FileCog, ShieldCheck, Mail,
  Clock, AlertTriangle, CheckCircle2, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total PIAs", value: mockPIAs.length, hint: "Across all statuses", icon: FileText, tone: "text-foreground" },
  { label: "Draft", value: mockPIAs.filter((p) => p.status === "Draft").length, hint: "Pending review", icon: Clock, tone: "text-warning" },
  { label: "For Finalization", value: mockPIAs.filter((p) => p.status === "For Finalization").length, hint: "Needs approval", icon: AlertTriangle, tone: "text-warning" },
  { label: "Final", value: mockPIAs.filter((p) => p.status === "Final").length, hint: "Completed", icon: CheckCircle2, tone: "text-success" },
];

const quickActions = [
  { to: "/upload", icon: Upload, title: "Upload Transcript", desc: "Generate PIA from meeting minutes", tone: "bg-info/10 text-info" },
  { to: "/library", icon: Library, title: "PIA Library", desc: "View and manage all PIAs", tone: "bg-accent/10 text-accent" },
  { to: "/compile", icon: FolderPlus, title: "Create Compilation", desc: "Build RoPA & NPC-RS", tone: "bg-success/10 text-success" },
  { to: "/drl", icon: FileCog, title: "DRL / IRL Generator", desc: "Generate document requests", tone: "bg-warning/10 text-warning" },
  { to: "/pradar", icon: ShieldCheck, title: "PRADAR Module", desc: "Compliance assessment", tone: "bg-destructive/10 text-destructive" },
  { to: "/email", icon: Mail, title: "Email Generator", desc: "Create follow-up emails", tone: "bg-primary/10 text-primary" },
];

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your data privacy compliance workflows" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.tone}`} />
              </div>
              <div className={`mt-3 text-3xl font-semibold ${s.tone}`}>{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickActions.map((a) => (
          <Card key={a.to} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${a.tone}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                </div>
              </div>
              <Button asChild className="w-full mt-4 bg-foreground hover:bg-foreground/90 text-background">
                <Link to={a.to}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <p className="text-xs text-muted-foreground">Latest updates to your PIAs</p>
          </div>
          <div className="divide-y">
            {mockPIAs.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-info shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.dpsName}</div>
                    <div className="text-xs text-muted-foreground">Last modified: {p.updatedAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusChip status={p.status} />
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/pia">View <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

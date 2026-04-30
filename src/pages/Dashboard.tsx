import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/StatusChip";
import { mockPIAs } from "@/lib/mockData";
import { FileText, Upload, Layers, ShieldCheck, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total PIAs", value: "24", trend: "+3 this week", icon: FileText, tone: "text-info" },
  { label: "Pending Validation", value: "5", trend: "Supervisor review", icon: AlertTriangle, tone: "text-warning" },
  { label: "Final / NPC-Ready", value: "12", trend: "+2 this week", icon: ShieldCheck, tone: "text-success" },
  { label: "Avg. AI Confidence", value: "87%", trend: "Phase 1 extraction", icon: TrendingUp, tone: "text-accent" },
];

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Welcome back, Maria"
        description="Automate your PIA, RoPA, and NPC-RS workflows. All sample data shown is for prototype demonstration."
        actions={
          <>
            <Button asChild variant="outline"><Link to="/library">View Library</Link></Button>
            <Button asChild><Link to="/upload"><Upload className="mr-2 h-4 w-4" />New Transcript</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.tone}`} />
              </div>
              <div className="mt-2 text-3xl font-semibold">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent PIAs</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/library">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-y bg-muted/30">
                <tr>
                  <th className="text-left font-medium px-4 py-2">DPS Name</th>
                  <th className="text-left font-medium px-4 py-2">Owner</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                  <th className="text-left font-medium px-4 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {mockPIAs.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.dpsName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                    <td className="px-4 py-3"><StatusChip status={p.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <QuickAction to="/upload" icon={Upload} title="Upload transcript" desc="Generate a PIA from minutes" />
            <QuickAction to="/compile" icon={Layers} title="Build compilation" desc="Group PIAs → RoPA + NPC-RS" />
            <QuickAction to="/pradar" icon={ShieldCheck} title="Run PRADAR" desc="5-in-1 compliance assessment" />
            <QuickAction to="/email" icon={FileText} title="Generate email" desc="Walkthrough follow-up" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function QuickAction({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-md border hover:border-accent hover:bg-accent/5 transition-colors">
      <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center"><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

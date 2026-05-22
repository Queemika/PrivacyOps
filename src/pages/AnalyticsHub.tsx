import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileText, AlertTriangle, ShieldCheck, Activity, ClipboardCheck, FileSearch, Building2, BookOpen, ListChecks } from "lucide-react";
import { loadPias } from "@/lib/pia/store";
import { aggregate } from "@/lib/analytics/executiveSummary";
import { loadDrl } from "@/lib/drl/store";
import { Link } from "react-router-dom";

export default function AnalyticsHub() {
  const [pias, setPias] = useState(() => loadPias());
  const [drl, setDrl] = useState(() => loadDrl());
  useEffect(() => { setPias(loadPias()); setDrl(loadDrl()); }, []);

  const agg = useMemo(() => aggregate(pias), [pias]);

  const RISK = [
    { name: "Yes (Compliant)", value: agg.riskMatrix.principles.yes + agg.riskMatrix.rights.yes + agg.riskMatrix.security.yes + agg.riskMatrix.crossBorder.yes, fill: "hsl(var(--success))" },
    { name: "No (Gap)", value: agg.riskMatrix.principles.no + agg.riskMatrix.rights.no + agg.riskMatrix.security.no + agg.riskMatrix.crossBorder.no, fill: "hsl(var(--destructive))" },
    { name: "N/A", value: agg.riskMatrix.principles.na + agg.riskMatrix.rights.na + agg.riskMatrix.security.na + agg.riskMatrix.crossBorder.na, fill: "hsl(var(--muted-foreground))" },
  ];

  const drlByStatus = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of drl) m[r.status] = (m[r.status] || 0) + 1;
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [drl]);

  const totalHighRisks = agg.topRisks.principles.length + agg.topRisks.rights.length + agg.topRisks.security.length + agg.topRisks.crossBorder.length;

  return (
    <PageShell title="Analytics" subtitle="Cross-module compliance signal — PIAs, PRADAR, DRL, Privacy Notice, TSA, Physical Inspection, and Manuals.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="PIAs assessed" value={pias.length} icon={FileText} accent="blue" />
        <StatTile label="High / Critical risks" value={totalHighRisks} icon={AlertTriangle} accent="rose" />
        <StatTile label="Overall band" value={agg.overallRiskBand} icon={ShieldCheck} accent="green" />
        <StatTile label="DRL items" value={drl.length} icon={ListChecks} accent="violet" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Phase 3 risk matrix (aggregate)</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={RISK} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {RISK.map((r) => <Cell key={r.name} fill={r.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center text-xs mt-2">
              {RISK.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.fill }} /> {r.name} ({r.value})</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">DRL items by status</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={drlByStatus}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <CrossLink to="/pradar" icon={ClipboardCheck} title="PRADAR Scoreboard" caption="Maturity across 10 privacy domains" />
        <CrossLink to="/notice" icon={FileSearch} title="Privacy Notice Review" caption="Compliance status of published notices" />
        <CrossLink to="/tsa" icon={ShieldCheck} title="Technical Security" caption="OFI vs Complied per domain & component" />
        <CrossLink to="/inspection" icon={Building2} title="Physical Inspection" caption="OFI vs Complied per area / department" />
        <CrossLink to="/manuals" icon={BookOpen} title="Manuals & Deliverables" caption="Not Started, Ongoing, Completed" />
        <CrossLink to="/drl" icon={ListChecks} title="DRL / IRL" caption="Open, Under Inspection, Closed, N/A" />
      </div>

      <CrossLink to="/summary" icon={Activity} title="Open Executive Summary" caption="Full Phase 2 & 3 derived narrative — sections 01-09" full />
    </PageShell>
  );
}

function CrossLink({ to, icon: Icon, title, caption, full }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; caption: string; full?: boolean }) {
  return (
    <Link to={to} className={`block ${full ? "" : ""}`}>
      <Card className="hover:border-accent transition-colors">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-accent/10 grid place-items-center"><Icon className="h-5 w-5 text-accent" /></div>
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">{caption}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

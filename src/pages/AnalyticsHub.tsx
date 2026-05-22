import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  FileText, AlertTriangle, ShieldCheck, Activity, ClipboardCheck, FileSearch,
  Building2, BookOpen, ListChecks, ExternalLink,
} from "lucide-react";
import { loadPias } from "@/lib/pia/store";
import { aggregate } from "@/lib/analytics/executiveSummary";
import { loadDrl } from "@/lib/drl/store";
import { loadEntries, domainAverage, overallMaturity } from "@/lib/pradarModel";
import { PRADAR_DOMAINS, MATURITY_LABELS } from "@/lib/pradarTemplate";
import { loadNotices, compliance } from "@/lib/privacyNotice/store";
import { loadInspections } from "@/lib/inspections/store";
import { loadTechStackFull } from "@/lib/templates/techStackFull";

export default function AnalyticsHub() {
  const [pias, setPias] = useState(() => loadPias());
  const [drl, setDrl] = useState(() => loadDrl());
  const [pradar, setPradar] = useState(() => loadEntries());
  const [notices, setNotices] = useState(() => loadNotices());
  const [insps, setInsps] = useState(() => loadInspections());
  const [stack, setStack] = useState(() => loadTechStackFull());

  useEffect(() => {
    setPias(loadPias()); setDrl(loadDrl()); setPradar(loadEntries());
    setNotices(loadNotices()); setInsps(loadInspections()); setStack(loadTechStackFull());
  }, []);

  const agg = useMemo(() => aggregate(pias), [pias]);
  const overall = overallMaturity(pradar);

  const drlByStatus = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of drl) m[r.status] = (m[r.status] || 0) + 1;
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [drl]);

  const totalHighRisks = agg.topRisks.principles.length + agg.topRisks.rights.length + agg.topRisks.security.length + agg.topRisks.crossBorder.length;

  return (
    <PageShell title="Analytics" subtitle="Cross-module compliance signal — PIAs, PRADAR (5-in-1), DRL, Privacy Notice, TSA, Physical Inspection, and Manuals.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="PIAs assessed" value={pias.length} icon={FileText} accent="blue" />
        <StatTile label="High / Critical risks" value={totalHighRisks} icon={AlertTriangle} accent="rose" />
        <StatTile label="Overall band" value={agg.overallRiskBand} icon={ShieldCheck} accent="green" />
        <StatTile label="DRL items" value={drl.length} icon={ListChecks} accent="violet" />
      </div>

      {/* Executive Summary entry */}
      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-accent" /> Executive Summary</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Full Phase 2 & 3 derived narrative — sections 01–09 across all selected PIAs.</p>
          </div>
          <Link to="/summary" className="text-xs text-accent hover:underline inline-flex items-center gap-1"><ExternalLink className="h-3.5 w-3.5" />Open</Link>
        </CardContent>
      </Card>

      {/* PRADAR Scoreboard */}
      <PradarScoreboardCard pradar={pradar} overall={overall} />

      {/* Privacy Notice */}
      <NoticeAnalyticsCard notices={notices} />

      {/* TSA */}
      <TsaAnalyticsCard stack={stack} />

      {/* Physical Inspection */}
      <InspectionAnalyticsCard insps={insps} />

      {/* Manuals */}
      <ManualsAnalyticsCard />

      {/* DRL */}
      <DrlAnalyticsCard drlByStatus={drlByStatus} total={drl.length} />
    </PageShell>
  );
}

function SectionHeader({ title, icon: Icon, to }: { title: string; icon: React.ComponentType<{ className?: string }>; to: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold flex items-center gap-2"><Icon className="h-4 w-4 text-accent" /> {title}</h3>
      <Link to={to} className="text-xs text-accent hover:underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />Open module</Link>
    </div>
  );
}

function complianceLabel(r: number | null) {
  if (r == null) return "—";
  if (r >= 3.5) return "Fully Compliant";
  if (r >= 2.5) return "Substantially Compliant";
  if (r >= 1.5) return "Partially Compliant";
  return "Not Compliant";
}

function PradarScoreboardCard({ pradar, overall }: { pradar: ReturnType<typeof loadEntries>; overall: number | null }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <Card><CardContent className="p-5">
      <SectionHeader title="PRADAR (5-in-1) Scoreboard" icon={ClipboardCheck} to="/pradar" />
      <p className="text-[11px] text-muted-foreground mb-3">Status as of {today}</p>
      <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
        <div><div className="text-[10px] uppercase text-muted-foreground">Overall Maturity Level</div>
          <div className="text-2xl font-semibold tabular-nums">{overall != null ? overall.toFixed(2) : "—"}</div>
          <div className="text-xs text-muted-foreground">{overall != null ? MATURITY_LABELS[Math.round(overall)] : "—"}</div>
        </div>
        <div><div className="text-[10px] uppercase text-muted-foreground">Compliance</div>
          <div className="text-base font-medium mt-1">{complianceLabel(overall)}</div>
        </div>
        <div><div className="text-[10px] uppercase text-muted-foreground">Description</div>
          <div className="text-xs text-muted-foreground mt-1">Average across all rated PRADAR control questions.</div>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="text-left font-medium py-1.5">Privacy Domain</th>
            <th className="text-left font-medium py-1.5 w-24">Avg Rating</th>
            <th className="text-left font-medium py-1.5 w-44">Compliance</th>
            <th className="text-left font-medium py-1.5 w-24">Description</th>
          </tr>
        </thead>
        <tbody>
          {PRADAR_DOMAINS.map(d => {
            const avg = domainAverage(d, pradar);
            return (
              <tr key={d} className="border-b last:border-0">
                <td className="py-1.5">{d}</td>
                <td className="py-1.5 font-mono">{avg != null ? avg.toFixed(2) : "—"}</td>
                <td className="py-1.5">{complianceLabel(avg)}</td>
                <td className="py-1.5 text-muted-foreground">{avg != null ? MATURITY_LABELS[Math.round(avg)] : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CardContent></Card>
  );
}

function NoticeAnalyticsCard({ notices }: { notices: ReturnType<typeof loadNotices> }) {
  const compliant = notices.filter(n => { const c = compliance(n); return c.total > 0 && c.complied === c.total; }).length;
  const partial = notices.filter(n => { const c = compliance(n); return c.total > 0 && c.complied > 0 && c.complied < c.total; }).length;
  const nonComp = notices.length - compliant - partial;
  const data = [
    { name: "Compliant", value: compliant, fill: "hsl(var(--success))" },
    { name: "Partial", value: partial, fill: "hsl(var(--warning))" },
    { name: "Non-compliant", value: nonComp, fill: "hsl(var(--destructive))" },
  ];
  return (
    <Card><CardContent className="p-5">
      <SectionHeader title="Privacy Notice Review" icon={FileSearch} to="/notice" />
      {notices.length === 0 ? (
        <p className="text-xs text-muted-foreground">No privacy notices recorded yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75} paddingAngle={2}>
                  {data.map(d => <Cell key={d.name} fill={d.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {data.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.fill }} />{d.name}</span>
                <span className="font-mono">{d.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-1.5 font-semibold">
              <span>Total</span><span className="font-mono">{notices.length}</span>
            </div>
          </div>
        </div>
      )}
    </CardContent></Card>
  );
}

function TsaAnalyticsCard({ stack }: { stack: ReturnType<typeof loadTechStackFull> }) {
  // Group by domain: OFI (Not Implemented / Partial) vs Complied (Implemented)
  const byDomain = new Map<string, { ofi: number; complied: number; na: number }>();
  for (const s of stack) {
    const r = byDomain.get(s.domain) || { ofi: 0, complied: 0, na: 0 };
    if (s.status === "Implemented") r.complied++;
    else if (s.status === "N/A") r.na++;
    else r.ofi++;
    byDomain.set(s.domain, r);
  }
  const rows = Array.from(byDomain.entries());
  return (
    <Card><CardContent className="p-5">
      <SectionHeader title="Technical Security Assessment" icon={ShieldCheck} to="/tsa" />
      <table className="w-full text-xs">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="text-left font-medium py-1.5">Domain</th>
            <th className="text-left font-medium py-1.5 w-20">Complied</th>
            <th className="text-left font-medium py-1.5 w-16">OFI</th>
            <th className="text-left font-medium py-1.5 w-16">N/A</th>
            <th className="text-left font-medium py-1.5 w-20">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([d, r]) => (
            <tr key={d} className="border-b last:border-0">
              <td className="py-1.5">{d}</td>
              <td className="py-1.5 font-mono text-emerald-600">{r.complied}</td>
              <td className="py-1.5 font-mono text-amber-600">{r.ofi}</td>
              <td className="py-1.5 font-mono text-muted-foreground">{r.na}</td>
              <td className="py-1.5 font-mono">{r.complied + r.ofi + r.na}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
}

function InspectionAnalyticsCard({ insps }: { insps: ReturnType<typeof loadInspections> }) {
  return (
    <Card><CardContent className="p-5">
      <SectionHeader title="Physical Inspection" icon={Building2} to="/inspection" />
      {insps.length === 0 ? (
        <p className="text-xs text-muted-foreground">No inspections recorded yet.</p>
      ) : (
        <table className="w-full text-xs">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="text-left font-medium py-1.5">Department / Area</th>
              <th className="text-left font-medium py-1.5 w-20">Complied</th>
              <th className="text-left font-medium py-1.5 w-16">OFI</th>
              <th className="text-left font-medium py-1.5 w-16">N/A</th>
              <th className="text-left font-medium py-1.5 w-20">Open</th>
            </tr>
          </thead>
          <tbody>
            {insps.map(i => {
              const yes = i.rows.filter(r => r.status === "Yes").length;
              const no = i.rows.filter(r => r.status === "No").length;
              const na = i.rows.filter(r => r.status === "N-A").length;
              const open = i.rows.filter(r => !r.status).length;
              return (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="py-1.5">{i.departmentArea}</td>
                  <td className="py-1.5 font-mono text-emerald-600">{yes}</td>
                  <td className="py-1.5 font-mono text-amber-600">{no}</td>
                  <td className="py-1.5 font-mono text-muted-foreground">{na}</td>
                  <td className="py-1.5 font-mono">{open}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </CardContent></Card>
  );
}

const MANUALS_FOR_ANALYTICS = [
  { name: "Privacy Manual", status: "Completed" },
  { name: "Data Security Policy", status: "Completed" },
  { name: "Acceptable Use Policy", status: "Ongoing" },
  { name: "Retention and Disposal Policy", status: "Not Started" },
  { name: "Business Continuity Plan", status: "Ongoing" },
  { name: "Access Control Policy", status: "Completed" },
  { name: "CCTV Policy", status: "Completed" },
];

function ManualsAnalyticsCard() {
  const counts = { Completed: 0, Ongoing: 0, "Not Started": 0 } as Record<string, number>;
  MANUALS_FOR_ANALYTICS.forEach(m => { counts[m.status] = (counts[m.status] || 0) + 1; });
  return (
    <Card><CardContent className="p-5">
      <SectionHeader title="Manuals & Deliverables" icon={BookOpen} to="/manuals" />
      <div className="grid grid-cols-3 gap-3 text-sm">
        <Tile label="Completed" value={counts.Completed} tone="bg-emerald-100 text-emerald-700" />
        <Tile label="Ongoing" value={counts.Ongoing} tone="bg-blue-100 text-blue-700" />
        <Tile label="Not Started" value={counts["Not Started"]} tone="bg-slate-100 text-slate-600" />
      </div>
    </CardContent></Card>
  );
}

function DrlAnalyticsCard({ drlByStatus, total }: { drlByStatus: { name: string; value: number }[]; total: number }) {
  return (
    <Card><CardContent className="p-5">
      <SectionHeader title="DRL / IRL" icon={ListChecks} to="/drl" />
      {total === 0 ? (
        <p className="text-xs text-muted-foreground">No DRL items recorded yet.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={drlByStatus}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent></Card>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="border rounded-md p-3">
      <div className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${tone}`}>{label}</div>
      <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}

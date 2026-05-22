import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { defaultPrivacyManual, ManualSection } from "@/lib/templates/privacyManual";
import { loadPias } from "@/lib/pia/store";
import { loadDrl } from "@/lib/drl/store";
import { loadNotices } from "@/lib/privacyNotice/store";
import { loadInspections } from "@/lib/inspections/store";
import { toast } from "sonner";
import { Save, RotateCcw, BookOpen, Download, ChevronDown, FileText, FileSpreadsheet, ExternalLink } from "lucide-react";

const KEY = "pa_privacy_manual";
function load(): ManualSection[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v?.length ? v : defaultPrivacyManual; } catch { return defaultPrivacyManual; }
}

export default function ManualsDeliverables() {
  const [tab, setTab] = useState("manuals");
  const [sections, setSections] = useState<ManualSection[]>(load());
  const [active, setActive] = useState(sections[0].id);
  const current = sections.find((s) => s.id === active)!;

  const update = (id: string, patch: Partial<ManualSection>) => {
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };
  const save = () => { localStorage.setItem(KEY, JSON.stringify(sections)); toast.success("Privacy manual saved"); };
  const reset = () => { localStorage.removeItem(KEY); setSections(defaultPrivacyManual); toast.success("Reset to template"); };

  return (
    <PageShell
      title="Manuals and Outputs"
      subtitle="Manuals edited by your team and downloadable outputs from every workable."
      actions={tab === "manuals" ? <>
        <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-1.5" />Reset</Button>
        <Button onClick={save}><Save className="h-4 w-4 mr-1.5" />Save</Button>
      </> : null}
    >
      <SectionTabs
        tabs={[{ id: "manuals", label: "Manuals" }, { id: "outputs", label: "Outputs" }]}
        value={tab} onChange={setTab}
      />

      {tab === "manuals" && (
        <>
          <ManualsRegistry />

          <div className="grid lg:grid-cols-[260px_1fr] gap-4">
            <Card><CardContent className="p-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-1 pb-2 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Privacy Manual Sections</div>
              <ul className="space-y-0.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => setActive(s.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-sm transition-colors ${active === s.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted/50"}`}>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
            <Card><CardContent className="p-6 space-y-4">
              <Input value={current.title} onChange={(e) => update(current.id, { title: e.target.value })} className="text-lg font-semibold h-12" />
              <Textarea value={current.body} onChange={(e) => update(current.id, { body: e.target.value })} rows={14} className="text-sm leading-relaxed" />
            </CardContent></Card>
          </div>
        </>
      )}

      {tab === "outputs" && <OutputsTab />}
    </PageShell>
  );
}

const MANUALS_REGISTRY = [
  { name: "Privacy Manual",                type: "Core Document",       status: "Completed",   updated: "Mar 2025", version: "v2.1" },
  { name: "Data Security Policy",          type: "Technical Policy",    status: "Completed",   updated: "Jan 2025", version: "v1.3" },
  { name: "Acceptable Use Policy",         type: "IT Policy",           status: "Ongoing",     updated: "—",        version: "Draft" },
  { name: "Retention and Disposal Policy", type: "Operational Policy",  status: "Not Started", updated: "—",        version: "—" },
  { name: "Business Continuity Plan",      type: "Risk Policy",         status: "Ongoing",     updated: "—",        version: "Draft" },
  { name: "Access Control Policy",         type: "Security Policy",     status: "Completed",   updated: "Feb 2025", version: "v1.0" },
  { name: "CCTV Policy",                   type: "Operational Policy",  status: "Completed",   updated: "Apr 2025", version: "v1.0" },
];

const STATUS_TONE: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Ongoing: "bg-blue-100 text-blue-700",
  "Not Started": "bg-slate-100 text-slate-600",
};

function ManualsRegistry() {
  return (
    <Card><CardContent className="p-0">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/30 border-b">
          <tr>
            <th className="text-left font-medium px-4 py-2.5">Manual / Policy</th>
            <th className="text-left font-medium px-4 py-2.5">Type</th>
            <th className="text-left font-medium px-4 py-2.5 w-32">Status</th>
            <th className="text-left font-medium px-4 py-2.5 w-32">Last Updated</th>
            <th className="text-left font-medium px-4 py-2.5 w-24">Version</th>
            <th className="text-right font-medium px-4 py-2.5 w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          {MANUALS_REGISTRY.map(m => (
            <tr key={m.name} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-medium">{m.name}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{m.type}</td>
              <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_TONE[m.status] || "bg-muted text-muted-foreground"}`}>{m.status}</span></td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{m.updated}</td>
              <td className="px-4 py-3 text-xs font-mono">{m.version}</td>
              <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost">Edit</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
}

function OutputsTab() {
  const [pias, setPias] = useState(loadPias());
  const [drl, setDrl] = useState(loadDrl());
  const [notices, setNotices] = useState(loadNotices());
  const [insps, setInsps] = useState(loadInspections());

  useEffect(() => {
    setPias(loadPias()); setDrl(loadDrl()); setNotices(loadNotices()); setInsps(loadInspections());
  }, []);

  const groups: { label: string; route: string; rows: { name: string; type: string; status: string; updated: string; version: string; link?: string }[] }[] = [
    {
      label: "PIA", route: "/library",
      rows: pias.map(p => ({ name: p.title, type: p.type, status: "Saved", updated: new Date(p.updatedAt).toLocaleDateString(), version: "v1", link: `/pia/${p.id}` })),
    },
    {
      label: "Compilation / NPC-RS", route: "/ropa",
      rows: [{ name: "ROPA Compilation", type: "Compilation", status: pias.length ? "Ready" : "Empty", updated: new Date().toLocaleDateString(), version: "v1", link: "/ropa" },
             { name: "NPC-RS Compilation", type: "Compilation", status: pias.length ? "Ready" : "Empty", updated: new Date().toLocaleDateString(), version: "v1", link: "/ropa" }],
    },
    {
      label: "PRADAR", route: "/pradar",
      rows: [{ name: "PRADAR Scoreboard", type: "Assessment", status: "Live", updated: new Date().toLocaleDateString(), version: "v1", link: "/pradar" }],
    },
    {
      label: "Tech Security Assessment", route: "/tsa",
      rows: [{ name: "TSA Working File", type: "Assessment", status: "Live", updated: new Date().toLocaleDateString(), version: "v1", link: "/tsa" }],
    },
    {
      label: "Physical Inspection", route: "/inspection",
      rows: insps.map(i => ({ name: i.departmentArea, type: "Inspection", status: `${i.rows.length} questions`, updated: i.date, version: "v1", link: `/inspection` })),
    },
    {
      label: "Privacy Notice", route: "/notice",
      rows: notices.map(n => ({ name: n.dpsName, type: n.type, status: n.status, updated: new Date(n.updatedAt).toLocaleDateString(), version: "v1", link: `/notice?id=${n.id}` })),
    },
    {
      label: "DRL / IRL", route: "/drl",
      rows: ["tsa", "pradar", "pia", "notice", "actions"].map(cat => ({
        name: `DRL — ${cat.toUpperCase()}`, type: "Register", status: `${drl.filter(d => d.category === cat).length} rows`, updated: new Date().toLocaleDateString(), version: "v1", link: `/drl?tab=${cat}`,
      })),
    },
    {
      label: "Analytics / Executive Summary", route: "/summary",
      rows: [{ name: "Executive Summary", type: "Report", status: "Live", updated: new Date().toLocaleDateString(), version: "v1", link: "/summary" },
             { name: "Analytics Hub", type: "Dashboard", status: "Live", updated: new Date().toLocaleDateString(), version: "v1", link: "/analytics" }],
    },
  ];

  return (
    <div className="space-y-3">
      {groups.map(g => (
        <Collapsible key={g.label} defaultOpen>
          <Card>
            <CollapsibleTrigger className="w-full">
              <div className="px-4 py-3 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <span className="font-semibold text-sm">{g.label}</span>
                  <span className="text-xs text-muted-foreground">({g.rows.length})</span>
                </div>
                <Link to={g.route} className="text-xs text-accent hover:underline">Open module →</Link>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground bg-muted/20 border-b">
                    <tr>
                      <th className="text-left font-medium px-4 py-2">File</th>
                      <th className="text-left font-medium px-4 py-2 w-32">Type</th>
                      <th className="text-left font-medium px-4 py-2 w-32">Status</th>
                      <th className="text-left font-medium px-4 py-2 w-28">Last Update</th>
                      <th className="text-left font-medium px-4 py-2 w-16">Version</th>
                      <th className="text-right font-medium px-4 py-2 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-xs text-muted-foreground">No outputs yet.</td></tr>
                    )}
                    {g.rows.map((r, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2 font-medium flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{r.name}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">{r.type}</td>
                        <td className="px-4 py-2 text-xs">{r.status}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{r.updated}</td>
                        <td className="px-4 py-2 text-xs">{r.version}</td>
                        <td className="px-4 py-2 text-right">
                          {r.link && <Button asChild size="sm" variant="ghost"><Link to={r.link}><ExternalLink className="h-3.5 w-3.5" /></Link></Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}

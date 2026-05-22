import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { defaultTechStack, TechItem } from "@/lib/templates/techStack";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import { loadTechStackFull, saveTechStackFull, TechStackRow } from "@/lib/templates/techStackFull";
import { toast } from "sonner";
import { Lock, ShieldCheck, AlertCircle, ListChecks } from "lucide-react";

const STORE = "pa_tech_stack";

function load(): TechItem[] {
  try { const v = JSON.parse(localStorage.getItem(STORE) || "null"); return v?.length ? v : defaultTechStack; } catch { return defaultTechStack; }
}

export default function TechnicalSecurityAssessment() {
  const [tab, setTab] = useState("summary");
  const [items, setItems] = useState<TechItem[]>(load());
  const [stack, setStack] = useState<TechStackRow[]>(loadTechStackFull());

  const counts = {
    impl: items.filter((i) => i.status === "Implemented").length,
    partial: items.filter((i) => i.status === "Partial").length,
    none: items.filter((i) => i.status === "Not Implemented").length,
  };

  const update = (id: string, patch: Partial<TechItem>) => {
    const next = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setItems(next); localStorage.setItem(STORE, JSON.stringify(next));
  };
  const updateStack = (id: string, patch: Partial<TechStackRow>) => {
    const next = stack.map(s => s.id === id ? { ...s, ...patch } : s);
    setStack(next); saveTechStackFull(next);
  };

  return (
    <PageShell
      title="Technical Security Assessment"
      subtitle="Baseline controls evaluated against PH DPA, NPC issuances, and ISO 27001."
      actions={<Button variant="outline" onClick={() => { localStorage.removeItem(STORE); setItems(defaultTechStack); toast.success("Reset to template"); }}>Reset working file</Button>}
    >
      <SectionTabs
        tabs={[
          { id: "summary", label: "Summary" },
          { id: "stack", label: "Tech Stack", count: stack.length },
          { id: "wf", label: "Working File", count: items.length },
          { id: "drl", label: "DRL/IRL" },
        ]}
        value={tab} onChange={setTab}
      />

      {tab === "summary" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Total controls" value={items.length} icon={ListChecks} accent="blue" />
          <StatTile label="Implemented" value={counts.impl} icon={ShieldCheck} accent="green" />
          <StatTile label="Partial" value={counts.partial} icon={Lock} accent="amber" />
          <StatTile label="Gaps" value={counts.none} icon={AlertCircle} accent="rose" />
        </div>
      )}

      {tab === "stack" && (
        <Card><CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left font-medium px-2 py-2 w-44">Domain</th>
                <th className="text-left font-medium px-2 py-2 w-48">System</th>
                <th className="text-left font-medium px-2 py-2">DPA Requirement</th>
                <th className="text-left font-medium px-2 py-2 w-32">Status</th>
                <th className="text-left font-medium px-2 py-2 w-28">Tool</th>
                <th className="text-left font-medium px-2 py-2 w-20">Version</th>
                <th className="text-left font-medium px-2 py-2 w-28">Managed By</th>
                <th className="text-left font-medium px-2 py-2 w-24">Direct Access</th>
                <th className="text-left font-medium px-2 py-2 w-24">AD Integrated</th>
                <th className="text-left font-medium px-2 py-2 w-40">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {stack.map(s => (
                <tr key={s.id} className="border-b align-top">
                  <td className="px-2 py-2 text-[11px] text-muted-foreground">{s.domain}</td>
                  <td className="px-2 py-2">{s.system}</td>
                  <td className="px-2 py-2 text-[11px]">{s.requirement}</td>
                  <td className="px-2 py-2">
                    <Select value={s.status || undefined} onValueChange={(v) => updateStack(s.id, { status: v as TechStackRow["status"] })}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Implemented">Implemented</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Not Implemented">Not Implemented</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={s.tool} onChange={(e) => updateStack(s.id, { tool: e.target.value })} /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={s.version} onChange={(e) => updateStack(s.id, { version: e.target.value })} /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={s.managedBy} onChange={(e) => updateStack(s.id, { managedBy: e.target.value })} /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={s.directAccess} onChange={(e) => updateStack(s.id, { directAccess: e.target.value })} /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={s.adIntegrated} onChange={(e) => updateStack(s.id, { adIntegrated: e.target.value })} /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={s.remarks} onChange={(e) => updateStack(s.id, { remarks: e.target.value })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {tab === "wf" && (
        <Card><CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/30 border-b">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">ID</th>
                <th className="text-left font-medium px-4 py-2.5">Control</th>
                <th className="text-left font-medium px-4 py-2.5">Reference</th>
                <th className="text-left font-medium px-4 py-2.5 w-40">Status</th>
                <th className="text-left font-medium px-4 py-2.5">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-2.5 font-mono text-xs">{it.id}</td>
                  <td className="px-4 py-2.5 font-medium">{it.control}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{it.reference}</td>
                  <td className="px-4 py-2.5">
                    <Select value={it.status} onValueChange={(v) => update(it.id, { status: v as TechItem["status"] })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Implemented">Implemented</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Not Implemented">Not Implemented</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2.5"><Input value={it.remarks} onChange={(e) => update(it.id, { remarks: e.target.value })} className="h-8 text-xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {tab === "drl" && <DrlInlinePanel category="tsa" title="Tech Security DRL items" />}
    </PageShell>
  );
}

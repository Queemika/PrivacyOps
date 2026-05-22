import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Download, Trash2, ChevronDown, Pencil, ListChecks, ShieldCheck, AlertCircle } from "lucide-react";
import {
  loadAreas, saveAreas, InspectionArea, InspectionRow, YNA, DEFAULT_QUESTIONS,
} from "@/lib/inspections/store";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import { ReferencesPanel } from "@/components/ReferencesPanel";
import { toast } from "sonner";

const YN_OPTS: YNA[] = ["Yes", "No", "N-A"];

export default function PhysicalInspection() {
  const [tab, setTab] = useState("summary");
  const [areas, setAreas] = useState<InspectionArea[]>([]);

  useEffect(() => { setAreas(loadAreas()); }, []);

  const persist = (next: InspectionArea[]) => { setAreas(next); saveAreas(next); };

  const allRows = areas.flatMap(a => a.rows);
  const counts = {
    yes: allRows.filter(r => r.status === "Yes").length,
    no: allRows.filter(r => r.status === "No").length,
    na: allRows.filter(r => r.status === "N-A").length,
    open: allRows.filter(r => !r.status).length,
  };

  const updateArea = (id: string, patch: Partial<InspectionArea>) =>
    persist(areas.map(a => a.id === id ? { ...a, ...patch } : a));

  const updateRow = (areaId: string, rowId: string, patch: Partial<InspectionRow>) =>
    persist(areas.map(a => a.id === areaId
      ? { ...a, rows: a.rows.map(r => r.id === rowId ? { ...r, ...patch } : r) }
      : a));

  const addRow = (areaId: string) => {
    persist(areas.map(a => a.id === areaId ? {
      ...a, rows: [...a.rows, {
        id: `q-${Date.now()}`, no: a.rows.length + 1,
        question: "", status: "", remarks: "", observation: "", recommendation: "",
      }],
    } : a));
  };

  const removeRow = (areaId: string, rowId: string) => {
    persist(areas.map(a => a.id === areaId ? {
      ...a, rows: a.rows.filter(r => r.id !== rowId).map((r, i) => ({ ...r, no: i + 1 })),
    } : a));
  };

  const addArea = () => {
    const name = prompt("New area name?");
    if (!name) return;
    persist([...areas, {
      id: `AREA-${Date.now()}`, name: name.trim(),
      rows: DEFAULT_QUESTIONS.map((q, i) => ({
        id: `q-${i}-${Date.now()}`, no: i + 1, question: q,
        status: "", remarks: "", observation: "", recommendation: "",
      })),
    }]);
  };

  const renameArea = (id: string) => {
    const cur = areas.find(a => a.id === id);
    const name = prompt("Rename area:", cur?.name || "");
    if (name) updateArea(id, { name: name.trim() });
  };

  const deleteArea = (id: string) => {
    if (!confirm(`Delete area "${areas.find(a => a.id === id)?.name}"?`)) return;
    persist(areas.filter(a => a.id !== id));
  };

  const exportCSV = () => {
    const head = ["Area", "No.", "Items for Checking / Question", "Compliance Status", "Remarks", "Observations", "Recommendations"];
    const body = areas.flatMap(a => a.rows.map(r => [a.name, r.no, r.question, r.status, r.remarks, r.observation, r.recommendation]));
    const csv = [head, ...body].map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "physical_inspection.csv";
    a.click();
    toast.success("Inspection exported");
  };

  return (
    <PageShell
      title="Physical Inspection"
      subtitle="On-site walkthrough checklists organised by inspected area."
      actions={<>
        <Button variant="outline" onClick={addArea}><Plus className="h-4 w-4 mr-1.5" />New area</Button>
        <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" />Download CSV</Button>
      </>}
    >
      <SectionTabs
        tabs={[
          { id: "summary", label: "Summary" },
          { id: "wf", label: "Working File", count: areas.length },
          { id: "drl", label: "DRL/IRL" },
          { id: "refs", label: "References" },
        ]}
        value={tab} onChange={setTab}
      />

      {tab === "summary" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Items" value={allRows.length} icon={ListChecks} accent="blue" />
            <StatTile label="Compliant (Yes)" value={counts.yes} icon={ShieldCheck} accent="green" />
            <StatTile label="Gaps (No)" value={counts.no} icon={AlertCircle} accent="rose" />
            <StatTile label="N-A" value={counts.na} icon={ListChecks} accent="violet" />
          </div>
          <Card><CardContent className="p-0">
            <div className="px-4 py-2.5 border-b bg-muted/40 text-sm font-semibold">Per-area breakdown</div>
            <table className="w-full text-xs">
              <thead className="bg-muted/20 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Area</th>
                  <th className="text-right px-3 py-2 w-20">Items</th>
                  <th className="text-right px-3 py-2 w-20">Yes</th>
                  <th className="text-right px-3 py-2 w-20">No</th>
                  <th className="text-right px-3 py-2 w-20">N-A</th>
                  <th className="text-right px-3 py-2 w-20">Open</th>
                </tr>
              </thead>
              <tbody>
                {areas.map(a => {
                  const y = a.rows.filter(r => r.status === "Yes").length;
                  const n = a.rows.filter(r => r.status === "No").length;
                  const na = a.rows.filter(r => r.status === "N-A").length;
                  const o = a.rows.filter(r => !r.status).length;
                  return (
                    <tr key={a.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.rows.length}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-emerald-600">{y}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-rose-600">{n}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{na}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{o}</td>
                    </tr>
                  );
                })}
                {areas.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No areas yet.</td></tr>}
              </tbody>
            </table>
          </CardContent></Card>
        </>
      )}

      {tab === "wf" && (
        <div className="space-y-3">
          {areas.map(a => (
            <Collapsible key={a.id} defaultOpen={false}>
              <Card>
                <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
                  <CollapsibleTrigger className="flex items-center gap-2 min-w-0 flex-1 text-left">
                    <ChevronDown className="h-4 w-4 shrink-0" />
                    <span className="font-semibold text-sm truncate">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground">({a.rows.length} items)</span>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => renameArea(a.id)} title="Rename">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteArea(a.id)} title="Delete">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CollapsibleContent>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 border-b">
                        <tr>
                          <th className="text-left font-medium px-2 py-2 w-10">No.</th>
                          <th className="text-left font-medium px-2 py-2">Items for Checking / Question</th>
                          <th className="text-left font-medium px-2 py-2 w-28">Compliance Status</th>
                          <th className="text-left font-medium px-2 py-2 w-48">Remarks</th>
                          <th className="text-left font-medium px-2 py-2 w-48">Observations</th>
                          <th className="text-left font-medium px-2 py-2 w-48">Recommendations</th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.rows.map(r => (
                          <tr key={r.id} className="border-b align-top">
                            <td className="px-2 py-2 font-mono">{r.no}</td>
                            <td className="px-2 py-2">
                              <Textarea rows={2} className="text-xs" value={r.question} onChange={(e) => updateRow(a.id, r.id, { question: e.target.value })} />
                            </td>
                            <td className="px-2 py-2">
                              <Select value={r.status || undefined} onValueChange={(v) => updateRow(a.id, r.id, { status: v as YNA })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                                <SelectContent>{YN_OPTS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                              </Select>
                            </td>
                            <td className="px-2 py-2"><Textarea rows={2} className="text-xs" value={r.remarks} onChange={(e) => updateRow(a.id, r.id, { remarks: e.target.value })} /></td>
                            <td className="px-2 py-2"><Textarea rows={2} className="text-xs" value={r.observation} onChange={(e) => updateRow(a.id, r.id, { observation: e.target.value })} /></td>
                            <td className="px-2 py-2"><Textarea rows={2} className="text-xs" value={r.recommendation} onChange={(e) => updateRow(a.id, r.id, { recommendation: e.target.value })} /></td>
                            <td className="px-2 py-2">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => removeRow(a.id, r.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-3 border-t">
                      <Button size="sm" variant="outline" onClick={() => addRow(a.id)}><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
          {areas.length === 0 && (
            <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">
              No areas yet. Click <strong>New area</strong> to start.
            </CardContent></Card>
          )}
        </div>
      )}

      {tab === "drl" && <DrlInlinePanel category="actions" title="Physical Inspection DRL / Action items" />}
      {tab === "refs" && <ReferencesPanel moduleId="physical" title="Physical Inspection References" />}
    </PageShell>
  );
}

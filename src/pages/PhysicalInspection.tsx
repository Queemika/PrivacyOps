import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Upload, Camera, ListChecks, ShieldCheck, AlertCircle, Trash2, X } from "lucide-react";
import {
  loadInspections, saveInspections, upsertInspection, newInspection, deleteInspection,
  Inspection, InspectionRow, YNA,
} from "@/lib/inspections/store";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const YN_OPTS: YNA[] = ["Yes", "No", "N/A"];

export default function PhysicalInspection() {
  const [tab, setTab] = useState("summary");
  const [items, setItems] = useState<Inspection[]>([]);
  const [activeId, setActiveId] = useState<string>("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setItems(loadInspections());
  useEffect(() => { refresh(); }, []);

  const active: Inspection | null = activeId === "all" ? null : items.find(i => i.id === activeId) || null;

  const allRows: InspectionRow[] = active ? active.rows : items.flatMap(i => i.rows);
  const allPhotos = items.flatMap(i => i.rows.flatMap(r => r.photos.map(p => ({ src: p, ctx: `${i.departmentArea} · Q${r.no}` }))));

  const counts = {
    yes: allRows.filter(r => r.answer === "Yes").length,
    no: allRows.filter(r => r.answer === "No").length,
    na: allRows.filter(r => r.answer === "N/A").length,
    open: allRows.filter(r => !r.answer).length,
  };

  const updateActive = (patch: Partial<Inspection>) => {
    if (!active) return;
    const next = { ...active, ...patch };
    upsertInspection(next);
    refresh();
  };
  const updateRow = (rid: string, patch: Partial<InspectionRow>) => {
    if (!active) return;
    const next = { ...active, rows: active.rows.map(r => r.id === rid ? { ...r, ...patch } : r) };
    upsertInspection(next); refresh();
  };
  const addRow = () => {
    if (!active) return;
    const no = active.rows.length + 1;
    updateActive({ rows: [...active.rows, { id: `q-${Date.now()}`, no, question: "", answer: "", response: "", observation: "", photos: [] }] });
  };
  const removeRow = (rid: string) => {
    if (!active) return;
    updateActive({ rows: active.rows.filter(r => r.id !== rid).map((r, i) => ({ ...r, no: i + 1 })) });
  };

  const create = () => {
    const name = prompt("Department / Area name?");
    if (!name) return;
    const insp = newInspection(name.trim());
    upsertInspection(insp); refresh(); setActiveId(insp.id);
  };

  const onUploadChecklist = async (f: File) => {
    if (!active) { toast.error("Select an inspection first"); return; }
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const newRows = rows.map((r, i) => ({
        id: `q-${Date.now()}-${i}`, no: i + 1,
        question: String(r.Question || r.question || Object.values(r)[0] || ""),
        answer: "" as YNA, response: "", observation: "", photos: [],
      })).filter(r => r.question);
      updateActive({ rows: newRows });
      toast.success(`Loaded ${newRows.length} questions`);
    } catch { toast.error("Could not parse file"); }
  };

  const onUploadPhoto = (rid: string, f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const row = active!.rows.find(r => r.id === rid)!;
      updateRow(rid, { photos: [...row.photos, reader.result as string] });
    };
    reader.readAsDataURL(f);
  };

  const exportCSV = () => {
    const rows = (active ? active.rows : items.flatMap(i => i.rows.map(r => ({ ...r, area: i.departmentArea }))));
    const head = ["Area", "No.", "Question", "Yes/No/NA", "Response", "Observation", "Photos"];
    const body = rows.map((r: any) => [
      r.area || active?.departmentArea || "", r.no, r.question, r.answer, r.response, r.observation, r.photos.length,
    ]);
    const csv = [head, ...body].map(r => r.map((c: any) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inspection_${active?.departmentArea || "all"}.csv`;
    a.click();
  };

  return (
    <PageShell
      title="Physical Inspection"
      subtitle="On-site walkthrough checklist with photo evidence."
      actions={<>
        <Select value={activeId} onValueChange={setActiveId}>
          <SelectTrigger className="w-56 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Overall view</SelectItem>
            {items.map(i => <SelectItem key={i.id} value={i.id}>{i.departmentArea}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={create}><Plus className="h-4 w-4 mr-1.5" />New inspection</Button>
        <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" />Download CSV</Button>
      </>}
    >
      <SectionTabs
        tabs={[
          { id: "summary", label: "Summary" },
          { id: "wf", label: "Working File" },
          { id: "album", label: "Album", count: allPhotos.length },
          { id: "drl", label: "DRL/IRL" },
        ]}
        value={tab} onChange={setTab}
      />

      {tab === "summary" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Questions" value={allRows.length} icon={ListChecks} accent="blue" />
          <StatTile label="Compliant (Yes)" value={counts.yes} icon={ShieldCheck} accent="green" />
          <StatTile label="Gaps (No)" value={counts.no} icon={AlertCircle} accent="rose" />
          <StatTile label="Photos" value={allPhotos.length} icon={Camera} accent="violet" />
        </div>
      )}

      {tab === "wf" && (
        <>
          {!active ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">
              Pick a department/area above or create a new inspection to start filling out the working file.
            </CardContent></Card>
          ) : (
            <>
              <Card><CardContent className="p-4 grid md:grid-cols-4 gap-3 text-sm">
                <div><label className="text-xs text-muted-foreground">Inspector</label>
                  <Input value={active.inspector} onChange={(e) => updateActive({ inspector: e.target.value })} className="h-9" />
                </div>
                <div><label className="text-xs text-muted-foreground">Date</label>
                  <Input type="date" value={active.date} onChange={(e) => updateActive({ date: e.target.value })} className="h-9" />
                </div>
                <div><label className="text-xs text-muted-foreground">Department / Area</label>
                  <Input value={active.departmentArea} onChange={(e) => updateActive({ departmentArea: e.target.value })} className="h-9" />
                </div>
                <div className="flex items-end gap-2">
                  <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadChecklist(f); e.currentTarget.value = ""; }} />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5 mr-1.5" />Upload checklist</Button>
                  <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this inspection?")) { deleteInspection(active.id); setActiveId("all"); refresh(); } }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent></Card>

              <Card><CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="text-left font-medium px-2 py-2 w-10">No.</th>
                      <th className="text-left font-medium px-2 py-2">Question</th>
                      <th className="text-left font-medium px-2 py-2 w-28">Yes/No/NA</th>
                      <th className="text-left font-medium px-2 py-2 w-48">Response</th>
                      <th className="text-left font-medium px-2 py-2 w-56">Actual Observation</th>
                      <th className="text-left font-medium px-2 py-2 w-52">Attachments</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.rows.map(r => (
                      <tr key={r.id} className="border-b align-top">
                        <td className="px-2 py-2 font-mono">{r.no}</td>
                        <td className="px-2 py-2"><Textarea rows={2} className="text-xs" value={r.question} onChange={(e) => updateRow(r.id, { question: e.target.value })} /></td>
                        <td className="px-2 py-2">
                          <Select value={r.answer || undefined} onValueChange={(v) => updateRow(r.id, { answer: v as YNA })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>{YN_OPTS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-2"><Textarea rows={2} className="text-xs" value={r.response} onChange={(e) => updateRow(r.id, { response: e.target.value })} /></td>
                        <td className="px-2 py-2"><Textarea rows={2} className="text-xs" value={r.observation} onChange={(e) => updateRow(r.id, { observation: e.target.value })} /></td>
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {r.photos.map((p, i) => (
                              <div key={i} className="relative group">
                                <img src={p} alt="" className="h-12 w-12 object-cover rounded border" />
                                <button onClick={() => updateRow(r.id, { photos: r.photos.filter((_, j) => j !== i) })}
                                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <input type="file" accept="image/*" className="text-[10px]"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadPhoto(r.id, f); e.currentTarget.value = ""; }} />
                        </td>
                        <td className="px-2 py-2">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => removeRow(r.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3 border-t">
                  <Button size="sm" variant="outline" onClick={addRow}><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
                </div>
              </CardContent></Card>
            </>
          )}
        </>
      )}

      {tab === "album" && (
        <Card><CardContent className="p-4">
          {allPhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {allPhotos.map((ph, i) => (
                <div key={i} className="space-y-1">
                  <img src={ph.src} alt="" className="w-full aspect-square object-cover rounded border" />
                  <div className="text-[10px] text-muted-foreground truncate">{ph.ctx}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}

      {tab === "drl" && <DrlInlinePanel category="actions" title="Physical Inspection DRL / Action items" />}
    </PageShell>
  );
}

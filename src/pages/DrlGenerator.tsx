import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Settings2, Download, RotateCcw } from "lucide-react";
import { addRow, deleteRow, DrlCategory, DrlColumnConfig, DrlRow, DrlStatus, loadCols, loadDrl, saveCols, saveDrl, updateRow } from "@/lib/drl/store";
import { PRADAR_SEEDS } from "@/lib/drl/seeds";
import { loadPias } from "@/lib/pia/store";
import { toast } from "sonner";

const STATUSES: DrlStatus[] = ["Open", "Partially Received", "Under Inspection", "Closed", "Not Applicable", "Completed"];

interface ColSpec extends DrlColumnConfig { kind?: "text" | "status" | "date" | "select"; options?: string[]; field?: boolean; }

const SPEC: Record<DrlCategory, ColSpec[]> = {
  tsa: [
    { key: "no", label: "DRL No.", width: 70, visible: true, kind: "text" },
    { key: "domain", label: "Domain", width: 140, visible: true, field: true, kind: "text" },
    { key: "system", label: "System", width: 140, visible: true, field: true, kind: "text" },
    { key: "requirement", label: "Requirement", width: 220, visible: true, field: true, kind: "text" },
    { key: "status", label: "Status", width: 130, visible: true, kind: "status" },
    { key: "tool", label: "Tool", width: 110, visible: true, field: true, kind: "text" },
    { key: "version", label: "Version", width: 80, visible: true, field: true, kind: "text" },
    { key: "managedBy", label: "Managed By", width: 120, visible: true, field: true, kind: "text" },
    { key: "directAccess", label: "Direct Access", width: 110, visible: true, field: true, kind: "text" },
    { key: "adIntegrated", label: "AD Integrated", width: 110, visible: true, field: true, kind: "text" },
    { key: "applicability", label: "Applicability", width: 130, visible: true, field: true, kind: "select", options: ["Per System", "Enterprise-wide"] },
    { key: "remarks", label: "Remarks", width: 180, visible: true, kind: "text" },
    { key: "attachment", label: "Attachment", width: 130, visible: true, kind: "text" },
  ],
  pradar: [
    { key: "no", label: "DRL No.", width: 70, visible: true, kind: "text" },
    { key: "proof", label: "Proof of Compliance", width: 360, visible: true, field: true, kind: "text" },
    { key: "dateRequested", label: "Date Requested", width: 130, visible: true, kind: "date" },
    { key: "dateReceived", label: "Date Received", width: 130, visible: true, kind: "date" },
    { key: "status", label: "Status", width: 130, visible: true, kind: "status" },
    { key: "coList", label: "Co-listed", width: 110, visible: true, field: true, kind: "text" },
    { key: "remarks", label: "Remarks", width: 180, visible: true, kind: "text" },
    { key: "attachment", label: "Attachment", width: 130, visible: true, kind: "text" },
  ],
  pia: [
    { key: "no", label: "DRL No.", width: 70, visible: true, kind: "text" },
    { key: "dpsName", label: "DPS Name", width: 160, visible: true, field: true, kind: "text" },
    { key: "phase", label: "Phase", width: 80, visible: true, field: true, kind: "select", options: ["Phase 1", "Phase 2", "Phase 3", "Phase 4"] },
    { key: "field", label: "Field (linked)", width: 180, visible: true, field: true, kind: "text" },
    { key: "request", label: "Request", width: 220, visible: true, field: true, kind: "text" },
    { key: "dateRequested", label: "Date Requested", width: 130, visible: true, kind: "date" },
    { key: "dateReceived", label: "Date Received", width: 130, visible: true, kind: "date" },
    { key: "status", label: "Status", width: 130, visible: true, kind: "status" },
    { key: "remarks", label: "Remarks", width: 180, visible: true, kind: "text" },
    { key: "attachment", label: "Attachment", width: 130, visible: true, kind: "text" },
  ],
  notice: [
    { key: "no", label: "DRL No.", width: 70, visible: true, kind: "text" },
    { key: "dpsName", label: "DPS Name", width: 160, visible: true, field: true, kind: "text" },
    { key: "issuer", label: "Department / Issuer", width: 180, visible: true, field: true, kind: "text" },
    { key: "dateRequested", label: "Date Requested", width: 130, visible: true, kind: "date" },
    { key: "dateReceived", label: "Date Received", width: 130, visible: true, kind: "date" },
    { key: "status", label: "Status", width: 130, visible: true, kind: "status" },
    { key: "remarks", label: "Remarks", width: 180, visible: true, kind: "text" },
    { key: "attachment", label: "Attachment", width: 130, visible: true, kind: "text" },
  ],
  actions: [
    { key: "no", label: "DRL No.", width: 70, visible: true, kind: "text" },
    { key: "tag", label: "Tag", width: 130, visible: true, kind: "select", options: ["PIA", "PRADAR", "TSA", "Privacy Notice", "Other"] },
    { key: "item", label: "Action / Request", width: 280, visible: true, field: true, kind: "text" },
    { key: "dateRequested", label: "Date Requested", width: 130, visible: true, kind: "date" },
    { key: "dateReceived", label: "Date Received", width: 130, visible: true, kind: "date" },
    { key: "status", label: "Status", width: 130, visible: true, kind: "status" },
    { key: "remarks", label: "Remarks", width: 180, visible: true, kind: "text" },
    { key: "attachment", label: "Attachment", width: 130, visible: true, kind: "text" },
  ],
};

export default function DrlGenerator() {
  const [params] = useSearchParams();
  const piaId = params.get("piaId");
  const defaultTab = (params.get("tab") as DrlCategory) || "tsa";
  const [rows, setRows] = useState<DrlRow[]>([]);

  useEffect(() => {
    let all = loadDrl();
    // Seed PRADAR rows once
    if (!all.some(r => r.category === "pradar")) {
      PRADAR_SEEDS.forEach((seed, i) => {
        all.push({
          id: `DRL-PRADAR-${i + 1}`, category: "pradar", no: i + 1,
          fields: { proof: seed.proof, coList: (seed.coListWith || []).join(", ") },
          status: "Open", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          coListWith: seed.coListWith,
        });
      });
      saveDrl(all);
    }
    setRows(all);
  }, []);

  const refresh = () => setRows(loadDrl());

  return (
    <PageShell title="DRL / IRL" subtitle="Document and inquiry request lists across Tech Security, PRADAR, PIA, Privacy Notice, and Action Items.">
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="tsa">Tech Security</TabsTrigger>
          <TabsTrigger value="pradar">PRADAR</TabsTrigger>
          <TabsTrigger value="pia">PIA</TabsTrigger>
          <TabsTrigger value="notice">Privacy Notice</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="tsa"><DrlTable category="tsa" rows={rows} refresh={refresh} /></TabsContent>
        <TabsContent value="pradar"><DrlTable category="pradar" rows={rows} refresh={refresh} /></TabsContent>
        <TabsContent value="pia"><DrlTable category="pia" rows={rows} refresh={refresh} piaFilter={piaId} /></TabsContent>
        <TabsContent value="notice"><DrlTable category="notice" rows={rows} refresh={refresh} /></TabsContent>
        <TabsContent value="actions"><DrlTable category="actions" rows={rows} refresh={refresh} /></TabsContent>
      </Tabs>

      {defaultTab === "tsa" && <TsaGenerated rows={rows.filter(r => r.category === "tsa")} />}
    </PageShell>
  );
}

function DrlTable({ category, rows, refresh, piaFilter }: { category: DrlCategory; rows: DrlRow[]; refresh: () => void; piaFilter?: string | null }) {
  const baseSpec = SPEC[category];
  const [cols, setCols] = useState<ColSpec[]>(() => {
    const saved = loadCols(category);
    if (!saved) return baseSpec;
    return baseSpec.map(c => ({ ...c, ...(saved.find(s => s.key === c.key) || {}) }));
  });

  useEffect(() => {
    const stripped = cols.map(({ key, label, width, visible, computed }) => ({ key, label, width, visible, computed }));
    saveCols(category, stripped);
  }, [category, cols]);

  let myRows = rows.filter(r => r.category === category);
  if (piaFilter && category === "pia") myRows = myRows.filter(r => r.fields.piaId === piaFilter);

  const visibleCols = cols.filter(c => c.visible);

  const handleAdd = () => { addRow(category); refresh(); };

  const exportCSV = () => {
    const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
    const header = visibleCols.map(c => esc(c.label)).join(",");
    const body = myRows.map(r => visibleCols.map(c => esc(getCell(r, c))).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `DRL_${category}.csv`; a.click();
  };

  const addCustomColumn = (label: string, computed?: "daysOutstanding") => {
    if (!label.trim()) return;
    const key = `custom_${Date.now()}`;
    setCols([...cols, { key, label, width: 140, visible: true, kind: "text", computed }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
          <ColumnConfig cols={cols} setCols={setCols} addCustomColumn={addCustomColumn} onReset={() => setCols(baseSpec)} />
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" />Export CSV</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="text-xs" style={{ width: "max-content", minWidth: "100%" }}>
            <thead className="bg-muted/40 border-b">
              <tr>
                {visibleCols.map(c => (
                  <th key={c.key} className="px-2 py-2 text-left font-medium border-l first:border-l-0" style={{ width: c.width, minWidth: c.width }}>{c.label}</th>
                ))}
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {myRows.map(r => (
                <tr key={r.id} className="border-b align-top hover:bg-muted/10">
                  {visibleCols.map(c => (
                    <td key={c.key} className="px-1 py-1 border-l first:border-l-0" style={{ width: c.width, minWidth: c.width, maxWidth: c.width }}>
                      <CellEditor row={r} col={c} onChange={() => refresh()} />
                    </td>
                  ))}
                  <td className="px-1 py-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { deleteRow(r.id); refresh(); }}>
                      <Trash2 className="h-3 w-3 text-rose-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {myRows.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={visibleCols.length + 1}>No items yet. Click "Add row" to start.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function getCell(r: DrlRow, c: ColSpec): string {
  if (c.computed === "daysOutstanding") {
    if (!r.dateRequested) return "";
    const end = r.dateReceived ? new Date(r.dateReceived) : new Date();
    const days = Math.max(0, Math.round((end.getTime() - new Date(r.dateRequested).getTime()) / 86400000));
    return String(days);
  }
  if (c.key === "no") return String(r.no);
  if (c.key === "status") return r.status;
  if (c.key === "dateRequested") return r.dateRequested || "";
  if (c.key === "dateReceived") return r.dateReceived || "";
  if (c.key === "remarks") return r.remarks || "";
  if (c.key === "attachment") return r.attachment || "";
  if (c.key === "tag") return r.tag || "";
  return r.fields[c.key] || "";
}

function CellEditor({ row, col, onChange }: { row: DrlRow; col: ColSpec; onChange: () => void }) {
  const value = getCell(row, col);
  if (col.computed) return <div className="px-1 text-muted-foreground tabular-nums">{value}</div>;
  if (col.key === "no") return <div className="px-1 font-mono">{value}</div>;

  const commit = (v: string) => {
    if (col.key === "status") updateRow(row.id, { status: v as DrlStatus });
    else if (col.key === "dateRequested") updateRow(row.id, { dateRequested: v });
    else if (col.key === "dateReceived") updateRow(row.id, { dateReceived: v });
    else if (col.key === "remarks") updateRow(row.id, { remarks: v });
    else if (col.key === "attachment") updateRow(row.id, { attachment: v });
    else if (col.key === "tag") updateRow(row.id, { tag: v });
    else updateRow(row.id, { fields: { [col.key]: v } });
    onChange();
  };

  if (col.kind === "status") {
    return (
      <Select value={value} onValueChange={commit}>
        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
    );
  }
  if (col.kind === "select" && col.options) {
    return (
      <Select value={value} onValueChange={commit}>
        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>{col.options.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
    );
  }
  if (col.kind === "date") {
    return <Input type="date" value={value} onChange={(e) => commit(e.target.value)} className="h-7 text-xs" />;
  }
  return <Input value={value} onChange={(e) => commit(e.target.value)} className="h-7 text-xs" />;
}

function ColumnConfig({ cols, setCols, addCustomColumn, onReset }:
  { cols: ColSpec[]; setCols: (c: ColSpec[]) => void; addCustomColumn: (label: string, computed?: "daysOutstanding") => void; onReset: () => void; }) {
  const [newLabel, setNewLabel] = useState("");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline"><Settings2 className="h-3.5 w-3.5 mr-1" />Columns</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Columns</h4>
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onReset}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
        </div>
        <div className="space-y-1.5">
          {cols.map((c, i) => (
            <div key={c.key} className="flex items-center gap-2">
              <Checkbox checked={c.visible} onCheckedChange={(v) => { const n = [...cols]; n[i] = { ...c, visible: !!v }; setCols(n); }} />
              <Input value={c.label} onChange={(e) => { const n = [...cols]; n[i] = { ...c, label: e.target.value }; setCols(n); }} className="h-7 text-xs flex-1" />
              <Input type="number" value={c.width} onChange={(e) => { const n = [...cols]; n[i] = { ...c, width: parseInt(e.target.value) || 100 }; setCols(n); }} className="h-7 text-xs w-16" />
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 space-y-2">
          <h5 className="text-xs font-semibold">Add custom column</h5>
          <Input placeholder="Column label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="h-7 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => { addCustomColumn(newLabel); setNewLabel(""); }}>Text column</Button>
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => { addCustomColumn("Days Outstanding", "daysOutstanding"); }}>+ Days Outstanding</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TsaGenerated({ rows }: { rows: DrlRow[] }) {
  // Auto-generate guide questions, DRL items, IRL items from TSA rows
  const guide = useMemo(() => rows.filter(r => r.status !== "Not Applicable").map(r =>
    `[${r.fields.domain || "—"} / ${r.fields.system || "—"}] Walk through ${r.fields.requirement || "the requirement"} (${r.fields.applicability || "scope TBD"})`), [rows]);
  const drl = useMemo(() => rows.filter(r => r.status === "Open" || r.status === "Partially Received").map(r =>
    `${r.fields.requirement || "Document"} for ${r.fields.system || "—"} (${r.fields.managedBy || "owner TBD"})`), [rows]);
  // Dedupe IRL vs guide
  const irl = useMemo(() => rows.filter(r => r.status === "Open").map(r =>
    `How is ${r.fields.requirement || "this control"} implemented and monitored in ${r.fields.system || "—"}?`)
    .filter(q => !guide.includes(q)), [rows, guide]);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold">Auto-generated from Tech Security rows</h3>
        <div className="grid lg:grid-cols-3 gap-4 text-xs">
          <Subpanel title={`Guide Questions (${guide.length})`}>{guide}</Subpanel>
          <Subpanel title={`DRL items (${drl.length})`}>{drl}</Subpanel>
          <Subpanel title={`IRL items (${irl.length})`}>{irl}</Subpanel>
        </div>
      </CardContent>
    </Card>
  );
}
function Subpanel({ title, children }: { title: string; children: string[] }) {
  return (
    <div className="border rounded p-3 bg-muted/20">
      <div className="font-medium mb-2">{title}</div>
      {children.length === 0 ? <div className="text-muted-foreground">None</div> : (
        <ol className="list-decimal list-inside space-y-1">{children.map((q, i) => <li key={i}>{q}</li>)}</ol>
      )}
    </div>
  );
}

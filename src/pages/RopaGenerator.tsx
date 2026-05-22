import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pia } from "@/lib/pia/schema";
import { loadPias } from "@/lib/pia/store";
import { resolveValue } from "@/lib/pia/ropaMap";
import { loadCols, saveCols, resetCols, RopaColumnConfig } from "@/lib/ropaCompilation";
import { Download, FileSpreadsheet, FileText, RotateCcw, Settings2, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type Kind = "ropa" | "npc";

export default function RopaGenerator() {
  const { piaId } = useParams();
  const navigate = useNavigate();
  const [pias, setPias] = useState<Pia[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const all = loadPias();
    setPias(all);
    setSelected(new Set(all.map(p => p.id)));
  }, []);

  return (
    <PageShell
      title="ROPA & NPC-RS — Compilation"
      subtitle="Live compilation across all PIAs. Edit headers and column widths here; edit values in their source PIA."
      back
    >
      {piaId && (
        <div className="text-xs text-muted-foreground -mt-2">
          Filtered focus on PIA {piaId}. <button className="underline" onClick={() => navigate("/ropa")}>Clear</button>
        </div>
      )}
      <Tabs defaultValue="ropa">
        <TabsList>
          <TabsTrigger value="ropa">ROPA</TabsTrigger>
          <TabsTrigger value="npc">NPC-RS</TabsTrigger>
        </TabsList>
        <TabsContent value="ropa">
          <CompilationTable kind="ropa" pias={pias} selected={selected} setSelected={setSelected} focusPiaId={piaId} />
        </TabsContent>
        <TabsContent value="npc">
          <CompilationTable kind="npc" pias={pias} selected={selected} setSelected={setSelected} focusPiaId={piaId} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function CompilationTable({
  kind, pias, selected, setSelected, focusPiaId,
}: {
  kind: Kind; pias: Pia[]; selected: Set<string>; setSelected: (s: Set<string>) => void; focusPiaId?: string;
}) {
  const navigate = useNavigate();
  const [cols, setCols] = useState<RopaColumnConfig[]>(() => loadCols(kind));
  const focusRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => { setCols(loadCols(kind)); }, [kind]);
  useEffect(() => { saveCols(kind, cols); }, [kind, cols]);
  useEffect(() => { if (focusRef.current) focusRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); }, [focusPiaId, pias.length]);

  const visibleCols = useMemo(() => cols.filter(c => c.visible), [cols]);
  const rows = pias.filter(p => selected.has(p.id));

  const updateCol = (i: number, patch: Partial<RopaColumnConfig>) => {
    const next = [...cols]; next[i] = { ...next[i], ...patch }; setCols(next);
  };

  const exportCSV = () => {
    const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
    const header = ["PIA", ...visibleCols.map(c => c.label)].map(esc).join(",");
    const body = rows.map(p => [p.title, ...visibleCols.map(c => resolveValue(p, c.key, kind))].map(esc).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${kind.toUpperCase()}_compilation.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const exportXLSX = () => {
    const data = rows.map(p => {
      const o: Record<string, string> = { PIA: p.title };
      for (const c of visibleCols) o[c.label] = resolveValue(p, c.key, kind);
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 30 }, ...visibleCols.map(c => ({ wch: Math.max(15, Math.round(c.width / 8)) }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, kind.toUpperCase());
    XLSX.writeFile(wb, `${kind.toUpperCase()}_compilation.xlsx`);
    toast.success("Excel exported");
  };

  const exportJSON = () => {
    const data = {
      kind, generated: new Date().toISOString(),
      columns: visibleCols.map(c => ({ key: c.key, label: c.label })),
      rows: rows.map(p => ({
        piaId: p.id, title: p.title,
        values: Object.fromEntries(visibleCols.map(c => [c.key, resolveValue(p, c.key, kind)])),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${kind.toUpperCase()}_compilation.json`;
    a.click();
  };

  const exportPDF = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${kind.toUpperCase()} Compilation</title>
      <style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:10px;margin:24px}
      h1{font-size:16px}table{width:100%;border-collapse:collapse;table-layout:fixed}
      th,td{border:1px solid #ddd;padding:6px;vertical-align:top;word-wrap:break-word}
      th{background:#f3f4f6}tr:nth-child(even){background:#fafafa}@media print{button{display:none}}</style>
      </head><body><h1>${kind.toUpperCase()} Compilation</h1>
      <button onclick="window.print()" style="margin:8px 0;padding:6px 12px">Print / Save as PDF</button>
      <table><thead><tr><th style="width:140px">PIA</th>${visibleCols.map(c => `<th style="width:${c.width}px">${c.label}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(p => `<tr><td><b>${p.title}</b><br><span style="color:#666">${p.id}</span></td>${visibleCols.map(c => `<td>${(resolveValue(p, c.key, kind) || "").replace(/</g,"&lt;").replace(/\n/g,"<br>")}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  const toggleAll = (on: boolean) => setSelected(new Set(on ? pias.map(p => p.id) : []));
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline"><Settings2 className="h-3.5 w-3.5 mr-1" />Columns ({visibleCols.length}/{cols.length})</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-96 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Edit columns</h4>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { resetCols(kind); setCols(loadCols(kind)); }}>
                  <RotateCcw className="h-3 w-3 mr-1" />Reset
                </Button>
              </div>
              <div className="space-y-2">
                {cols.map((c, i) => (
                  <div key={c.key} className="flex items-center gap-2">
                    <Checkbox checked={c.visible} onCheckedChange={(v) => updateCol(i, { visible: !!v })} />
                    <Input value={c.label} onChange={(e) => updateCol(i, { label: e.target.value })} className="h-7 text-xs flex-1" />
                    <Input type="number" value={c.width} onChange={(e) => updateCol(i, { width: parseInt(e.target.value) || 100 })} className="h-7 text-xs w-16" />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">PIAs ({selected.size}/{pias.length})</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 max-h-96 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Select PIAs</h4>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => toggleAll(true)}>All</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => toggleAll(false)}>None</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                {pias.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded">
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} />
                    <span className="truncate">{p.title}</span>
                  </label>
                ))}
                {pias.length === 0 && <div className="text-xs text-muted-foreground p-2">No PIAs yet.</div>}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={exportJSON}><Download className="h-3.5 w-3.5 mr-1" />JSON</Button>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" />CSV</Button>
          <Button size="sm" variant="outline" onClick={exportPDF}><FileText className="h-3.5 w-3.5 mr-1" />PDF</Button>
          <Button size="sm" onClick={exportXLSX}><FileSpreadsheet className="h-3.5 w-3.5 mr-1" />Excel</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No PIAs selected or none exist.</div>
          ) : (
            <table className="text-xs" style={{ width: "max-content", minWidth: "100%" }}>
              <thead className="bg-muted/40 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-medium w-40 sticky left-0 bg-muted/40 z-20">PIA</th>
                  {visibleCols.map(c => (
                    <th key={c.key} className="px-3 py-2 text-left font-medium border-l" style={{ width: c.width, minWidth: c.width }}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(p => (
                  <tr key={p.id} ref={p.id === focusPiaId ? focusRef : undefined} className={`border-b align-top hover:bg-muted/20 ${p.id === focusPiaId ? "bg-accent/10" : ""}`}>
                    <td className="px-3 py-2 sticky left-0 bg-background z-10 border-r">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-[10px] text-muted-foreground">{p.type} · {p.scope}</div>
                    </td>
                    {visibleCols.map(c => (
                      <td key={c.key} className="px-3 py-2 border-l group" style={{ width: c.width, minWidth: c.width, maxWidth: c.width }}>
                        <div className="whitespace-pre-wrap break-words">{resolveValue(p, c.key, kind) || <span className="text-muted-foreground italic">—</span>}</div>
                        <button
                          onClick={() => navigate(`/pia/${p.id}`)}
                          className="opacity-0 group-hover:opacity-100 mt-1 text-[10px] text-accent hover:underline inline-flex items-center gap-0.5"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />Edit in PIA
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

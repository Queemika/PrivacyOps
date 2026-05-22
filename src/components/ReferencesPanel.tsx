import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen, ExternalLink, Plus, Trash2, Link as LinkIcon, FileText, Table as TableIcon,
  Newspaper, Wand2, Lock,
} from "lucide-react";
import {
  RefBlock, ModuleId, getModuleRefs, setModuleRefs, isAdmin, tidyText,
} from "@/lib/references/store";
import { toast } from "sonner";

interface Props { moduleId: ModuleId; title?: string }

export function ReferencesPanel({ moduleId, title = "References" }: Props) {
  const [blocks, setBlocks] = useState<RefBlock[]>([]);
  const admin = isAdmin();

  useEffect(() => { setBlocks(getModuleRefs(moduleId)); }, [moduleId]);

  const persist = (next: RefBlock[]) => { setBlocks(next); setModuleRefs(moduleId, next); };

  const add = (type: RefBlock["type"]) => {
    const b: RefBlock = {
      id: `R-${Date.now()}`, type, updatedAt: new Date().toISOString(),
      title: type === "link" ? "New link" : type === "blog" ? "New post" : type === "table" ? "New table" : "",
      url: type === "link" ? "https://" : undefined,
      body: type === "paragraph" || type === "blog" ? "" : undefined,
      headers: type === "table" ? ["Column 1", "Column 2"] : undefined,
      rows: type === "table" ? [["", ""]] : undefined,
    };
    persist([...blocks, b]);
  };

  const update = (id: string, patch: Partial<RefBlock>) => {
    persist(blocks.map(b => b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b));
  };

  const remove = (id: string) => persist(blocks.filter(b => b.id !== id));

  const tidy = (id: string) => {
    const b = blocks.find(x => x.id === id);
    if (!b?.body) return;
    update(id, { body: tidyText(b.body) });
    toast.success("Cleaned formatting");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">{title}</h3>
          {!admin && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground border rounded-full px-2 py-0.5">
              <Lock className="h-2.5 w-2.5" /> Read-only
            </span>
          )}
        </div>
        {admin && (
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={() => add("link")}><LinkIcon className="h-3 w-3 mr-1" />Link</Button>
            <Button size="sm" variant="outline" onClick={() => add("paragraph")}><FileText className="h-3 w-3 mr-1" />Paragraph</Button>
            <Button size="sm" variant="outline" onClick={() => add("table")}><TableIcon className="h-3 w-3 mr-1" />Table</Button>
            <Button size="sm" variant="outline" onClick={() => add("blog")}><Newspaper className="h-3 w-3 mr-1" />Blog post</Button>
          </div>
        )}
      </div>

      {blocks.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">
          No references yet. {admin ? "Use the buttons above to add some." : "Ask an admin to add references."}
        </CardContent></Card>
      )}

      {blocks.map(b => (
        <Card key={b.id}>
          <CardContent className="p-4 space-y-2">
            {b.type === "link" && (
              admin ? (
                <div className="space-y-2">
                  <Input value={b.title || ""} onChange={(e) => update(b.id, { title: e.target.value })} placeholder="Title" />
                  <Input value={b.url || ""} onChange={(e) => update(b.id, { url: e.target.value })} placeholder="https://..." />
                </div>
              ) : (
                <a href={b.url} target="_blank" rel="noreferrer" className="flex items-center justify-between hover:text-accent">
                  <span className="text-sm font-medium flex items-center gap-2"><LinkIcon className="h-3.5 w-3.5 text-accent" />{b.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              )
            )}

            {(b.type === "paragraph" || b.type === "blog") && (
              admin ? (
                <div className="space-y-2">
                  <Input value={b.title || ""} onChange={(e) => update(b.id, { title: e.target.value })} placeholder={b.type === "blog" ? "Post title" : "Heading (optional)"} />
                  <Textarea rows={b.type === "blog" ? 8 : 4} value={b.body || ""} onChange={(e) => update(b.id, { body: e.target.value })}
                    placeholder={b.type === "blog" ? "Write or paste content here..." : "Paragraph text"} />
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onClick={() => tidy(b.id)}><Wand2 className="h-3 w-3 mr-1" />Format & clean</Button>
                  </div>
                </div>
              ) : (
                <div>
                  {b.title && <h4 className="text-sm font-semibold mb-1">{b.title}</h4>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{b.body}</p>
                </div>
              )
            )}

            {b.type === "table" && (
              admin ? (
                <RefTableEditor block={b} onChange={(patch) => update(b.id, patch)} />
              ) : (
                <RefTableView block={b} />
              )
            )}

            {admin && (
              <div className="flex justify-end pt-1">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => remove(b.id)}>
                  <Trash2 className="h-3 w-3 mr-1 text-destructive" />Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RefTableEditor({ block, onChange }: { block: RefBlock; onChange: (p: Partial<RefBlock>) => void }) {
  const headers = block.headers || [];
  const rows = block.rows || [];

  const setHeader = (i: number, v: string) => { const n = [...headers]; n[i] = v; onChange({ headers: n }); };
  const setCell = (r: number, c: number, v: string) => { const n = rows.map(row => [...row]); n[r][c] = v; onChange({ rows: n }); };
  const addCol = () => onChange({ headers: [...headers, `Column ${headers.length + 1}`], rows: rows.map(r => [...r, ""]) });
  const addRow = () => onChange({ rows: [...rows, headers.map(() => "")] });
  const delCol = (i: number) => onChange({ headers: headers.filter((_, idx) => idx !== i), rows: rows.map(r => r.filter((_, idx) => idx !== i)) });
  const delRow = (i: number) => onChange({ rows: rows.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      <Input value={block.title || ""} onChange={(e) => onChange({ title: e.target.value })} placeholder="Table title" />
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-1 border-l first:border-l-0">
                  <div className="flex gap-1">
                    <Input value={h} onChange={(e) => setHeader(i, e.target.value)} className="h-7 text-xs" />
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => delCol(i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </th>
              ))}
              <th className="p-1 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-t">
                {row.map((cell, c) => (
                  <td key={c} className="p-1 border-l first:border-l-0">
                    <Input value={cell} onChange={(e) => setCell(r, c, e.target.value)} className="h-7 text-xs" />
                  </td>
                ))}
                <td className="p-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => delRow(r)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={addCol}><Plus className="h-3 w-3 mr-1" />Column</Button>
        <Button size="sm" variant="outline" onClick={addRow}><Plus className="h-3 w-3 mr-1" />Row</Button>
      </div>
    </div>
  );
}

function RefTableView({ block }: { block: RefBlock }) {
  return (
    <div>
      {block.title && <h4 className="text-sm font-semibold mb-2">{block.title}</h4>}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>{(block.headers || []).map((h, i) => <th key={i} className="p-2 text-left font-medium border-l first:border-l-0">{h}</th>)}</tr>
          </thead>
          <tbody>
            {(block.rows || []).map((row, r) => (
              <tr key={r} className="border-t">
                {row.map((c, ci) => <td key={ci} className="p-2 border-l first:border-l-0">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

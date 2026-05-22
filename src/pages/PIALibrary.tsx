import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusChip } from "@/components/StatusChip";
import { mockPIAs } from "@/lib/mockData";
import { loadPias, createPia, savePias, getActiveEngagementId, ensureSeedEngagement } from "@/lib/pia/store";
import { Pia } from "@/lib/pia/schema";
import { Search, Upload, Layers, FilePlus2, Table2, ShieldAlert, BookOpen, Mail } from "lucide-react";
import { RelatedLinks } from "@/components/RelatedLinks";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const STATUS_TONES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  "In Review": "bg-[hsl(var(--tile-amber-bg))] text-[hsl(var(--tile-amber-fg))] border-[hsl(var(--tile-amber-fg))]/30",
  Approved: "bg-[hsl(var(--tile-blue-bg))] text-[hsl(var(--tile-blue-fg))] border-[hsl(var(--tile-blue-fg))]/30",
  Final: "bg-[hsl(var(--tile-green-bg))] text-[hsl(var(--tile-green-fg))] border-[hsl(var(--tile-green-fg))]/30",
};

function piaStatus(p: Pia): string {
  if (p.phase4?.approved?.name) return "Final";
  if (p.phase4?.reviewed?.name) return "Approved";
  if (p.phase4?.prepared?.name) return "In Review";
  return "Draft";
}

export default function PIALibrary() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [storePias, setStorePias] = useState<Pia[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { setStorePias(loadPias()); }, []);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const filteredMock = mockPIAs.filter((p) => p.dpsName.toLowerCase().includes(q.toLowerCase()));
  const filteredStore = storePias.filter((p) => (p.title || "").toLowerCase().includes(q.toLowerCase()));

  const onImport = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const engagementId = getActiveEngagementId() || ensureSeedEngagement().id;
      const created: Pia[] = [];
      rows.forEach((r) => {
        const title = (r["DPS Name"] || r["PIA Name"] || r["Title"] || `Imported PIA ${created.length + 1}`).toString();
        const p = createPia(engagementId, { title, type: "Full", dpsStatus: "New", scope: "Individual" });
        created.push(p);
      });
      const all = [...created, ...loadPias().filter((p) => !created.some((c) => c.id === p.id))];
      savePias(all);
      setStorePias(loadPias());
      toast.success(`Imported ${created.length} PIA${created.length === 1 ? "" : "s"} from ${file.name}`);
    } catch (e) {
      toast.error("Could not parse the Excel file");
    }
  };

  return (
    <PageShell
      title="PIA Library"
      subtitle="All generated and uploaded PIAs. Select multiple to build a compilation set."
      actions={
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.currentTarget.value = ""; }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload .xlsx</Button>
          <Button asChild variant="outline"><Link to="/pia/new"><FilePlus2 className="mr-2 h-4 w-4" />New PIA</Link></Button>
          <Button asChild disabled={selected.length === 0}>
            <Link to="/compile" state={{ ids: selected }}><Layers className="mr-2 h-4 w-4" />Compile ({selected.length})</Link>
          </Button>
        </>
      }
    >
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by DPS, owner..." className="pl-9" />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="status-chip bg-muted text-muted-foreground border-border">Total ({mockPIAs.length + storePias.length})</span>
              <span className="status-chip bg-accent/10 text-accent border-accent/30">Live ({storePias.length})</span>
              <span className="status-chip bg-[hsl(var(--tile-amber-bg))] text-[hsl(var(--tile-amber-fg))] border-[hsl(var(--tile-amber-fg))]/30">Finalization ({mockPIAs.filter((p) => p.status === "For Finalization").length})</span>
              <span className="status-chip bg-[hsl(var(--tile-green-bg))] text-[hsl(var(--tile-green-fg))] border-[hsl(var(--tile-green-fg))]/30">Final ({mockPIAs.filter((p) => p.status === "Final").length})</span>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-2.5 w-10"></th>
                <th className="text-left font-medium px-4 py-2.5">PIA ID</th>
                <th className="text-left font-medium px-4 py-2.5">DPS Name</th>
                <th className="text-left font-medium px-4 py-2.5">Type</th>
                <th className="text-left font-medium px-4 py-2.5">Pipeline</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
                <th className="text-right font-medium px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStore.map((p) => {
                const status = piaStatus(p);
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 bg-accent/5">
                    <td className="px-4 py-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
                    <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3 font-medium"><Link to={`/pia/${p.id}`} className="hover:text-accent transition-colors">{p.title || "Untitled"}</Link></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-3"><span className={`status-chip ${STATUS_TONES[status]}`}>{status}</span></td>
                    <td className="px-4 py-3"><span className="status-chip bg-accent/10 text-accent border-accent/30">Live</span></td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button asChild variant="ghost" size="sm"><Link to={`/ropa/${p.id}`}><Table2 className="h-3.5 w-3.5" /></Link></Button>
                      <Button asChild variant="ghost" size="sm"><Link to={`/drl?piaId=${p.id}`}><ShieldAlert className="h-3.5 w-3.5" /></Link></Button>
                    </td>
                  </tr>
                );
              })}
              {filteredMock.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3 font-medium"><Link to="/pia" className="hover:text-accent transition-colors">{p.dpsName}</Link></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3"><span className={`status-chip ${STATUS_TONES[p.status === "Final" ? "Final" : p.status === "For Finalization" ? "Approved" : "Draft"]}`}>{p.status}</span></td>
                  <td className="px-4 py-3"><StatusChip status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm"><Link to="/pia">Open</Link></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <RelatedLinks
        title="Jump to"
        links={[
          { to: "/compile", label: "Compilation Builder", icon: Layers },
          { to: "/ropa", label: "ROPA / NPC-RS", icon: Table2 },
          { to: "/summary", label: "Executive Summary", icon: BookOpen },
          { to: "/drl", label: "DRL / IRL", icon: ShieldAlert },
          { to: "/email", label: "Email Generator", icon: Mail },
        ]}
      />
    </PageShell>
  );
}

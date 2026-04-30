import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusChip } from "@/components/StatusChip";
import { mockPIAs } from "@/lib/mockData";
import { Search, Upload, Layers } from "lucide-react";

export default function PIALibrary() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = mockPIAs.filter(p => p.dpsName.toLowerCase().includes(q.toLowerCase()));

  const toggle = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <>
      <PageHeader
        title="PIA Library"
        description="All generated and uploaded PIAs. Select multiple to build a compilation set."
        actions={
          <>
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload Excel PIA</Button>
            <Button asChild disabled={selected.length === 0}>
              <Link to="/compile" state={{ ids: selected }}>
                <Layers className="mr-2 h-4 w-4" />Compile ({selected.length})
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by DPS, owner..." className="pl-9" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="status-chip bg-muted text-muted-foreground border-border">All ({mockPIAs.length})</span>
              <span className="status-chip bg-muted text-muted-foreground border-border">Draft ({mockPIAs.filter(p=>p.status==="Draft").length})</span>
              <span className="status-chip bg-warning/10 text-warning border-warning/30">Finalization ({mockPIAs.filter(p=>p.status==="For Finalization").length})</span>
              <span className="status-chip bg-success/10 text-success border-success/30">Final ({mockPIAs.filter(p=>p.status==="Final").length})</span>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-2.5 w-10"></th>
                <th className="text-left font-medium px-4 py-2.5">PIA ID</th>
                <th className="text-left font-medium px-4 py-2.5">DPS Name</th>
                <th className="text-left font-medium px-4 py-2.5">Category</th>
                <th className="text-left font-medium px-4 py-2.5">Owner</th>
                <th className="text-left font-medium px-4 py-2.5">Phase</th>
                <th className="text-left font-medium px-4 py-2.5">Confidence</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
                <th className="text-left font-medium px-4 py-2.5">Updated</th>
                <th className="text-right font-medium px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3 font-medium">{p.dpsName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                  <td className="px-4 py-3">Phase {p.phase}</td>
                  <td className="px-4 py-3 tabular-nums">{p.confidence}%</td>
                  <td className="px-4 py-3"><StatusChip status={p.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.updatedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm"><Link to="/pia">Open</Link></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

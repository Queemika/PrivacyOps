import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPIAs } from "@/lib/mockData";
import { ArrowRight, Layers } from "lucide-react";

export default function CompilationBuilder() {
  const [name, setName] = useState("Q2 2026 NPC Submission");
  const [ids, setIds] = useState<string[]>(mockPIAs.slice(0, 4).map(p => p.id));

  const toggle = (id: string) =>
    setIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <>
      <PageHeader
        title="Compilation Builder"
        description="Group PIAs into a compilation set to auto-generate Compilation, NPC-RS, and the Executive Summary."
        actions={
          <Button asChild disabled={ids.length === 0}>
            <Link to="/ropa"><Layers className="mr-2 h-4 w-4" />Generate Compilation & NPC-RS <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold mb-1">Select PIAs ({ids.length})</h3>
              <p className="text-xs text-muted-foreground">Final and For-Finalization PIAs are recommended for NPC submission.</p>
            </div>
            <div className="divide-y">
              {mockPIAs.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-4 hover:bg-muted/20 cursor-pointer">
                  <Checkbox checked={ids.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.dpsName}</div>
                    <div className="text-xs text-muted-foreground">{p.id} · {p.owner} · {p.category}</div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">Phase {p.phase}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Compilation name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Selected systems</div>
              <div className="space-y-1.5">
                {ids.length === 0 ? <div className="text-xs text-muted-foreground italic">None selected</div> :
                  mockPIAs.filter(p => ids.includes(p.id)).map(p => (
                    <div key={p.id} className="text-xs px-2 py-1.5 rounded bg-muted/40">{p.dpsName}</div>
                  ))}
              </div>
            </div>
            <div className="pt-3 border-t space-y-2 text-xs">
              <Row k="Outputs" v="Compilation · NPC-RS · Exec Summary" />
              <Row k="Format" v="Excel (.xlsx) + PDF" />
              <Row k="Compliance" v="NPC PH · GDPR overlay" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}

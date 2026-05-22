import { useMemo, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { defaultTechStack, TechItem } from "@/lib/templates/techStack";
import { toast } from "sonner";
import { Lock, ShieldCheck, AlertCircle, ListChecks } from "lucide-react";

const STORE = "pa_tech_stack";

function load(): TechItem[] {
  try { const v = JSON.parse(localStorage.getItem(STORE) || "null"); return v?.length ? v : defaultTechStack; } catch { return defaultTechStack; }
}

export default function TechnicalSecurityAssessment() {
  const [items, setItems] = useState<TechItem[]>(load());
  const [tab, setTab] = useState("all");

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const filtered = tab === "all" ? items : items.filter((i) => i.category === tab);

  const update = (id: string, patch: Partial<TechItem>) => {
    const next = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setItems(next);
    localStorage.setItem(STORE, JSON.stringify(next));
  };

  const counts = {
    impl: items.filter((i) => i.status === "Implemented").length,
    partial: items.filter((i) => i.status === "Partial").length,
    none: items.filter((i) => i.status === "Not Implemented").length,
  };

  return (
    <PageShell
      title="Technical Security Assessment"
      subtitle="Baseline controls evaluated against PH DPA, NPC issuances, and ISO 27001."
      actions={<Button variant="outline" onClick={() => { localStorage.removeItem(STORE); setItems(defaultTechStack); toast.success("Reset to template"); }}>Reset to template</Button>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total controls" value={items.length} icon={ListChecks} accent="blue" />
        <StatTile label="Implemented" value={counts.impl} icon={ShieldCheck} accent="green" />
        <StatTile label="Partial" value={counts.partial} icon={Lock} accent="amber" />
        <StatTile label="Gaps" value={counts.none} icon={AlertCircle} accent="rose" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="px-4 pt-2">
            <SectionTabs
              tabs={[{ id: "all", label: "All", count: items.length }, ...categories.map((c) => ({ id: c, label: c, count: items.filter((i) => i.category === c).length }))]}
              value={tab}
              onChange={setTab}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">ID</th>
                  <th className="text-left font-medium px-4 py-2.5">Control</th>
                  <th className="text-left font-medium px-4 py-2.5">Reference</th>
                  <th className="text-left font-medium px-4 py-2.5 w-40">Status</th>
                  <th className="text-left font-medium px-4 py-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
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
                    <td className="px-4 py-2.5">
                      <Input value={it.remarks} onChange={(e) => update(it.id, { remarks: e.target.value })} className="h-8 text-xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { pradarItems } from "@/lib/mockData";
import { Sparkles, Mic } from "lucide-react";
import { StatusChip } from "@/components/StatusChip";

const levelColor = ["bg-destructive", "bg-warning", "bg-info", "bg-success"];
const levelLabel = ["Non-compliant", "Partial", "Substantial", "Compliant"];

export default function PradarChecklist() {
  const [items, setItems] = useState(pradarItems);

  const score = useMemo(() => {
    const total = items.reduce((acc, it) => acc + (it.checked ? it.level : 0), 0);
    const max = items.length * 4;
    return Math.round((total / max) * 100);
  }, [items]);

  const toggle = (id: string) =>
    setItems(s => s.map(i => i.id === id ? { ...i, checked: !i.checked } : i));

  const setLevel = (id: string, level: number) =>
    setItems(s => s.map(i => i.id === id ? { ...i, level } : i));

  const gaps = items.filter(i => !i.checked || i.level < 3);

  return (
    <>
      <PageHeader
        title="PRADAR Assessment"
        description="5-in-1 module — checklist, gaps, risks, action items, and risk ratings. References to DPA / IRR / NPC are illustrative."
        actions={
          <>
            <Button variant="outline"><Mic className="mr-2 h-4 w-4" />Verbal confirmation</Button>
            <Button><Sparkles className="mr-2 h-4 w-4" />Generate outputs</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Checklist</h3>
              <span className="text-xs text-muted-foreground">{items.filter(i => i.checked).length} / {items.length} confirmed</span>
            </div>
            <div className="divide-y">
              {items.map(it => (
                <div key={it.id} className="p-4 hover:bg-muted/10">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={it.checked} onCheckedChange={() => toggle(it.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground">{it.id}</span>
                        <span className="text-xs text-accent font-medium">{it.area}</span>
                      </div>
                      <div className="text-sm">{it.item}</div>
                      <div className="flex items-center gap-1 mt-2">
                        {[1,2,3,4].map(lv => (
                          <button key={lv} onClick={() => setLevel(it.id, lv)}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                              it.level === lv
                                ? `${levelColor[lv-1]} text-white border-transparent`
                                : "bg-background text-muted-foreground hover:bg-muted"
                            }`}>
                            L{lv} · {levelLabel[lv-1]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Compliance score</div>
              <div className="text-5xl font-semibold mt-2 tabular-nums">{score}<span className="text-2xl text-muted-foreground">%</span></div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${score >= 75 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${score}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Gaps & risks</h3>
              <div className="space-y-2">
                {gaps.length === 0 && <div className="text-xs text-muted-foreground">No material gaps detected.</div>}
                {gaps.map(g => (
                  <div key={g.id} className="text-xs p-2 rounded bg-warning/5 border border-warning/20">
                    <div className="font-medium">{g.item}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusChip status={g.level <= 1 ? "High" : g.level === 2 ? "Medium" : "Low"} />
                      <span className="text-muted-foreground">Action: assign owner & due date</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

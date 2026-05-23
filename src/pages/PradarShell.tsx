import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import { ReferencesPanel } from "@/components/ReferencesPanel";
import PradarChecklist from "./PradarChecklist";

const BANDS = [
  { range: "1.0 – 1.4", label: "Non-Compliant", color: "hsl(var(--destructive))", desc: "Controls largely absent or undocumented; gaps create material risk." },
  { range: "1.5 – 2.4", label: "Partially Compliant", color: "hsl(var(--warning))", desc: "Some controls in place but inconsistent application or evidence gaps." },
  { range: "2.5 – 3.4", label: "Substantially Compliant", color: "hsl(var(--accent))", desc: "Controls documented and routinely applied; minor improvement opportunities." },
  { range: "3.5 – 4.0", label: "Fully Compliant", color: "hsl(var(--success))", desc: "Mature, monitored, and continuously improved with auditable evidence." },
];

export default function PradarShell() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "scoreboard";

  return (
    <div>
      {/* Page header sits ABOVE the tabs */}
      <div className="px-6 pt-4">
        <PageHeader
          title="PRADAR (5-in-1) Assessment"
          description="Privacy Risk and Document Assessment Request — 24 control questions across 10 privacy domains."
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
        <div className="px-6">
          <TabsList>
            <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
            <TabsTrigger value="working">Working File</TabsTrigger>
            <TabsTrigger value="guide">Rating Guide</TabsTrigger>
            <TabsTrigger value="drl">DRL</TabsTrigger>
            <TabsTrigger value="refs">References</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="scoreboard" className="mt-0"><PradarChecklist hideControls hideHeader /></TabsContent>
        <TabsContent value="working" className="mt-0"><PradarChecklist hideScoreboard hideHeader /></TabsContent>
        <TabsContent value="guide" className="mt-0">
          <PageShell title="Rating Guide" subtitle="Maturity bands used to grade each control question (1.0 → 4.0).">
            <div className="grid md:grid-cols-2 gap-3">
              {BANDS.map(b => (
                <Card key={b.range}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-sm" style={{ background: b.color }} />
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">{b.range}</span>
                      <span className="text-sm font-semibold">{b.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </PageShell>
        </TabsContent>
        <TabsContent value="drl" className="mt-0">
          <PageShell title="PRADAR — DRL items" subtitle="Document requests linked to PRADAR controls.">
            <DrlInlinePanel category="pradar" title="PRADAR (5-in-1) DRL items" />
          </PageShell>
        </TabsContent>
        <TabsContent value="refs" className="mt-0">
          <PageShell title="PRADAR — References" subtitle="Standards and issuances underpinning PRADAR.">
            <ReferencesPanel moduleId="pradar" title="PRADAR References" />
          </PageShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}

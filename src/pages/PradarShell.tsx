import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import PradarChecklist from "./PradarChecklist";
import { BookOpen, ExternalLink } from "lucide-react";

const BANDS = [
  { range: "1.0 – 1.4", label: "Non-Compliant", color: "hsl(var(--destructive))", desc: "Controls largely absent or undocumented; gaps create material risk." },
  { range: "1.5 – 2.4", label: "Partially Compliant", color: "hsl(var(--warning))", desc: "Some controls in place but inconsistent application or evidence gaps." },
  { range: "2.5 – 3.4", label: "Substantially Compliant", color: "hsl(var(--accent))", desc: "Controls documented and routinely applied; minor improvement opportunities." },
  { range: "3.5 – 4.0", label: "Fully Compliant", color: "hsl(var(--success))", desc: "Mature, monitored, and continuously improved with auditable evidence." },
];

const REFS = [
  { title: "NPC Circular 2022-01 — PIA", url: "https://privacy.gov.ph/circulars/" },
  { title: "ISO/IEC 27701 — Privacy Information Management", url: "https://www.iso.org/standard/71670.html" },
  { title: "ISO/IEC 29100 — Privacy framework", url: "https://www.iso.org/standard/45123.html" },
  { title: "NIST Privacy Framework v1.0", url: "https://www.nist.gov/privacy-framework" },
];

export default function PradarShell() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "scoreboard";

  return (
    <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
      <div className="px-6 pt-4">
        <TabsList>
          <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
          <TabsTrigger value="working">Working File</TabsTrigger>
          <TabsTrigger value="guide">Rating Guide</TabsTrigger>
          <TabsTrigger value="drl">DRL</TabsTrigger>
          <TabsTrigger value="refs">References</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="scoreboard" className="mt-0"><PradarChecklist hideControls /></TabsContent>
      <TabsContent value="working" className="mt-0"><PradarChecklist hideScoreboard /></TabsContent>
      <TabsContent value="guide" className="mt-0">
        <PageShell title="PRADAR — Rating Guide" subtitle="Maturity bands used to grade each control question (1.0 → 4.0).">
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
          <DrlInlinePanel category="pradar" title="PRADAR DRL items" />
        </PageShell>
      </TabsContent>
      <TabsContent value="refs" className="mt-0">
        <PageShell title="PRADAR — References" subtitle="Standards and issuances underpinning PRADAR.">
          <Card>
            <CardContent className="p-0 divide-y">
              {REFS.map(r => (
                <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 hover:bg-muted/30">
                  <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-accent" /><span className="text-sm font-medium">{r.title}</span></div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ))}
            </CardContent>
          </Card>
        </PageShell>
      </TabsContent>
    </Tabs>
  );
}

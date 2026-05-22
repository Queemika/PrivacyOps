import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import PIALibrary from "./PIALibrary";
import RopaGenerator from "./RopaGenerator";
import { loadPias } from "@/lib/pia/store";
import { aggregate } from "@/lib/analytics/executiveSummary";
import { BookOpen, ExternalLink } from "lucide-react";

const REFERENCES = [
  { title: "NPC Circular 2022-01 — Privacy Impact Assessment", url: "https://privacy.gov.ph/circulars/" },
  { title: "Data Privacy Act of 2012 (RA 10173)", url: "https://privacy.gov.ph/data-privacy-act/" },
  { title: "NPC Advisory 2017-01 — Designation of DPO", url: "https://privacy.gov.ph/advisories/" },
  { title: "ISO/IEC 29134:2017 — PIA Guidelines", url: "https://www.iso.org/standard/62289.html" },
];

export default function PiaShell() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "library";

  return (
    <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })} className="w-full">
      <div className="px-6 pt-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="ropa">RoPA</TabsTrigger>
          <TabsTrigger value="npc">NPC-RS</TabsTrigger>
          <TabsTrigger value="drl">DRL</TabsTrigger>
          <TabsTrigger value="refs">References</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="summary" className="mt-0"><PiaSummary /></TabsContent>
      <TabsContent value="library" className="mt-0"><PIALibrary /></TabsContent>
      <TabsContent value="ropa" className="mt-0"><RopaGenerator /></TabsContent>
      <TabsContent value="npc" className="mt-0"><RopaGenerator /></TabsContent>
      <TabsContent value="drl" className="mt-0">
        <PageShell title="PIA — DRL items" subtitle="Document requests scoped to PIA workables.">
          <DrlInlinePanel category="pia" title="PIA DRL items" />
        </PageShell>
      </TabsContent>
      <TabsContent value="refs" className="mt-0"><PiaReferences /></TabsContent>
    </Tabs>
  );
}

function PiaSummary() {
  const [agg, setAgg] = useState<ReturnType<typeof aggregate> | null>(null);
  useEffect(() => { setAgg(aggregate(loadPias())); }, []);
  if (!agg) return null;
  const tile = (label: string, value: string | number) => (
    <div className="border rounded-lg p-4 bg-card">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
  return (
    <PageShell title="PIA — Summary" subtitle="Aggregated KPIs across all PIAs in your library.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tile("Total PIAs", agg.totalDps)}
        {tile("Full PIA", agg.fullPia)}
        {tile("Phase 1 only", agg.phase1Only)}
        {tile("Consolidated", agg.consolidated)}
        {tile("PI records", agg.piRecords.toLocaleString())}
        {tile("SPI records", agg.spiRecords.toLocaleString())}
        {tile("Cross-border", agg.withCrossBorder)}
        {tile("Overall risk", agg.overallRiskBand)}
      </div>
    </PageShell>
  );
}

function PiaReferences() {
  return (
    <PageShell title="PIA — References" subtitle="Standards and circulars that underpin PIA practice.">
      <Card>
        <CardContent className="p-0 divide-y">
          {REFERENCES.map(r => (
            <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">{r.title}</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}

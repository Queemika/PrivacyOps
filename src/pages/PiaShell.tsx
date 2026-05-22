import { useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import { ReferencesPanel } from "@/components/ReferencesPanel";
import PIALibrary from "./PIALibrary";
import RopaGenerator from "./RopaGenerator";
import ExecutiveSummary from "./ExecutiveSummary";
import { BarChart3 } from "lucide-react";

export default function PiaShell() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "library";

  return (
    <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })} className="w-full">
      <div className="px-6 pt-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="ropa">Compilation</TabsTrigger>
          <TabsTrigger value="drl">DRL</TabsTrigger>
          <TabsTrigger value="refs">References</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="summary" className="mt-0">
        <div className="px-6 pt-3 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link to="/analytics"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Open Analytics Hub</Link>
          </Button>
        </div>
        <ExecutiveSummary />
      </TabsContent>
      <TabsContent value="library" className="mt-0"><PIALibrary /></TabsContent>
      <TabsContent value="ropa" className="mt-0"><RopaGenerator /></TabsContent>
      <TabsContent value="drl" className="mt-0">
        <PageShell title="PIA — DRL items" subtitle="Document requests scoped to PIA workables.">
          <DrlInlinePanel category="pia" title="PIA DRL items" />
        </PageShell>
      </TabsContent>
      <TabsContent value="refs" className="mt-0">
        <PageShell title="PIA — References" subtitle="Standards and circulars that underpin PIA practice.">
          <ReferencesPanel moduleId="pia" title="PIA References" />
        </PageShell>
      </TabsContent>
    </Tabs>
  );
}

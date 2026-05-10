import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phase1Form } from "@/components/pia/Phase1Form";
import { Phase2Form } from "@/components/pia/Phase2Form";
import { Phase3Form } from "@/components/pia/Phase3Form";
import { Pia } from "@/lib/pia/schema";
import { getPia, upsertPia, ensureSeedEngagement, createPia } from "@/lib/pia/store";
import { Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function PiaWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pia, setPia] = useState<Pia | null>(null);

  useEffect(() => {
    if (!id || id === "new") {
      const eng = ensureSeedEngagement();
      const p = createPia(eng.id, { title: "New PIA", type: "Full", dpsStatus: "New", scope: "Individual" });
      navigate(`/pia/${p.id}`, { replace: true });
      return;
    }
    const found = getPia(id);
    if (!found) {
      const eng = ensureSeedEngagement();
      const p = createPia(eng.id, { title: "New PIA", type: "Full", dpsStatus: "New", scope: "Individual" });
      navigate(`/pia/${p.id}`, { replace: true });
      return;
    }
    setPia(found);
  }, [id, navigate]);

  // Auto-save
  useEffect(() => {
    if (!pia) return;
    const t = setTimeout(() => upsertPia(pia), 600);
    return () => clearTimeout(t);
  }, [pia]);

  const completion = useMemo(() => {
    if (!pia) return 0;
    let total = 0, done = 0;
    Object.values(pia.phase1.threshold).forEach(a => { total++; if (a.yn) done++; });
    const groups = [pia.phase3.principles, pia.phase3.rights, pia.phase3.organizational, pia.phase3.physical, pia.phase3.technical];
    groups.forEach(g => Object.values(g).forEach(a => { total++; if (a.yn) done++; }));
    return total ? Math.round((done / total) * 100) : 0;
  }, [pia]);

  if (!pia) return null;

  return (
    <>
      <PageHeader
        title={pia.title || "Untitled PIA"}
        description={`${pia.id} · ${pia.type} · ${pia.dpsStatus} DPS · ${pia.scope} · ${completion}% complete`}
        actions={
          <>
            <Select value={pia.type} onValueChange={(v) => setPia({ ...pia, type: v as Pia["type"] })}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Phase1">Phase 1 only</SelectItem>
                <SelectItem value="Full">Full PIA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pia.dpsStatus} onValueChange={(v) => setPia({ ...pia, dpsStatus: v as Pia["dpsStatus"] })}>
              <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New DPS</SelectItem>
                <SelectItem value="Existing">Existing DPS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pia.scope} onValueChange={(v) => setPia({ ...pia, scope: v as Pia["scope"] })}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Consolidated">Consolidated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { upsertPia(pia); toast.success("Saved"); }}>
              <Save className="h-4 w-4 mr-2" />Save
            </Button>
            <Button onClick={() => toast.success("Submitted to supervisor")}>
              <ShieldCheck className="h-4 w-4 mr-2" />Submit
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <input
            value={pia.title}
            onChange={(e) => setPia({ ...pia, title: e.target.value })}
            placeholder="DPS Name / PIA Title"
            className="w-full text-lg font-semibold bg-transparent outline-none border-b border-dashed border-muted-foreground/30 focus:border-accent pb-1"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="p1">
        <TabsList>
          <TabsTrigger value="p1">Phase 1 — Project Context</TabsTrigger>
          <TabsTrigger value="p2" disabled={pia.type === "Phase1"}>Phase 2 — Data Mapping</TabsTrigger>
          <TabsTrigger value="p3" disabled={pia.type === "Phase1"}>Phase 3 — Assessment</TabsTrigger>
        </TabsList>
        <TabsContent value="p1">
          <Phase1Form value={pia.phase1} onChange={(p) => setPia({ ...pia, phase1: p })} />
        </TabsContent>
        <TabsContent value="p2">
          <Phase2Form value={pia.phase2} onChange={(p) => setPia({ ...pia, phase2: p })} />
        </TabsContent>
        <TabsContent value="p3">
          <Phase3Form value={pia.phase3} onChange={(p) => setPia({ ...pia, phase3: p })} />
        </TabsContent>
      </Tabs>

      <Card className="mt-6 bg-info/5 border-info/30">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Privacy Risk Map:</strong> Inherent risk ratings come from the firm's template (Impact × Probability).
          Risk owners may request adjustments through the DPO; once approved, override the rating in Phase 3.
        </CardContent>
      </Card>
    </>
  );
}

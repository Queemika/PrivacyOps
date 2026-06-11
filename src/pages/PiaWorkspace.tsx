import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phase1Form } from "@/components/pia/Phase1Form";
import { Phase2Form } from "@/components/pia/Phase2Form";
import { Phase3Form } from "@/components/pia/Phase3Form";
import { Phase4SignOff } from "@/components/pia/Phase4SignOff";
import { Pia } from "@/lib/pia/schema";
import { getPia, upsertPia, ensureSeedEngagement, createPia } from "@/lib/pia/store";
import { Save, ShieldCheck, FileText, Mail, GitCompare, ShieldAlert, Upload, BookOpen, Table2, Building2, Server } from "lucide-react";
import { toast } from "sonner";
import { RelatedLinks } from "@/components/RelatedLinks";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import { PresenceStrip } from "@/components/cowork/PresenceStrip";

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

  useEffect(() => {
    if (!pia) return;
    const t = setTimeout(() => upsertPia(pia), 600);
    return () => clearTimeout(t);
  }, [pia]);

  const isPhase1Only = pia?.type === "Phase1";
  const isConsolidated = pia?.scope === "Consolidated";
  const consolidatedMissing = isConsolidated && (!pia?.consolidatedComponents || pia.consolidatedComponents.length === 0);

  const completion = useMemo(() => {
    if (!pia) return 0;
    let total = 0, done = 0;
    Object.values(pia.phase1.threshold).forEach(a => { total++; if (a.yn) done++; });
    if (!isPhase1Only) {
      const groups = [pia.phase3.principles, pia.phase3.rights, pia.phase3.organizational, pia.phase3.physical, pia.phase3.technical];
      groups.forEach(g => Object.values(g).forEach(a => { total++; if (a.yn) done++; }));
    }
    return total ? Math.round((done / total) * 100) : 0;
  }, [pia, isPhase1Only]);

  if (!pia) return null;

  const handlePhase2Change = (p: typeof pia.phase2) => {
    // Keep title synced with DPS Name
    const titleSync = p.dpsName && p.dpsName !== pia.phase2.dpsName ? { title: p.dpsName } : {};
    setPia({ ...pia, phase2: p, ...titleSync });
  };

  const handleSubmit = () => {
    if (consolidatedMissing) { toast.error("Add DPS Components before submitting."); return; }
    upsertPia(pia);
    toast.success("Submitted to reviewer");
  };

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
            <Button variant="outline" onClick={() => navigate(`/ropa/${pia.id}`)}>
              <FileText className="h-4 w-4 mr-2" />Compilation / NPC-RS
            </Button>
            <Button variant="outline" onClick={() => { upsertPia(pia); toast.success("Saved"); }}>
              <Save className="h-4 w-4 mr-2" />Save
            </Button>
            <Button onClick={handleSubmit}>
              <ShieldCheck className="h-4 w-4 mr-2" />Submit
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <input
            value={pia.title}
            onChange={(e) => setPia({ ...pia, title: e.target.value })}
            placeholder="DPS Name / PIA Title"
            className="w-full text-lg font-semibold bg-transparent outline-none border-b border-dashed border-muted-foreground/30 focus:border-accent pb-1"
          />
          {isConsolidated && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                DPS Components <span className="text-destructive">*</span>
              </Label>
              <Input
                value={(pia.consolidatedComponents || []).join(", ")}
                onChange={(e) => setPia({ ...pia, consolidatedComponents: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="Comma-separated component DPS names (e.g., HRIS Recruitment, HRIS Payroll)"
                className={consolidatedMissing ? "h-9 border-destructive" : "h-9"}
              />
              {consolidatedMissing && <p className="text-[11px] text-destructive mt-1">Required when scope is Consolidated.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="p1">
        <TabsList>
          <TabsTrigger value="p1">{isPhase1Only ? "Threshold Analysis" : "Phase 1 — Project Context"}</TabsTrigger>
          {!isPhase1Only && <TabsTrigger value="p2">Phase 2 — Data Mapping</TabsTrigger>}
          {!isPhase1Only && <TabsTrigger value="p3">Phase 3 — Assessment</TabsTrigger>}
          <TabsTrigger value="p4">Sign-off</TabsTrigger>
          <TabsTrigger value="drl">DRL</TabsTrigger>
        </TabsList>
        <TabsContent value="p1">
          <Phase1Form value={pia.phase1} onChange={(p) => setPia({ ...pia, phase1: p })} phase1OnlyMode={isPhase1Only} piaId={pia.id} dpsName={pia.phase2?.dpsName || pia.title} />
        </TabsContent>
        {!isPhase1Only && (
          <TabsContent value="p2">
            <Phase2Form value={pia.phase2} onChange={handlePhase2Change} phase1={pia.phase1} />
          </TabsContent>
        )}
        {!isPhase1Only && (
          <TabsContent value="p3">
            <Phase3Form value={pia.phase3} onChange={(p) => setPia({ ...pia, phase3: p })} piaId={pia.id} dpsName={pia.phase2?.dpsName || pia.title} />
          </TabsContent>
        )}
        <TabsContent value="p4">
          <Phase4SignOff value={pia.phase4} onChange={(p) => setPia({ ...pia, phase4: p })} />
        </TabsContent>
        <TabsContent value="drl">
          <DrlInlinePanel category="pia" title={`DRL items for ${pia.title || pia.id}`} piaId={pia.id} />
        </TabsContent>
      </Tabs>

      <Card className="mt-6 bg-info/5 border-info/30">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Privacy Risk Map:</strong> 4×4 inherent risk matrix (Impact × Probability) per firm template.
          Buckets — Low 1–3, Medium 4–6, High 8–9, Critical 12–16.
        </CardContent>
      </Card>

      <RelatedLinks
        title="Linked workables"
        links={[
          { to: `/ropa/${pia.id}`, label: "Compilation / NPC-RS", icon: Table2 },
          { to: `/drl?piaId=${pia.id}`, label: "DRL / IRL items", icon: ShieldAlert },
          { to: `/inspection?piaId=${pia.id}`, label: "Physical Inspection", icon: Building2 },
          { to: `/tsa?piaId=${pia.id}`, label: "Technical Security Assessment", icon: Server },
          { to: `/consistency?piaId=${pia.id}`, label: "Consistency Checker", icon: GitCompare },
          { to: `/email?source=pia&refId=${pia.id}`, label: "Email Generator", icon: Mail },
          { to: `/upload?piaId=${pia.id}`, label: "Source Transcript", icon: Upload },
          { to: `/summary?piaId=${pia.id}`, label: "Executive Summary", icon: BookOpen },
          { to: `/library`, label: "PIA Library", icon: FileText },
        ]}
      />
    </>
  );
}

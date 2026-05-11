import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Pia } from "@/lib/pia/schema";
import { getPia, upsertPia, loadPias } from "@/lib/pia/store";
import { ROPA_FIELDS, NPC_FIELDS, FieldDef, resolveValue, deriveFieldValue, toCSV } from "@/lib/pia/ropaMap";
import { Download, RotateCcw, FileText } from "lucide-react";
import { toast } from "sonner";

type Kind = "ropa" | "npc";

export default function RopaGenerator() {
  const { piaId } = useParams();
  const navigate = useNavigate();
  const [pia, setPia] = useState<Pia | null>(null);
  const [allPias, setAllPias] = useState<Pia[]>([]);

  useEffect(() => {
    setAllPias(loadPias());
    if (piaId) {
      const p = getPia(piaId);
      if (p) setPia(p);
    }
  }, [piaId]);

  // Library view
  if (!piaId) {
    return (
      <>
        <PageHeader title="ROPA & NPC-RS Generator" description="Generate regulatory outputs from PIA Phase 2 data." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allPias.length === 0 && (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">No PIAs found. Create one first.</CardContent></Card>
          )}
          {allPias.map(p => (
            <Card key={p.id} className="cursor-pointer hover:border-accent" onClick={() => navigate(`/ropa/${p.id}`)}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-sm">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.id} · {p.type} · {p.scope}</div>
                </div>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (!pia) return null;

  return <RopaEditor pia={pia} setPia={setPia} />;
}

function RopaEditor({ pia, setPia }: { pia: Pia; setPia: (p: Pia) => void }) {
  // Track which fields to include in export per kind
  const [includeRopa, setIncludeRopa] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ROPA_FIELDS.map(f => [f.key, true]))
  );
  const [includeNpc, setIncludeNpc] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NPC_FIELDS.map(f => [f.key, true]))
  );

  useEffect(() => {
    const t = setTimeout(() => upsertPia(pia), 500);
    return () => clearTimeout(t);
  }, [pia]);

  const setOverride = (kind: Kind, key: string, val: string | null) => {
    const field = kind === "ropa" ? "ropaOverrides" : "npcOverrides";
    const obj = { ...(pia[field] || {}) };
    if (val == null) delete obj[key]; else obj[key] = val;
    setPia({ ...pia, [field]: obj });
  };

  const exportCSV = (kind: Kind) => {
    const fields = kind === "ropa" ? ROPA_FIELDS : NPC_FIELDS;
    const include = kind === "ropa" ? includeRopa : includeNpc;
    const rows = fields.filter(f => include[f.key]).map(f => ({ label: f.label, value: resolveValue(pia, f.key, kind) }));
    const csv = `Field,Value\n${toCSV(rows)}\n\n# Traceability\nEngagement,${pia.engagementId}\nPIA,${pia.id}\nDPS,${pia.phase2.dpsName}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${kind.toUpperCase()}_${pia.title.replace(/\s+/g, "_")}.csv`;
    a.click();
    toast.success(`${kind.toUpperCase()} exported`);
  };

  const exportJSON = (kind: Kind) => {
    const fields = kind === "ropa" ? ROPA_FIELDS : NPC_FIELDS;
    const include = kind === "ropa" ? includeRopa : includeNpc;
    const data = {
      kind, engagement: pia.engagementId, pia: pia.id, dps: pia.phase2.dpsName,
      generated: new Date().toISOString(),
      fields: fields.filter(f => include[f.key]).map(f => ({ key: f.key, label: f.label, value: resolveValue(pia, f.key, kind) })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${kind.toUpperCase()}_${pia.title.replace(/\s+/g, "_")}.json`;
    a.click();
  };

  return (
    <>
      <PageHeader
        title={`${pia.title} — ROPA / NPC-RS`}
        description={`Generated from Phase 2 data. Engagement ${pia.engagementId} · PIA ${pia.id}`}
      />
      <Tabs defaultValue="ropa">
        <TabsList>
          <TabsTrigger value="ropa">ROPA</TabsTrigger>
          <TabsTrigger value="npc">NPC-RS</TabsTrigger>
        </TabsList>
        <TabsContent value="ropa">
          <FieldTable
            kind="ropa" pia={pia} fields={ROPA_FIELDS}
            include={includeRopa} setInclude={setIncludeRopa}
            setOverride={setOverride} onExport={exportCSV} onExportJson={exportJSON}
          />
        </TabsContent>
        <TabsContent value="npc">
          <FieldTable
            kind="npc" pia={pia} fields={NPC_FIELDS}
            include={includeNpc} setInclude={setIncludeNpc}
            setOverride={setOverride} onExport={exportCSV} onExportJson={exportJSON}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function FieldTable({
  kind, pia, fields, include, setInclude, setOverride, onExport, onExportJson,
}: {
  kind: Kind;
  pia: Pia;
  fields: FieldDef[];
  include: Record<string, boolean>;
  setInclude: (v: Record<string, boolean>) => void;
  setOverride: (kind: Kind, key: string, val: string | null) => void;
  onExport: (kind: Kind) => void;
  onExportJson: (kind: Kind) => void;
}) {
  const overrides = kind === "ropa" ? pia.ropaOverrides || {} : pia.npcOverrides || {};
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-2.5 border-b bg-accent/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{kind === "ropa" ? "ROPA Output Fields" : "NPC-RS Output Fields"}</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onExportJson(kind)}>
              <Download className="h-3.5 w-3.5 mr-1" />JSON
            </Button>
            <Button size="sm" onClick={() => onExport(kind)}>
              <Download className="h-3.5 w-3.5 mr-1" />Export CSV
            </Button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 w-12 text-left">Incl.</th>
              <th className="px-3 py-2 w-1/3 text-left">Field</th>
              <th className="px-3 py-2 text-left">Value</th>
              <th className="px-3 py-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map(f => {
              const isOverridden = overrides[f.key] != null;
              const value = resolveValue(pia, f.key, kind);
              return (
                <tr key={f.key} className="border-b last:border-0 align-top">
                  <td className="px-3 py-2">
                    <Checkbox checked={!!include[f.key]} onCheckedChange={(b) => setInclude({ ...include, [f.key]: !!b })} />
                  </td>
                  <td className="px-3 py-2 text-xs font-medium">{f.label}</td>
                  <td className="px-3 py-2">
                    <Textarea
                      value={value}
                      onChange={(e) => setOverride(kind, f.key, e.target.value)}
                      className={`min-h-[40px] text-xs ${isOverridden ? "border-accent" : ""}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {isOverridden && (
                      <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setOverride(kind, f.key, null)}>
                        <RotateCcw className="h-3 w-3 mr-1" />Reset
                      </Button>
                    )}
                    {!isOverridden && <span className="text-[10px] text-muted-foreground">From Phase 2</span>}
                    {/* eslint-disable-next-line @typescript-eslint/no-unused-expressions */}
                    {void deriveFieldValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

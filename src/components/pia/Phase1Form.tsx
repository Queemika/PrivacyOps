import { useEffect } from "react";
import { Phase1, Phase1Desc } from "@/lib/pia/schema";
import { THRESHOLD_QUESTIONS, PHASE1_TOOLTIPS, DATA_COLLECTION_OPTIONS, DATA_STORAGE_OPTIONS, DATA_DISPOSAL_OPTIONS, INTEGRATION_OPTIONS, RECORD_VOLUME_OPTIONS } from "@/lib/pia/templates";
import { isPiaRequired } from "@/lib/pia/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Plus, Trash2, Lock } from "lucide-react";
import { ensureAutoDrl } from "@/lib/pia/drlAutoTrigger";

export function Phase1Form({ value, onChange, phase1OnlyMode, piaId, dpsName }: { value: Phase1; onChange: (next: Phase1) => void; phase1OnlyMode?: boolean; piaId?: string; dpsName?: string }) {
  const set = <K extends keyof Phase1>(k: K, v: Phase1[K]) => onChange({ ...value, [k]: v });
  const setDesc = (patch: Partial<Phase1Desc>) => onChange({ ...value, desc: { ...value.desc, ...patch } });
  const required = isPiaRequired(value);

  // Auto-trigger System Design / TOR DRL item once context becomes meaningful.
  useEffect(() => {
    if (!piaId) return;
    const hasContext =
      !!value.desc.supportingDocs?.trim() ||
      !!value.desc.systemFunction?.trim() ||
      value.threshold?.T6?.yn === "Yes" ||
      value.threshold?.T10?.yn === "Yes";
    if (hasContext) {
      ensureAutoDrl(piaId, "SystemDesignDoc", { dpsName, sourceField: "Phase 1 — Project Context", silent: true });
    }
  }, [piaId, dpsName, value.desc.supportingDocs, value.desc.systemFunction, value.threshold?.T6?.yn, value.threshold?.T10?.yn]);

  return (
    <div className="space-y-6">
      {!phase1OnlyMode && (
        <SectionCard title="Project / System Description">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="System Type" tip={PHASE1_TOOLTIPS.systemType}>
              <Input value={value.desc.systemType} onChange={(e) => setDesc({ systemType: e.target.value })} className="h-9" placeholder="e.g., HR System, Booking Platform" />
            </FormField>
            <FormField label="System Function" tip={PHASE1_TOOLTIPS.systemFunction}>
              <Input value={value.desc.systemFunction} onChange={(e) => setDesc({ systemFunction: e.target.value })} className="h-9" placeholder="e.g., manages employee records" />
            </FormField>
            <FormField label="Organization / Scope" tip={PHASE1_TOOLTIPS.organizationScope}>
              <Input value={value.desc.organizationScope} onChange={(e) => setDesc({ organizationScope: e.target.value })} className="h-9" placeholder="Business unit, department, or org" />
            </FormField>
            <FormField label="Key Processes" tip={PHASE1_TOOLTIPS.keyProcesses}>
              <Textarea value={value.desc.keyProcesses} onChange={(e) => setDesc({ keyProcesses: e.target.value })} className="min-h-[60px] text-sm" placeholder="Lifecycle activities" />
            </FormField>
            <FormField label="Data Collection" tip={PHASE1_TOOLTIPS.dataCollection} full>
              <MultiCheck options={DATA_COLLECTION_OPTIONS} values={value.desc.dataCollection} onChange={(v) => setDesc({ dataCollection: v })} />
              <Input value={value.desc.dataCollectionNote} onChange={(e) => setDesc({ dataCollectionNote: e.target.value })} className="h-9 mt-2" placeholder="Additional sources / methods" />
            </FormField>
            <FormField label="Data Usage" tip={PHASE1_TOOLTIPS.dataUsage} full>
              <Textarea value={value.desc.dataUsage} onChange={(e) => setDesc({ dataUsage: e.target.value })} className="min-h-[60px] text-sm" />
            </FormField>
            <FormField label="Data Storage" tip={PHASE1_TOOLTIPS.dataStorage} full>
              <MultiCheck options={DATA_STORAGE_OPTIONS} values={value.desc.dataStorage} onChange={(v) => setDesc({ dataStorage: v })} />
              <Input value={value.desc.dataStorageNote} onChange={(e) => setDesc({ dataStorageNote: e.target.value })} className="h-9 mt-2" placeholder="Specific systems, databases, locations" />
            </FormField>
            <FormField label="Data Disposal" tip={PHASE1_TOOLTIPS.dataDisposal}>
              <Select value={value.desc.dataDisposal} onValueChange={(v) => setDesc({ dataDisposal: v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select disposal method" /></SelectTrigger>
                <SelectContent>{DATA_DISPOSAL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={value.desc.dataDisposalNote} onChange={(e) => setDesc({ dataDisposalNote: e.target.value })} className="h-9 mt-2" placeholder="Notes" />
            </FormField>
            <FormField label="Integration" tip={PHASE1_TOOLTIPS.integration}>
              <MultiCheck options={INTEGRATION_OPTIONS} values={value.desc.integration} onChange={(v) => setDesc({ integration: v })} />
              <Input value={value.desc.integrationNote} onChange={(e) => setDesc({ integrationNote: e.target.value })} className="h-9 mt-2" placeholder="Other integrations" />
            </FormField>
            <FormField label="Supporting Documents" tip={PHASE1_TOOLTIPS.supportingDocs} full>
              <Input value={value.desc.supportingDocs} onChange={(e) => setDesc({ supportingDocs: e.target.value })} className="h-9" placeholder="Reference document names or upload links" />
            </FormField>
            <FormField label="Purpose" tip={PHASE1_TOOLTIPS.purpose} full>
              <Textarea value={value.desc.purpose} onChange={(e) => setDesc({ purpose: e.target.value })} className="min-h-[60px] text-sm" placeholder="Objective of processing personal data" />
            </FormField>
            <FormField label="PIA Scope" tip={PHASE1_TOOLTIPS.piaScope} full>
              <Textarea value={value.desc.piaScope} onChange={(e) => setDesc({ piaScope: e.target.value })} className="min-h-[60px] text-sm" />
            </FormField>
            <FormField label="Out of Scope" tip={PHASE1_TOOLTIPS.outOfScope} full>
              <Textarea value={value.desc.outOfScope} onChange={(e) => setDesc({ outOfScope: e.target.value })} className="min-h-[60px] text-sm" />
            </FormField>
          </div>
        </SectionCard>
      )}

      {/* Threshold Analysis */}
      <SectionCard title="Threshold Analysis">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 w-10 text-left">No.</th>
              <th className="px-3 py-2 text-left">Question</th>
              <th className="px-3 py-2 w-28 text-left">Yes / No</th>
              <th className="px-3 py-2 w-1/3 text-left">Response</th>
            </tr>
          </thead>
          <tbody>
            {THRESHOLD_QUESTIONS.map((q, i) => {
              const a = value.threshold[q.id] || { yn: "", response: "" };
              const isT5 = q.id === "T5";
              const showT5Dropdown = isT5 && a.yn === "Yes";
              return (
                <tr key={q.id} className="border-b last:border-0">
                  <td className="px-3 py-2 align-top text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2 align-top">{q.q}</td>
                  <td className="px-3 py-2 align-top">
                    <Select
                      value={a.yn || ""}
                      onValueChange={(v) => set("threshold", { ...value.threshold, [q.id]: { ...a, yn: v as "Yes" | "No" } })}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {showT5Dropdown ? (
                      <Select
                        value={a.response}
                        onValueChange={(v) => set("threshold", { ...value.threshold, [q.id]: { ...a, response: v } })}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select volume" /></SelectTrigger>
                        <SelectContent>
                          {RECORD_VOLUME_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Textarea
                        value={a.response}
                        onChange={(e) => set("threshold", { ...value.threshold, [q.id]: { ...a, response: e.target.value } })}
                        className="min-h-[40px] text-xs"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 px-3 py-2 rounded-md border bg-muted/30 text-sm flex items-center justify-between">
          <span className="font-medium">IS PIA REQUIRED?</span>
          <span className={
            "status-chip " + (
              required === "Yes" ? "bg-destructive/10 text-destructive border-destructive/30"
              : required === "No" ? "bg-success/10 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border"
            )
          }>
            {required === "Yes" ? "PIA Required" : required === "No" ? "PIA Not Required - Proceed to Sign-Off" : "Pending answers"}
          </span>
        </div>
      </SectionCard>

      {!phase1OnlyMode && (
        <SectionCard title="Stakeholder(s) Engagement">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Name / Position</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Involvement</th>
                <th className="px-3 py-2 text-left">Inputs / Recommendations</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {value.stakeholders.map((s, i) => (
                <tr key={s.id} className="border-b last:border-0">
                  {(["name", "role", "involvement", "inputs"] as const).map((field) => (
                    <td key={field} className="px-2 py-1.5">
                      <Input
                        value={s[field]}
                        onChange={(e) => {
                          const next = [...value.stakeholders];
                          next[i] = { ...s, [field]: e.target.value };
                          set("stakeholders", next);
                        }}
                        className="h-8 text-xs"
                        readOnly={!!s.locked && (field === "name" || field === "role")}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    {s.locked ? (
                      <span className="inline-flex items-center text-muted-foreground" title="Default stakeholder (cannot remove)">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => set("stakeholders", value.stakeholders.filter(x => x.id !== s.id))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            size="sm" variant="outline" className="mt-3"
            onClick={() => set("stakeholders", [...value.stakeholders, { id: `S-${Date.now()}`, name: "", role: "", involvement: "", inputs: "" }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add stakeholder
          </Button>
        </SectionCard>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-2.5 border-b bg-accent/5">
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function FormField({ label, tip, children, full }: { label: string; tip?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {tip && (
          <Tooltip>
            <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground/60 cursor-help" /></TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{tip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

function MultiCheck({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => {
    if (values.includes(o)) onChange(values.filter(x => x !== o));
    else onChange([...values, o]);
  };
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {options.map(o => (
        <label key={o} className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox checked={values.includes(o)} onCheckedChange={() => toggle(o)} />
          {o}
        </label>
      ))}
    </div>
  );
}

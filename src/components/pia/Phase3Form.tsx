import { Phase3, ChecklistAnswer, MitigationRow, RiskRating } from "@/lib/pia/schema";
import { ChecklistRow, ChecklistHeader } from "./ChecklistRow";
import {
  PRINCIPLES_SEED, RIGHTS_SEED, ORG_SECURITY_SEED, PHY_SECURITY_SEED, TECH_SECURITY_SEED, CROSS_BORDER_SEED,
  ChecklistSeed,
} from "@/lib/pia/templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { RATING_CLASS } from "@/lib/pia/risk";

interface Phase3FormProps {
  value: Phase3;
  onChange: (next: Phase3) => void;
  piaId?: string;
  dpsName?: string;
}

export function Phase3Form({ value, onChange, piaId, dpsName }: Phase3FormProps) {
  const set = <K extends keyof Phase3>(k: K, v: Phase3[K]) => onChange({ ...value, [k]: v });

  const renderGroup = (
    title: string,
    seeds: ChecklistSeed[],
    answers: Record<string, ChecklistAnswer>,
    onAnswers: (next: Record<string, ChecklistAnswer>) => void,
  ) => {
    // Group seeds by section heading
    const bySection = seeds.reduce<Record<string, ChecklistSeed[]>>((acc, s) => {
      (acc[s.section] ||= []).push(s); return acc;
    }, {});
    return (
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-2.5 border-b bg-accent/5"><h3 className="text-sm font-semibold">{title}</h3></div>
          <div>
            {Object.entries(bySection).map(([sec, list]) => (
              <div key={sec}>
                <div className="px-3 py-2 bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{sec}</div>
                <ChecklistHeader />
                {list.map((seed, i) => (
                  <ChecklistRow
                    key={seed.id}
                    seed={seed}
                    index={i}
                    answer={answers[seed.id]}
                    onChange={(next) => onAnswers({ ...answers, [seed.id]: next })}
                    piaId={piaId}
                    dpsName={dpsName}
                    phaseLabel="Phase 3"
                    sectionLabel={title}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="space-y-6">
      {renderGroup("General Data Privacy Principles", PRINCIPLES_SEED, value.principles, (v) => set("principles", v))}
      {renderGroup("Data Subject Rights", RIGHTS_SEED, value.rights, (v) => set("rights", v))}
      {renderGroup("Organizational Security", ORG_SECURITY_SEED, value.organizational, (v) => set("organizational", v))}
      {renderGroup("Physical Security", PHY_SECURITY_SEED, value.physical, (v) => set("physical", v))}
      {renderGroup("Technical Security", TECH_SECURITY_SEED, value.technical, (v) => set("technical", v))}

      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-2.5 border-b bg-accent/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Cross-border Data Flows <span className="text-xs text-muted-foreground font-normal">(Optional)</span></h3>
            <label className="flex items-center gap-2 text-xs">
              <span>Enable</span>
              <Switch checked={value.crossBorderEnabled} onCheckedChange={(b) => set("crossBorderEnabled", b)} />
            </label>
          </div>
          {value.crossBorderEnabled && (
            <div>
              <ChecklistHeader />
              {CROSS_BORDER_SEED.map((seed, i) => (
                <ChecklistRow
                  key={seed.id} seed={seed} index={i}
                  answer={value.crossBorder[seed.id]}
                  onChange={(next) => set("crossBorder", { ...value.crossBorder, [seed.id]: next })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MitigationTable value={value.mitigation} onChange={(rows) => set("mitigation", rows)} />
    </div>
  );
}

function MitigationTable({ value, onChange }: { value: MitigationRow[]; onChange: (rows: MitigationRow[]) => void }) {
  const ratingOpts: RiskRating[] = ["Low", "Medium", "High", "Critical"];
  const update = (i: number, patch: Partial<MitigationRow>) => {
    const next = [...value]; next[i] = { ...value[i], ...patch }; onChange(next);
  };
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-2.5 border-b bg-accent/5"><h3 className="text-sm font-semibold">Risk Mitigation</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1400px]">
            <thead className="text-[10px] text-muted-foreground bg-muted/40 border-b uppercase tracking-wide">
              <tr>
                {["Observation", "Risk", "Inherent", "Treatment", "Mitigation Measure", "Status", "Residual", "Control Ref", "Start", "Completion", "Review Freq.", "Owner", ""].map(h => (
                  <th key={h} className="px-2 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.map((r, i) => (
                <tr key={r.id} className="border-b last:border-0 align-top">
                  <td className="px-1 py-1"><Input value={r.observation} onChange={(e) => update(i, { observation: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1"><Input value={r.risk} onChange={(e) => update(i, { risk: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1">
                    <Select value={r.inherentRisk || ""} onValueChange={(v) => update(i, { inherentRisk: v as RiskRating })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{ratingOpts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                    {r.inherentRisk && <span className={`mt-1 inline-block status-chip text-[9px] ${RATING_CLASS[r.inherentRisk]}`}>{r.inherentRisk}</span>}
                  </td>
                  <td className="px-1 py-1"><Input value={r.treatment} onChange={(e) => update(i, { treatment: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1"><Input value={r.measure} onChange={(e) => update(i, { measure: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1"><Input value={r.status} onChange={(e) => update(i, { status: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1">
                    <Select value={r.residual || ""} onValueChange={(v) => update(i, { residual: v as RiskRating })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{ratingOpts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-1 py-1"><Input value={r.controlRef} onChange={(e) => update(i, { controlRef: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1"><Input type="date" value={r.startDate} onChange={(e) => update(i, { startDate: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1"><Input type="date" value={r.completionDate} onChange={(e) => update(i, { completionDate: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1"><Input value={r.reviewFreq} onChange={(e) => update(i, { reviewFreq: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1"><Input value={r.owner} onChange={(e) => update(i, { owner: e.target.value })} className="h-8 text-xs" /></td>
                  <td className="px-1 py-1">
                    <Button size="icon" variant="ghost" onClick={() => onChange(value.filter(x => x.id !== r.id))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3">
          <Button size="sm" variant="outline" onClick={() => onChange([...value, {
            id: `M-${Date.now()}`, observation: "", risk: "", inherentRisk: "", treatment: "", measure: "",
            status: "Open", residual: "", controlRef: "", startDate: "", completionDate: "", reviewFreq: "", owner: "",
          }])}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add mitigation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

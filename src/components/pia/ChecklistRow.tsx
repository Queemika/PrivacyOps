import { ChecklistAnswer } from "@/lib/pia/schema";
import { computeRating, RATING_CLASS, IMPACT_DESCRIPTIONS, PROBABILITY_DESCRIPTIONS } from "@/lib/pia/risk";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sparkles, Link2 } from "lucide-react";
import { ChecklistSeed } from "@/lib/pia/templates";
import { addRow as addDrlRow } from "@/lib/drl/store";
import { toast } from "sonner";
import { getAnswerOptions, validateResponse } from "@/lib/pia/answerConfig";
import { triggerForChecklistAnswer } from "@/lib/pia/drlAutoTrigger";

interface ChecklistRowProps {
  seed: ChecklistSeed;
  answer: ChecklistAnswer;
  onChange: (next: ChecklistAnswer) => void;
  index: number;
  piaId?: string;
  dpsName?: string;
  phaseLabel?: string;
  sectionLabel?: string;
}

export function ChecklistRow({
  seed, answer, onChange, index, piaId, dpsName, phaseLabel, sectionLabel,
}: ChecklistRowProps) {
  const set = (patch: Partial<ChecklistAnswer>) => {
    const merged = { ...answer, ...patch } as ChecklistAnswer;
    merged.rating = computeRating(merged.impact, merged.probability);
    onChange(merged);
  };

  const handleYnChange = (v: string) => {
    const next = { ...answer, yn: v as ChecklistAnswer["yn"] } as ChecklistAnswer;
    if (v === "No") {
      // Risk trigger — hydrate from seed defaults if currently empty.
      if (next.impact == null && seed.defaultImpact != null) next.impact = seed.defaultImpact;
      if (next.probability == null && seed.defaultProbability != null) next.probability = seed.defaultProbability;
    } else {
      // Clear risk fields when not a risk-triggering answer.
      next.impact = null;
      next.probability = null;
    }
    next.rating = computeRating(next.impact, next.probability);
    onChange(next);
    triggerForChecklistAnswer(seed.id, v, { piaId, dpsName, sectionLabel });
  };

  const handleAddToDrl = () => {
    const row = addDrlRow("pia", {
      fields: {
        piaId: piaId || "",
        dpsName: dpsName || "",
        phase: phaseLabel || "Phase 3",
        field: `${sectionLabel || ""} / ${seed.id}`,
        request: seed.question,
      },
      remarks: answer.response || "",
    });
    toast.success(`Added to DRL — ${row.id.slice(-4)}`);
  };

  const answerOptions = getAnswerOptions(sectionLabel);
  const showRisk = answer.yn === "No";
  const validation = validateResponse(answer.yn, answer.response, sectionLabel);

  return (
    <div className="grid grid-cols-12 gap-3 px-3 py-3 border-b last:border-0 text-xs">
      <div className="col-span-1 text-muted-foreground tabular-nums">{index + 1}</div>
      <div className="col-span-3 space-y-2">
        <div className="text-foreground">{seed.question}</div>
        {seed.subItems && (
          <div className="space-y-1.5 pl-1">
            {seed.subItems.map(si => (
              <label key={si.key} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <Checkbox
                  checked={!!answer.checks?.[si.key]}
                  onCheckedChange={(v) => set({ checks: { ...(answer.checks || {}), [si.key]: !!v } })}
                />
                <span><span className="font-medium text-foreground">{si.key}.</span> {si.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="col-span-1">
        <Select value={answer.yn} onValueChange={handleYnChange}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            {answerOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Textarea
          value={answer.response}
          onChange={(e) => set({ response: e.target.value })}
          className={`text-xs min-h-[60px] ${!validation.ok ? "border-destructive" : ""}`}
          placeholder="Response"
        />
        {!validation.ok && (
          <p className="text-[10px] text-destructive mt-1">{validation.message}</p>
        )}
      </div>
      <div className="col-span-1 text-[11px] text-muted-foreground whitespace-pre-wrap">{answer.legalBasis}</div>
      <div className="col-span-1">
        {showRisk ? (
          <NumberPicker value={answer.impact} onChange={(n) => set({ impact: n })} descriptions={IMPACT_DESCRIPTIONS} />
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </div>
      <div className="col-span-1">
        {showRisk ? (
          <NumberPicker value={answer.probability} onChange={(n) => set({ probability: n })} descriptions={PROBABILITY_DESCRIPTIONS} />
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </div>
      <div className="col-span-1">
        {showRisk ? (
          <span className={`status-chip text-[10px] ${RATING_CLASS[answer.rating]}`}>{answer.rating || "—"}</span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </div>
      <div className="col-span-1 flex flex-col gap-1">
        <Button size="sm" variant="outline" className="h-7 text-[10px] px-1.5 justify-start" onClick={handleAddToDrl}>
          <Link2 className="h-3 w-3 mr-1" />Add to DRL
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px] px-1.5 justify-start">
          <Sparkles className="h-3 w-3 mr-1" />AI Assist
        </Button>
      </div>
    </div>
  );
}

function NumberPicker({ value, onChange, descriptions }: { value: number | null; onChange: (n: number | null) => void; descriptions: Record<number, { label: string; desc: string }> }) {
  return (
    <Select value={value == null ? "" : String(value)} onValueChange={(v) => onChange(v === "" ? null : Number(v))}>
      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>
        {[1, 2, 3, 4].map(n => (
          <Tooltip key={n}>
            <TooltipTrigger asChild>
              <SelectItem value={String(n)}>{n} — {descriptions[n].label}</SelectItem>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[260px] text-xs">{descriptions[n].desc}</TooltipContent>
          </Tooltip>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ChecklistHeader() {
  return (
    <div className="grid grid-cols-12 gap-3 px-3 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
      <div className="col-span-1">No.</div>
      <div className="col-span-3">Questions</div>
      <div className="col-span-1">Answer</div>
      <div className="col-span-2">Response</div>
      <div className="col-span-1">Legal Basis</div>
      <div className="col-span-1">Impact</div>
      <div className="col-span-1">Probability</div>
      <div className="col-span-1">Rating</div>
      <div className="col-span-1 text-right pr-1">Actions</div>
    </div>
  );
}

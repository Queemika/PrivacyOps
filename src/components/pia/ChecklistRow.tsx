import { ChecklistAnswer } from "@/lib/pia/schema";
import { computeRating, RATING_CLASS, IMPACT_DESCRIPTIONS, PROBABILITY_DESCRIPTIONS } from "@/lib/pia/risk";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChecklistSeed } from "@/lib/pia/templates";

export function ChecklistRow({
  seed, answer, onChange, index,
}: {
  seed: ChecklistSeed;
  answer: ChecklistAnswer;
  onChange: (next: ChecklistAnswer) => void;
  index: number;
}) {
  const set = (patch: Partial<ChecklistAnswer>) => {
    const merged = { ...answer, ...patch } as ChecklistAnswer;
    merged.rating = computeRating(merged.impact, merged.probability);
    onChange(merged);
  };

  return (
    <div className="grid grid-cols-12 gap-3 px-3 py-3 border-b last:border-0 text-xs">
      <div className="col-span-1 text-muted-foreground tabular-nums">{index + 1}</div>
      <div className="col-span-4 space-y-2">
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
        <Select value={answer.yn} onValueChange={(v) => set({ yn: v as ChecklistAnswer["yn"] })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="N/A">N/A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Textarea value={answer.response} onChange={(e) => set({ response: e.target.value })} className="text-xs min-h-[60px]" placeholder="Response" />
      </div>
      <div className="col-span-1 text-[11px] text-muted-foreground whitespace-pre-wrap">{answer.legalBasis}</div>
      <div className="col-span-1">
        <NumberPicker value={answer.impact} onChange={(n) => set({ impact: n })} />
      </div>
      <div className="col-span-1">
        <NumberPicker value={answer.probability} onChange={(n) => set({ probability: n })} />
      </div>
      <div className="col-span-1">
        <span className={`status-chip text-[10px] ${RATING_CLASS[answer.rating]}`}>{answer.rating || "—"}</span>
      </div>
    </div>
  );
}

function NumberPicker({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  return (
    <Select value={value == null ? "" : String(value)} onValueChange={(v) => onChange(v === "" ? null : Number(v))}>
      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>
        {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function ChecklistHeader() {
  return (
    <div className="grid grid-cols-12 gap-3 px-3 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
      <div className="col-span-1">No.</div>
      <div className="col-span-4">Questions</div>
      <div className="col-span-1">Yes/No/N/A</div>
      <div className="col-span-2">Response</div>
      <div className="col-span-1">Legal Basis</div>
      <div className="col-span-1">Impact</div>
      <div className="col-span-1">Probability</div>
      <div className="col-span-1">Rating</div>
    </div>
  );
}

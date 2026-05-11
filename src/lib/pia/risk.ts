import type { RiskRating } from "./schema";

// 4x4 Privacy Risk Map (Impact x Probability).
// Score buckets per firm template: Low 1-3, Medium 4-6, High 8-9, Critical 12-16.
export function computeRating(impact: number | null, probability: number | null): RiskRating {
  if (impact == null || probability == null) return "";
  const s = impact * probability;
  if (s <= 3) return "Low";
  if (s <= 6) return "Medium";
  if (s <= 9) return "High";
  return "Critical";
}

export const RATING_CLASS: Record<RiskRating, string> = {
  "": "bg-muted text-muted-foreground border-border",
  Low: "bg-success/10 text-success border-success/30",
  Medium: "bg-warning/10 text-warning border-warning/30",
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Critical: "bg-destructive text-destructive-foreground border-destructive",
};

export const IMPACT_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: "Negligible", desc: "Data subjects either not affected or experience minor inconveniences they can easily manage." },
  2: { label: "Limited", desc: "Data subjects may face major inconveniences but can still manage to overcome them with some difficulty." },
  3: { label: "Significant", desc: "Data subjects may face major inconveniences that they might overcome, but it will be very difficult." },
  4: { label: "Maximum", desc: "Data subjects may face serious or even irreversible consequences they might not be able to overcome." },
};

export const PROBABILITY_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: "Unlikely", desc: "Rare chance; not expected but possible." },
  2: { label: "Possible", desc: "Could happen sometimes." },
  3: { label: "Likely", desc: "Happens regularly or often." },
  4: { label: "Almost Certain", desc: "Expected to happen in most cases." },
};

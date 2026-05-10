import type { RiskRating } from "./schema";

// 5x5 inherent risk matrix.
// Score = impact × probability. Buckets: Low ≤6, Medium 7–12, High 13–19, Critical ≥20.
export function computeRating(impact: number | null, probability: number | null): RiskRating {
  if (impact == null || probability == null) return "";
  const s = impact * probability;
  if (s <= 6) return "Low";
  if (s <= 12) return "Medium";
  if (s <= 19) return "High";
  return "Critical";
}

export const RATING_CLASS: Record<RiskRating, string> = {
  "": "bg-muted text-muted-foreground border-border",
  Low: "bg-success/10 text-success border-success/30",
  Medium: "bg-warning/10 text-warning border-warning/30",
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Critical: "bg-destructive text-destructive-foreground border-destructive",
};

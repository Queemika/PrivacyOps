import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "blue" | "green" | "amber" | "violet" | "rose" | "teal";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  delta?: string;
  icon?: LucideIcon;
  accent?: Accent;
  className?: string;
}

const tones: Record<Accent, { bg: string; fg: string }> = {
  blue:   { bg: "bg-[hsl(var(--tile-blue-bg))]",   fg: "text-[hsl(var(--tile-blue-fg))]" },
  green:  { bg: "bg-[hsl(var(--tile-green-bg))]",  fg: "text-[hsl(var(--tile-green-fg))]" },
  amber:  { bg: "bg-[hsl(var(--tile-amber-bg))]",  fg: "text-[hsl(var(--tile-amber-fg))]" },
  violet: { bg: "bg-[hsl(var(--tile-violet-bg))]", fg: "text-[hsl(var(--tile-violet-fg))]" },
  rose:   { bg: "bg-[hsl(var(--tile-rose-bg))]",   fg: "text-[hsl(var(--tile-rose-fg))]" },
  teal:   { bg: "bg-[hsl(var(--tile-teal-bg))]",   fg: "text-[hsl(var(--tile-teal-fg))]" },
};

export function StatTile({ label, value, hint, delta, icon: Icon, accent = "blue", className }: Props) {
  const t = tones[accent];
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">{value}</div>
          {(hint || delta) && (
            <div className="mt-1 flex items-center gap-2 text-xs">
              {delta && <span className={cn("font-medium", t.fg)}>{delta}</span>}
              {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", t.bg, t.fg)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

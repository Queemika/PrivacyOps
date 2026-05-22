import { cn } from "@/lib/utils";

export interface SectionTab {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: SectionTab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SectionTabs({ tabs, value, onChange, className }: Props) {
  return (
    <div className={cn("border-b border-border flex items-center gap-1 overflow-x-auto", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          data-active={value === t.id}
          className="tab-underline whitespace-nowrap"
        >
          {t.label}
          {typeof t.count === "number" && (
            <span className="text-[10px] px-1.5 h-4 rounded-full bg-muted text-muted-foreground">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

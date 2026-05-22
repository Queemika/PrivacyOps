import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface Props {
  values: string[];
  active: Set<string>;
  onChange: (next: Set<string>) => void;
}

export function ColumnFilter({ values, active, onChange }: Props) {
  const [q, setQ] = useState("");
  const unique = useMemo(() => {
    const seen = new Set<string>();
    for (const v of values) seen.add(v || "(empty)");
    return [...seen].sort();
  }, [values]);
  const filtered = unique.filter(v => v.toLowerCase().includes(q.toLowerCase()));

  const toggle = (v: string) => {
    const next = new Set(active);
    if (next.has(v)) next.delete(v); else next.add(v);
    onChange(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`ml-1 inline-flex items-center justify-center h-4 w-4 rounded hover:bg-accent/20 ${active.size ? "text-accent" : "text-muted-foreground/60"}`}
          title="Filter"
        >
          <Filter className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-7 text-xs mb-2" />
        <div className="max-h-56 overflow-auto space-y-1">
          {filtered.map(v => (
            <label key={v} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/40 px-1 rounded">
              <Checkbox checked={active.has(v)} onCheckedChange={() => toggle(v)} />
              <span className="truncate">{v}</span>
            </label>
          ))}
          {filtered.length === 0 && <div className="text-xs text-muted-foreground p-2">No values</div>}
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t">
          <span className="text-[10px] text-muted-foreground">{active.size} selected</span>
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => onChange(new Set())}>Clear</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

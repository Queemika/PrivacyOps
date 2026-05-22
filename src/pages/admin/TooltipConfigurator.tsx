import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultTooltips, loadTooltipOverrides, saveTooltipOverrides } from "@/lib/tooltipStore";
import { toast } from "sonner";

export default function TooltipConfigurator() {
  const isAdmin = (localStorage.getItem("pa_role") || "user") === "admin";
  const [overrides, setOverrides] = useState<Record<string, string>>(loadTooltipOverrides());

  if (!isAdmin) {
    return (
      <PageShell title="Tooltip Configurator">
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Admin role required. Update your role in Settings.</CardContent></Card>
      </PageShell>
    );
  }

  const set = (k: string, v: string) => setOverrides((o) => ({ ...o, [k]: v }));
  const save = () => { saveTooltipOverrides(overrides); toast.success("Tooltips saved"); };
  const reset = (k: string) => { const c = { ...overrides }; delete c[k]; setOverrides(c); };

  return (
    <PageShell
      title="Tooltip Configurator"
      subtitle="Edit the hover text shown for PIA Phase 1 / 2 / 3 fields."
      actions={<Button onClick={save}>Save all</Button>}
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          {Object.entries(defaultTooltips).map(([k, def]) => (
            <div key={k} className="grid md:grid-cols-[200px_1fr_auto] items-start gap-3 pb-3 border-b last:border-0">
              <Label className="font-mono text-xs pt-2">{k}</Label>
              <div className="space-y-1">
                <Input
                  value={overrides[k] ?? def}
                  onChange={(e) => set(k, e.target.value)}
                  className="text-sm"
                />
                {overrides[k] !== undefined && overrides[k] !== def && (
                  <div className="text-[10px] text-muted-foreground">Default: {def}</div>
                )}
              </div>
              {overrides[k] !== undefined && (
                <Button variant="ghost" size="sm" onClick={() => reset(k)}>Reset</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}

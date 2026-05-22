import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TOOLTIP_REGISTRY, loadAll, saveAll, type TooltipState } from "@/lib/admin/tooltipRegistry";
import { ChevronDown, Save, X, Info } from "lucide-react";
import { toast } from "sonner";

export default function TooltipManager() {
  const isAdmin = (localStorage.getItem("pa_role") || "user") === "admin";
  const [draft, setDraft] = useState<Record<string, TooltipState>>(loadAll());
  const [globallyEnabled, setGloballyEnabled] = useState(localStorage.getItem("pa_tooltips_enabled") !== "false");

  useEffect(() => { setDraft(loadAll()); }, []);

  if (!isAdmin) {
    return <PageShell title="Tooltip Manager"><Card><CardContent className="p-6 text-sm text-muted-foreground">Admin role required.</CardContent></Card></PageShell>;
  }

  // Group by module
  const grouped = useMemo(() => {
    const m: Record<string, typeof TOOLTIP_REGISTRY> = {};
    for (const t of TOOLTIP_REGISTRY) (m[t.module] ||= []).push(t);
    return m;
  }, []);

  const get = (key: string): TooltipState => {
    const def = TOOLTIP_REGISTRY.find(t => t.key === key)!;
    return draft[key] ?? { enabled: true, text: def.defaultText };
  };

  const set = (key: string, patch: Partial<TooltipState>) => {
    const cur = get(key);
    setDraft(d => ({ ...d, [key]: { ...cur, ...patch } }));
  };

  const applyAll = () => {
    saveAll(draft);
    localStorage.setItem("pa_tooltips_enabled", String(globallyEnabled));
    window.dispatchEvent(new Event("pa:tooltips-change"));
    toast.success("Tooltips applied across the system");
  };

  const cancelAll = () => { setDraft(loadAll()); toast.message("Reverted unsaved changes"); };

  const resetRow = (key: string) => {
    const next = { ...draft }; delete next[key]; setDraft(next);
  };

  return (
    <PageShell
      title="Tooltip Manager"
      subtitle="Add, edit, or remove (i) tooltips for any field across the system. Changes apply globally on Apply."
      actions={<>
        <Button variant="outline" onClick={cancelAll}><X className="h-4 w-4 mr-1.5" />Cancel</Button>
        <Button onClick={applyAll}><Save className="h-4 w-4 mr-1.5" />Apply</Button>
      </>}
    >
      <Card><CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-accent" />
          <span className="font-medium">Globally enable (i) tooltips</span>
          <span className="text-xs text-muted-foreground ml-2">When off, no tooltips render anywhere.</span>
        </div>
        <Switch checked={globallyEnabled} onCheckedChange={setGloballyEnabled} />
      </CardContent></Card>

      {Object.entries(grouped).map(([mod, items]) => (
        <Collapsible key={mod} defaultOpen>
          <Card>
            <CollapsibleTrigger className="w-full">
              <div className="px-4 py-3 flex items-center justify-between border-b">
                <div className="flex items-center gap-2"><ChevronDown className="h-4 w-4" /><span className="font-semibold text-sm">{mod}</span>
                <span className="text-xs text-muted-foreground">({items.length} fields)</span></div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 border-b text-xs text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 w-28">Screen</th>
                      <th className="text-left px-3 py-2 w-40">Field</th>
                      <th className="text-left px-3 py-2">Tooltip text</th>
                      <th className="text-center px-3 py-2 w-20">(i) shown</th>
                      <th className="px-3 py-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(t => {
                      const cur = get(t.key);
                      const overridden = draft[t.key] !== undefined;
                      return (
                        <tr key={t.key} className="border-b last:border-0 hover:bg-muted/10">
                          <td className="px-3 py-2 text-xs text-muted-foreground">{t.screen}</td>
                          <td className="px-3 py-2 text-xs font-medium">{t.field}</td>
                          <td className="px-3 py-2"><Input value={cur.text} onChange={(e) => set(t.key, { text: e.target.value })} placeholder={t.defaultText} className="h-8 text-xs" /></td>
                          <td className="px-3 py-2 text-center"><Switch checked={cur.enabled} onCheckedChange={(v) => set(t.key, { enabled: v })} /></td>
                          <td className="px-3 py-2 text-right">
                            {overridden && <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => resetRow(t.key)}>Reset</Button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </PageShell>
  );
}

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ModuleProgressCard } from "@/components/progress/ModuleProgressCard";
import { MomEditor } from "@/components/progress/MomEditor";
import { DeckPreview } from "@/components/progress/DeckPreview";
import { getAllModuleProgress, getOverallProgress } from "@/lib/progress/calc";
import { loadConfig, saveConfig, DEFAULT_CONFIG, normalizedWeights, ProgressConfig, ModuleId } from "@/lib/progress/config";
import { buildDeck, DeckOptions } from "@/lib/progress/deck";
import { Printer, RefreshCw, Sparkles, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

const MODULE_LABELS: Record<ModuleId, string> = {
  pia: "PIA", pradar: "PRADAR", tsa: "Tech Security", inspection: "Physical Inspection", manuals: "Manuals",
};

export default function ProgressPage() {
  const [tab, setTab] = useState("dashboard");
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const mods = useMemo(() => getAllModuleProgress(), [tick]);
  const overall = useMemo(() => getOverallProgress(), [tick]);

  return (
    <PageShell
      title="Progress"
      subtitle="Track completion across all privacy workstreams."
      actions={<Button variant="outline" size="sm" onClick={refresh}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="mom">MOM</TabsTrigger>
          <TabsTrigger value="deck">Deck</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Overall progress</div>
                  <div className="text-5xl font-semibold mt-1">{overall}%</div>
                </div>
                <div className="text-xs text-muted-foreground">Weighted across {mods.length} modules</div>
              </div>
              <Progress value={overall} className="h-3" />
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mods.map(m => <ModuleProgressCard key={m.id} m={m} />)}
          </div>
        </TabsContent>

        <TabsContent value="mom" className="mt-4">
          <MomEditor />
        </TabsContent>

        <TabsContent value="deck" className="mt-4">
          <DeckTab />
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <ConfigTab onSaved={refresh} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function DeckTab() {
  const [opts, setOpts] = useState<DeckOptions>({
    includeCover: true, includeModules: true, includeDrl: true,
    includeMom: true, includeDeliverables: true, includeNext: true,
  });
  const [preview, setPreview] = useState(false);
  const deck = useMemo(() => buildDeck(opts), [opts, preview]);

  const toggle = (k: keyof DeckOptions) => setOpts(o => ({ ...o, [k]: !o[k] }));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold">Sections</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {([
              ["includeCover", "Cover"],
              ["includeModules", "Module progress"],
              ["includeDrl", "DRL summary"],
              ["includeMom", "MOM highlights"],
              ["includeDeliverables", "Deliverables"],
              ["includeNext", "Next steps"],
            ] as [keyof DeckOptions, string][]).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" checked={!!opts[k]} onChange={() => toggle(k)} />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPreview(true)}><Sparkles className="h-3 w-3 mr-1" />Generate Preview</Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!preview}>
              <Printer className="h-3 w-3 mr-1" />Print / Save PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      {preview && <DeckPreview deck={deck} />}
    </div>
  );
}

function ConfigTab({ onSaved }: { onSaved: () => void }) {
  const [cfg, setCfg] = useState<ProgressConfig>(loadConfig());
  const norm = normalizedWeights(cfg);

  const save = () => { saveConfig(cfg); toast.success("Config saved"); onSaved(); };
  const reset = () => { setCfg(DEFAULT_CONFIG); saveConfig(DEFAULT_CONFIG); toast.success("Reset to defaults"); onSaved(); };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Module weights</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
              <Button size="sm" onClick={save}><Save className="h-3 w-3 mr-1" />Save</Button>
            </div>
          </div>
          {(Object.keys(cfg.weights) as ModuleId[]).map(id => (
            <div key={id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>{MODULE_LABELS[id]}</Label>
                <span className="text-muted-foreground">
                  {cfg.weights[id]} ({Math.round(norm[id] * 100)}%)
                </span>
              </div>
              <Slider
                value={[cfg.weights[id]]}
                min={0} max={100} step={5}
                onValueChange={([v]) => setCfg({ ...cfg, weights: { ...cfg.weights, [id]: v } })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">Calculation rule per module</h3>
          {(Object.keys(cfg.rules) as ModuleId[]).map(id => (
            <div key={id} className="flex items-center justify-between border-b last:border-0 pb-3">
              <Label className="text-sm">{MODULE_LABELS[id]}</Label>
              <RadioGroup
                value={cfg.rules[id]}
                onValueChange={v => setCfg({ ...cfg, rules: { ...cfg.rules, [id]: v as any } })}
                className="flex gap-4"
              >
                {(["fields", "status", "hybrid"] as const).map(r => (
                  <label key={r} className="flex items-center gap-1 text-sm capitalize">
                    <RadioGroupItem value={r} /> {r}
                  </label>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

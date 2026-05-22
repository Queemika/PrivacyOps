import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { defaultPrivacyManual, ManualSection } from "@/lib/templates/privacyManual";
import { toast } from "sonner";
import { Save, RotateCcw, BookOpen } from "lucide-react";

const KEY = "pa_privacy_manual";
function load(): ManualSection[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v?.length ? v : defaultPrivacyManual; } catch { return defaultPrivacyManual; }
}

export default function ManualsDeliverables() {
  const [sections, setSections] = useState<ManualSection[]>(load());
  const [active, setActive] = useState(sections[0].id);
  const current = sections.find((s) => s.id === active)!;

  const update = (id: string, patch: Partial<ManualSection>) => {
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };
  const save = () => { localStorage.setItem(KEY, JSON.stringify(sections)); toast.success("Privacy manual saved"); };
  const reset = () => { localStorage.removeItem(KEY); setSections(defaultPrivacyManual); toast.success("Reset to template"); };

  return (
    <PageShell
      title="Privacy Manual"
      subtitle="Edit the deliverable manual based on the standard template."
      actions={<>
        <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-1.5" />Reset</Button>
        <Button onClick={save}><Save className="h-4 w-4 mr-1.5" />Save</Button>
      </>}
    >
      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-1 pb-2 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Sections</div>
            <ul className="space-y-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActive(s.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-md text-sm transition-colors ${active === s.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted/50"}`}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Input value={current.title} onChange={(e) => update(current.id, { title: e.target.value })} className="text-lg font-semibold h-12" />
            <Textarea value={current.body} onChange={(e) => update(current.id, { body: e.target.value })} rows={14} className="text-sm leading-relaxed" />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

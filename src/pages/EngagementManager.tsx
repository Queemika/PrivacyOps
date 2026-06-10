import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, ShieldCheck, Plus, Settings2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  loadEngagements, saveEngagements, setActiveEngagementId, createEngagement,
} from "@/lib/pia/store";
import type { Engagement } from "@/lib/pia/schema";
import { getEngagementCodenames, setEngagementCodenames } from "@/lib/engagementSettings";
import { loadDepartments, addDepartment, removeDepartment } from "@/lib/departments/store";
import { toast } from "sonner";

interface DemoMeta {
  sector: string;
  piaCount: number;
  progress: number;
  status: "Active" | "On Hold" | "Closed";
  tint: string; // tailwind classes for icon tile
}

const DEMO: Record<string, DemoMeta> = {
  "City Government of Marikina": { sector: "LGU", piaCount: 8, progress: 72, status: "Active", tint: "bg-blue-100 text-blue-600" },
  "Rural Bank of San Miguel":     { sector: "Banking", piaCount: 5, progress: 45, status: "Active", tint: "bg-purple-100 text-purple-600" },
  "PhilHealth Region III":        { sector: "Government", piaCount: 12, progress: 88, status: "Active", tint: "bg-emerald-100 text-emerald-600" },
  "Visayas State University":     { sector: "Education", piaCount: 3, progress: 30, status: "On Hold", tint: "bg-amber-100 text-amber-600" },
};

function progressBarColor(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 40) return "bg-purple-500";
  return "bg-amber-500";
}

export default function EngagementManager() {
  const nav = useNavigate();
  const [list, setList] = useState<Engagement[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let all = loadEngagements();
    // seed demo engagements if empty
    if (!all.length) {
      const now = new Date().toISOString();
      all = Object.keys(DEMO).map((clientName, i) => ({
        id: `ENG-DEMO-${i + 1}`,
        clientName,
        status: DEMO[clientName].status,
        createdAt: now,
        transcripts: [],
        drlItems: [],
        piaIds: [],
      }));
      saveEngagements(all);
    }
    setList(all);
  }, []);

  const cards = useMemo(() => list.map((e) => ({ e, meta: DEMO[e.clientName] })), [list]);

  const select = (id: string) => {
    setActiveEngagementId(id);
    toast.success("Engagement selected");
    nav("/");
  };

  const addNew = () => {
    const n = name.trim();
    if (!n) return;
    const e = createEngagement(n);
    setList(loadEngagements());
    setOpen(false);
    setName("");
    toast.success(`${n} created`);
    nav("/");
    void e;
  };

  return (
    <div className="max-w-5xl mx-auto pt-6">
      <div className="flex items-center gap-2 mb-1">
        <Briefcase className="h-5 w-5 text-accent" />
        <h1 className="text-2xl font-semibold">Select Engagement</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Choose a client engagement to work on</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(({ e, meta }) => {
          const m = meta || { sector: "—", piaCount: 0, progress: 0, status: e.status, tint: "bg-slate-100 text-slate-600" };
          return (
            <button
              key={e.id}
              onClick={() => select(e.id)}
              className="text-left"
            >
              <Card className="hover:shadow-md hover:border-accent/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", m.tint)}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      m.status === "Active" && "bg-emerald-100 text-emerald-700",
                      m.status === "On Hold" && "bg-amber-100 text-amber-700",
                      m.status === "Closed" && "bg-slate-100 text-slate-600",
                    )}>{m.status}</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-base font-semibold">{e.clientName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.sector} · {m.piaCount} PIAs</div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className={cn("font-semibold",
                        m.progress >= 80 ? "text-emerald-600" :
                        m.progress >= 60 ? "text-blue-600" :
                        m.progress >= 40 ? "text-purple-600" : "text-amber-600"
                      )}>{m.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full transition-all", progressBarColor(m.progress))} style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Engagement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Engagement</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <Label className="text-xs">Client name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Department of Health" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addNew}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

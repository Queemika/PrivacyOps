import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusChip } from "@/components/StatusChip";
import { mockPIAs } from "@/lib/mockData";
import { loadActions } from "@/lib/actionsStore";
import { loadPias } from "@/lib/pia/store";
import { loadTodos, addTodos, toggleTodo, removeTodo, type Todo } from "@/lib/todosStore";
import {
  FileText, Upload, Library, FolderPlus, FileCog, ShieldCheck, Mail,
  ArrowRight, ListChecks, BarChart3, Sparkles, Plus, X, CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  { to: "/upload", icon: Upload, title: "Upload Transcript", desc: "Generate PIA from meeting minutes" },
  { to: "/library", icon: Library, title: "PIA Library", desc: "View and manage all PIAs" },
  { to: "/compile", icon: FolderPlus, title: "Compilation Builder", desc: "Build RoPA & NPC-RS" },
  { to: "/drl", icon: FileCog, title: "DRL / IRL Generator", desc: "Generate document requests" },
  { to: "/pradar", icon: ShieldCheck, title: "PRADAR", desc: "Compliance assessment" },
  { to: "/email", icon: Mail, title: "Email Generator", desc: "Create follow-up emails" },
];

const sourceTone: Record<Todo["source"], string> = {
  Transcript: "bg-[hsl(var(--tile-blue-bg))] text-[hsl(var(--tile-blue-fg))]",
  Email: "bg-[hsl(var(--tile-violet-bg))] text-[hsl(var(--tile-violet-fg))]",
  Manual: "bg-muted text-muted-foreground",
  PIA: "bg-[hsl(var(--tile-green-bg))] text-[hsl(var(--tile-green-fg))]",
};

export default function Dashboard() {
  const livePias = loadPias();
  const actions = loadActions();
  const totalPias = mockPIAs.length + livePias.length;
  const drafts = mockPIAs.filter((p) => p.status === "Draft").length + livePias.length;
  const finalized = mockPIAs.filter((p) => p.status === "Final").length;
  const openActions = actions.filter((a) => a.status === "Open").length;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  useEffect(() => { setTodos(loadTodos()); }, []);

  const refresh = () => setTodos(loadTodos());
  const addManual = () => {
    const t = newTodo.trim();
    if (!t) return;
    addTodos([{ text: t, source: "Manual" }]);
    setNewTodo("");
    refresh();
  };
  const openCount = todos.filter(t => !t.done).length;

  return (
    <PageShell title="Dashboard" subtitle="Overview of your data privacy workflows">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total PIAs" value={totalPias} hint="all phases" icon={FileText} accent="blue" />
        <StatTile label="In Draft" value={drafts} hint="pending review" icon={ListChecks} accent="amber" />
        <StatTile label="Finalized" value={finalized} hint="approved" icon={ShieldCheck} accent="green" />
        <StatTile label="Open Action Items" value={openActions} hint="from transcripts" icon={BarChart3} accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link key={a.to} to={a.to} className="group rounded-xl border bg-card p-4 hover:border-accent transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Todo list */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> My To-do</h2>
                <p className="text-[11px] text-muted-foreground">{openCount} open · auto-added from transcripts &amp; emails</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addManual()}
                placeholder="Add a task…"
                className="h-9"
              />
              <Button size="sm" onClick={addManual}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            <ul className="space-y-1.5 max-h-[320px] overflow-auto -mr-2 pr-2">
              {todos.length === 0 && (
                <li className="text-xs text-muted-foreground py-4 text-center">No tasks yet. Run a transcript or send an email to auto-populate.</li>
              )}
              {todos.map((t) => (
                <li key={t.id} className={`flex items-start gap-2 p-2 rounded-md border ${t.done ? "bg-muted/30" : "bg-card"}`}>
                  <Checkbox checked={t.done} onCheckedChange={() => { toggleTodo(t.id); refresh(); }} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.text}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${sourceTone[t.source]}`}>{t.source}</span>
                      {t.owner && <span className="text-[10px] text-muted-foreground">· {t.owner}</span>}
                    </div>
                  </div>
                  <button onClick={() => { removeTodo(t.id); refresh(); }} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent activity</h2>
              <p className="text-xs text-muted-foreground">Latest updates to your PIAs</p>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/library">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          <div className="divide-y">
            {mockPIAs.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.dpsName}</div>
                    <div className="text-xs text-muted-foreground">Last modified: {p.updatedAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusChip status={p.status} />
                  <Button asChild variant="ghost" size="sm"><Link to="/library">View <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

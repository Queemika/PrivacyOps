import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Calendar as CalendarIcon, Plus, Users, User as UserIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  addEvent, filterEvents, removeEvent, CalendarEvent, CalendarEventKind, CalendarScope,
} from "@/lib/calendar/store";
import { loadEngagements, getActiveEngagementId } from "@/lib/pia/store";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const KIND_COLOR: Record<CalendarEventKind, string> = {
  deadline:  "bg-destructive/15 text-destructive border-destructive/30",
  meeting:   "bg-accent/15 text-accent border-accent/30",
  task:      "bg-warning/15 text-warning-foreground border-warning/30",
  milestone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  drl:       "bg-purple-500/15 text-purple-700 border-purple-500/30",
  todo:      "bg-blue-500/15 text-blue-700 border-blue-500/30",
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const initialEng = params.get("engagement") || getActiveEngagementId() || "all";
  const [engagementId, setEngagementId] = useState<string>(initialEng);
  const [scope, setScope] = useState<CalendarScope | "all">("all");
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);

  // new event form
  const [form, setForm] = useState({ title: "", date: "", kind: "task" as CalendarEventKind, notes: "", scope: "mine" as CalendarScope });

  const engagements = useMemo(() => loadEngagements(), [tick]);
  const activeEng = engagements.find(e => e.id === engagementId);

  useEffect(() => {
    if (engagementId !== "all") {
      params.set("engagement", engagementId);
      setParams(params, { replace: true });
    } else {
      params.delete("engagement");
      setParams(params, { replace: true });
    }
  }, [engagementId]);

  const events = useMemo(
    () => filterEvents({ engagementId: engagementId === "all" ? "all" : engagementId, scope }),
    [engagementId, scope, tick]
  );

  const eventsByDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    events.forEach(e => { (m[e.date] = m[e.date] || []).push(e); });
    return m;
  }, [events]);

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : "";
  const dayEvents = (eventsByDate[selectedKey] || []).sort((a, b) => a.kind.localeCompare(b.kind));

  const upcoming = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return events
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [events]);

  const submit = () => {
    if (!form.title.trim() || !form.date) { toast.error("Title and date required"); return; }
    addEvent({
      title: form.title.trim(),
      date: form.date,
      kind: form.kind,
      notes: form.notes,
      scope: form.scope,
      engagementId: engagementId === "all" ? undefined : engagementId,
      engagementName: activeEng?.clientName,
      owner: user ? `${user.firstName} ${user.lastName}`.trim() || user.email : undefined,
    });
    setOpen(false);
    setForm({ title: "", date: "", kind: "task", notes: "", scope: "mine" });
    setTick(t => t + 1);
    toast.success("Event added");
  };

  const subtitle = activeEng
    ? `Deadlines, tasks and meetings for ${activeEng.clientName}.`
    : "All deadlines, tasks and meetings across your engagements.";

  return (
    <div>
      <div className="px-6 pt-4">
        <PageHeader
          title={activeEng ? `${activeEng.clientName} — Calendar` : "Calendar"}
          description={subtitle}
        />
      </div>
      <PageShell>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Engagement</Label>
            <Select value={engagementId} onValueChange={setEngagementId}>
              <SelectTrigger className="w-[240px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All engagements</SelectItem>
                {engagements.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.clientName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ToggleGroup type="single" value={scope} onValueChange={(v) => v && setScope(v as CalendarScope | "all")} className="ml-auto">
            <ToggleGroupItem value="all" className="h-9 px-3 text-xs">All</ToggleGroupItem>
            <ToggleGroupItem value="mine" className="h-9 px-3 text-xs gap-1"><UserIcon className="h-3.5 w-3.5" />My calendar</ToggleGroupItem>
            <ToggleGroupItem value="team" className="h-9 px-3 text-xs gap-1"><Users className="h-3.5 w-3.5" />Team</ToggleGroupItem>
          </ToggleGroup>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New calendar event</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Kind</Label>
                    <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as CalendarEventKind })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Scope</Label>
                  <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v as CalendarScope })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mine">My calendar</SelectItem>
                      <SelectItem value="team">Team calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-6">
          <Card>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                className="p-2 pointer-events-auto"
                modifiers={{
                  hasEvents: (date) => !!eventsByDate[format(date, "yyyy-MM-dd")],
                }}
                modifiersClassNames={{
                  hasEvents: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-accent",
                }}
              />
              <div className="px-2 pb-2 pt-3 border-t mt-2">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Legend</div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(KIND_COLOR) as CalendarEventKind[]).map(k => (
                    <Badge key={k} variant="outline" className={`text-[10px] capitalize ${KIND_COLOR[k]}`}>{k}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">
                    {selected ? format(selected, "EEEE, MMM d, yyyy") : "Select a date"}
                  </h3>
                  <Badge variant="secondary" className="ml-auto text-[10px]">{dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}</Badge>
                </div>
                {dayEvents.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-6 text-center">Nothing scheduled for this date.</div>
                ) : (
                  <ul className="space-y-2">
                    {dayEvents.map(e => (
                      <li key={e.id} className="flex items-start gap-3 p-3 rounded-md border bg-card">
                        <Badge variant="outline" className={`text-[10px] capitalize ${KIND_COLOR[e.kind]}`}>{e.kind}</Badge>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium leading-tight">{e.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap gap-x-3">
                            {e.engagementName && <span>{e.engagementName}</span>}
                            {e.owner && <span>· {e.owner}</span>}
                            <span>· {e.scope === "mine" ? "My" : "Team"}</span>
                          </div>
                          {e.notes && <div className="text-xs text-muted-foreground mt-1">{e.notes}</div>}
                        </div>
                        {e.link && <Link to={e.link} className="text-[11px] text-accent hover:underline">Open</Link>}
                        {e.source === "manual" && (
                          <button title="Delete" onClick={() => { removeEvent(e.id); setTick(t => t + 1); }} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold">Upcoming</h3>
                  <Badge variant="secondary" className="ml-auto text-[10px]">{upcoming.length}</Badge>
                </div>
                {upcoming.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-3 text-center">No upcoming events.</div>
                ) : (
                  <ul className="divide-y">
                    {upcoming.map(e => (
                      <li key={e.id} className="py-2 flex items-center gap-3">
                        <div className="text-[11px] font-mono tabular-nums text-muted-foreground w-16 shrink-0">{format(new Date(e.date), "MMM d")}</div>
                        <Badge variant="outline" className={`text-[10px] capitalize ${KIND_COLOR[e.kind]}`}>{e.kind}</Badge>
                        <div className="text-sm flex-1 truncate">{e.title}</div>
                        {e.engagementName && <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">{e.engagementName}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>
    </div>
  );
}

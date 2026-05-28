// Lightweight calendar event store + aggregator.
// Pulls user-created events from localStorage and merges with derived
// events from DRL items (date requested/received) and Todos.
import { loadDrl } from "@/lib/drl/store";
import { loadTodos } from "@/lib/todosStore";
import { loadEngagements, loadPias } from "@/lib/pia/store";

export type CalendarEventKind =
  | "deadline"
  | "meeting"
  | "task"
  | "milestone"
  | "drl"
  | "todo";

export type CalendarScope = "mine" | "team";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;            // ISO date (YYYY-MM-DD)
  kind: CalendarEventKind;
  engagementId?: string;
  engagementName?: string;
  owner?: string;          // owner display name / email
  scope: CalendarScope;    // mine | team
  notes?: string;
  link?: string;           // route to open
  source?: "manual" | "drl" | "todo" | "pia";
}

const KEY = "pa_calendar_events_v1";

export function loadManualEvents(): CalendarEvent[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveManualEvents(list: CalendarEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 500)));
}
export function addEvent(e: Omit<CalendarEvent, "id" | "source"> & { source?: CalendarEvent["source"] }) {
  const list = loadManualEvents();
  const ev: CalendarEvent = {
    ...e,
    id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source: e.source || "manual",
  };
  saveManualEvents([ev, ...list]);
  return ev;
}
export function removeEvent(id: string) {
  saveManualEvents(loadManualEvents().filter(e => e.id !== id));
}

function toIsoDate(s?: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function getAllEvents(): CalendarEvent[] {
  const out: CalendarEvent[] = [...loadManualEvents()];

  const engs = loadEngagements();
  const engById: Record<string, string> = {};
  engs.forEach(e => { engById[e.id] = e.clientName; });

  // DRL derived: due = dateRequested + 14d if no received date, else completed milestone
  try {
    const drl = loadDrl();
    drl.forEach(r => {
      const eng = engById[r.fields?.engagementId || ""] || undefined;
      const title = r.fields?.title || r.fields?.document || `DRL #${r.no}`;
      if (r.dateRequested) {
        const due = new Date(r.dateRequested);
        due.setDate(due.getDate() + 14);
        out.push({
          id: `drl-due-${r.id}`,
          title: `DRL due: ${title}`,
          date: due.toISOString().slice(0, 10),
          kind: "drl",
          engagementName: eng,
          owner: r.assignedTo,
          scope: "team",
          link: "/drl",
          source: "drl",
        });
      }
    });
  } catch { /* noop */ }

  // Todos with createdAt + 7d as soft due
  try {
    const todos = loadTodos();
    todos.forEach(t => {
      const d = toIsoDate(t.createdAt);
      if (!d) return;
      const due = new Date(d);
      due.setDate(due.getDate() + 7);
      out.push({
        id: `todo-${t.id}`,
        title: t.text,
        date: due.toISOString().slice(0, 10),
        kind: "todo",
        owner: t.owner,
        scope: t.owner ? "team" : "mine",
        link: "/",
        source: "todo",
      });
    });
  } catch { /* noop */ }

  // PIA created/updated -> milestone on its date
  try {
    const pias = loadPias();
    pias.forEach(p => {
      const d = toIsoDate((p as { updatedAt?: string; createdAt?: string }).updatedAt || (p as { createdAt?: string }).createdAt);
      if (!d) return;
      out.push({
        id: `pia-${p.id}`,
        title: `PIA: ${(p as { title?: string; clientName?: string }).title || (p as { clientName?: string }).clientName || p.id}`,
        date: d,
        kind: "milestone",
        engagementId: (p as { engagementId?: string }).engagementId,
        engagementName: engById[(p as { engagementId?: string }).engagementId || ""],
        scope: "team",
        link: `/pia/${p.id}`,
        source: "pia",
      });
    });
  } catch { /* noop */ }

  return out;
}

export function filterEvents(opts: {
  engagementId?: string | "all";
  scope?: CalendarScope | "all";
  owner?: string;
}): CalendarEvent[] {
  const all = getAllEvents();
  return all.filter(e => {
    if (opts.engagementId && opts.engagementId !== "all") {
      if (e.engagementId !== opts.engagementId && (e.engagementName || "") === "") return false;
      if (e.engagementId && e.engagementId !== opts.engagementId) return false;
    }
    if (opts.scope && opts.scope !== "all" && e.scope !== opts.scope) return false;
    if (opts.owner && e.owner && e.owner !== opts.owner) return false;
    return true;
  });
}

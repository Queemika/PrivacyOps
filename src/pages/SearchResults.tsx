import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { loadEngagements, loadPias } from "@/lib/pia/store";
import { loadDrl } from "@/lib/drl/store";
import { loadTodos } from "@/lib/todosStore";
import { getAllEvents } from "@/lib/calendar/store";

type Hit = {
  id: string;
  type: "Engagement" | "PIA" | "DRL" | "Todo" | "Event";
  title: string;
  subtitle?: string;
  link: string;
};

function score(text: string, q: string): number {
  if (!q) return 0;
  const t = text.toLowerCase(); const needle = q.toLowerCase();
  if (t === needle) return 100;
  if (t.startsWith(needle)) return 60;
  if (t.includes(needle)) return 30;
  // word-token includes
  const tokens = needle.split(/\s+/).filter(Boolean);
  return tokens.reduce((s, tok) => s + (t.includes(tok) ? 10 : 0), 0);
}

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";

  const hits = useMemo<Hit[]>(() => {
    if (!q.trim()) return [];
    const results: (Hit & { _s: number })[] = [];

    loadEngagements().forEach(e => {
      const s = score(`${e.clientName} ${e.status}`, q);
      if (s > 0) results.push({ _s: s, id: e.id, type: "Engagement", title: e.clientName, subtitle: e.status, link: "/engagements" });
    });

    loadPias().forEach(p => {
      const obj = p as { title?: string; clientName?: string; phase?: string; engagementId?: string };
      const text = `${obj.title || ""} ${obj.clientName || ""} ${obj.phase || ""}`;
      const s = score(text, q);
      if (s > 0) results.push({ _s: s, id: p.id, type: "PIA", title: obj.title || obj.clientName || p.id, subtitle: obj.phase, link: `/pia/${p.id}` });
    });

    loadDrl().forEach(r => {
      const text = `${r.fields?.title || ""} ${r.fields?.document || ""} ${r.remarks || ""} ${r.assignedTo || ""} ${r.status}`;
      const s = score(text, q);
      if (s > 0) results.push({ _s: s, id: r.id, type: "DRL", title: r.fields?.title || r.fields?.document || `DRL #${r.no}`, subtitle: `${r.category.toUpperCase()} · ${r.status}`, link: "/drl" });
    });

    loadTodos().forEach(t => {
      const s = score(`${t.text} ${t.owner || ""} ${t.source}`, q);
      if (s > 0) results.push({ _s: s, id: t.id, type: "Todo", title: t.text, subtitle: `${t.source}${t.owner ? " · " + t.owner : ""}`, link: "/" });
    });

    getAllEvents().forEach(e => {
      const s = score(`${e.title} ${e.engagementName || ""} ${e.notes || ""}`, q);
      if (s > 0) results.push({ _s: s, id: e.id, type: "Event", title: e.title, subtitle: `${e.date} · ${e.kind}${e.engagementName ? " · " + e.engagementName : ""}`, link: e.link || "/calendar" });
    });

    return results.sort((a, b) => b._s - a._s).slice(0, 100);
  }, [q]);

  const grouped = useMemo(() => {
    const m: Record<string, Hit[]> = {};
    hits.forEach(h => { (m[h.type] = m[h.type] || []).push(h); });
    return m;
  }, [hits]);

  return (
    <div>
      <div className="px-6 pt-4">
        <PageHeader title="Search" description={q ? `Results for “${q}”` : "Search across engagements, PIAs, DRL items, tasks and calendar events."} />
      </div>
      <PageShell>
        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value;
                setParams(v ? { q: v } : {});
              }
            }}
            className="h-10 pl-9 text-sm"
            placeholder="Type and press Enter…"
          />
        </div>

        {!q.trim() ? (
          <div className="text-sm text-muted-foreground">Enter a keyword above.</div>
        ) : hits.length === 0 ? (
          <div className="text-sm text-muted-foreground">No results found.</div>
        ) : (
          <div className="space-y-6">
            {(["Engagement", "PIA", "DRL", "Todo", "Event"] as const).map(type => {
              const list = grouped[type] || [];
              if (!list.length) return null;
              return (
                <section key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold">{type}s</h3>
                    <Badge variant="secondary" className="text-[10px]">{list.length}</Badge>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <ul className="divide-y">
                        {list.map(h => (
                          <li key={`${h.type}-${h.id}`}>
                            <Link to={h.link} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                              <Badge variant="outline" className="text-[10px]">{h.type}</Badge>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{h.title}</div>
                                {h.subtitle && <div className="text-[11px] text-muted-foreground truncate">{h.subtitle}</div>}
                              </div>
                              <span className="text-[11px] text-accent">Open →</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              );
            })}
          </div>
        )}
      </PageShell>
    </div>
  );
}

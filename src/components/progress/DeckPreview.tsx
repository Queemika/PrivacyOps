import type { DeckSpec, Slide } from "@/lib/progress/deck";
import { Progress } from "@/components/ui/progress";

function SlideFrame({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="deck-slide bg-card border rounded-lg shadow-sm aspect-[16/9] p-10 flex flex-col">
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      <div className="flex-1 min-h-0 overflow-hidden text-sm">{children}</div>
    </div>
  );
}

function renderSlide(s: Slide) {
  if (s.kind === "cover") {
    const { client, overall, date } = s.body;
    return (
      <SlideFrame>
        <div className="h-full flex flex-col justify-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Privacy Compliance</div>
          <h1 className="text-5xl font-semibold mt-2">{client}</h1>
          <div className="text-muted-foreground mt-1">Progress Report · {date}</div>
          <div className="mt-8">
            <div className="text-7xl font-bold">{overall}%</div>
            <div className="text-sm text-muted-foreground mt-1">Overall completion</div>
          </div>
        </div>
      </SlideFrame>
    );
  }
  if (s.kind === "module") {
    const m = s.body;
    return (
      <SlideFrame title={m.label}>
        <div className="space-y-4">
          <div className="text-5xl font-semibold">{m.percent}%</div>
          <Progress value={m.percent} />
          <div className="text-muted-foreground">{m.detail}</div>
          <div className="text-xs text-muted-foreground">{m.completed} of {m.total}</div>
        </div>
      </SlideFrame>
    );
  }
  if (s.kind === "drl") {
    const { open, closed, total, pending } = s.body;
    return (
      <SlideFrame title="Document Requests (DRL)">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Stat label="Open" value={open} />
          <Stat label="Closed" value={closed} />
          <Stat label="Total" value={total} />
        </div>
        <div className="text-xs uppercase text-muted-foreground mb-2">Top pending</div>
        <ul className="text-sm space-y-1">
          {pending.map((r: any) => (
            <li key={r.id} className="flex justify-between border-b py-1">
              <span className="truncate">{r.fields?.document || r.fields?.name || r.fields?.title || `DRL #${r.no}`}</span>
              <span className="text-muted-foreground text-xs">{r.status}</span>
            </li>
          ))}
          {pending.length === 0 && <li className="text-muted-foreground">No open DRL items.</li>}
        </ul>
      </SlideFrame>
    );
  }
  if (s.kind === "mom") {
    const m = s.body;
    return (
      <SlideFrame title="Latest Minutes of Meeting">
        <div className="text-base font-medium">{m.title}</div>
        <div className="text-xs text-muted-foreground mb-3">{m.date}</div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-1">Decisions</div>
            <ul className="list-disc pl-4 space-y-1">{m.decisions.slice(0, 5).map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-1">Actions</div>
            <ul className="list-disc pl-4 space-y-1">{m.actionItems.slice(0, 5).map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
          </div>
        </div>
      </SlideFrame>
    );
  }
  if (s.kind === "deliverables") {
    return (
      <SlideFrame title="Deliverables">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Manuals approved" value={`${s.body.manuals.completed} / ${s.body.manuals.total}`} />
          <Stat label="PIAs in progress" value={`${s.body.pia.detail}`} />
        </div>
      </SlideFrame>
    );
  }
  // next
  return (
    <SlideFrame title="Next Steps">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-xs uppercase text-muted-foreground mb-1">Outstanding gaps</div>
          <ul className="list-disc pl-4 space-y-1">
            {s.body.gaps.map((g: string, i: number) => <li key={i}>{g}</li>)}
            {s.body.gaps.length === 0 && <li className="text-muted-foreground">All modules above 60%.</li>}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase text-muted-foreground mb-1">Action items</div>
          <ul className="list-disc pl-4 space-y-1">
            {s.body.actions.map((a: string, i: number) => <li key={i}>{a}</li>)}
            {s.body.actions.length === 0 && <li className="text-muted-foreground">No pending actions.</li>}
          </ul>
        </div>
      </div>
    </SlideFrame>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

export function DeckPreview({ deck }: { deck: DeckSpec }) {
  return (
    <div className="space-y-4 print:space-y-0">
      <style>{`
        @media print {
          @page { size: landscape; margin: 0.5in; }
          body * { visibility: hidden; }
          .deck-print, .deck-print * { visibility: visible; }
          .deck-print { position: absolute; left: 0; top: 0; width: 100%; }
          .deck-slide { page-break-after: always; aspect-ratio: auto !important; height: 7in; box-shadow: none !important; }
        }
      `}</style>
      <div className="deck-print space-y-4">
        {deck.slides.map(s => <div key={s.id}>{renderSlide(s)}</div>)}
      </div>
    </div>
  );
}

import { getAllModuleProgress, getOverallProgress } from "./calc";
import { loadDrl } from "@/lib/drl/store";
import { loadMoms } from "@/lib/mom/store";
import { loadEngagements, getActiveEngagementId } from "@/lib/pia/store";

export interface Slide {
  id: string;
  title: string;
  kind: "cover" | "module" | "drl" | "mom" | "deliverables" | "next";
  body: any;
}

export interface DeckSpec {
  client: string;
  date: string;
  overall: number;
  slides: Slide[];
}

export interface DeckOptions {
  includeCover?: boolean;
  includeModules?: boolean;
  includeDrl?: boolean;
  includeMom?: boolean;
  includeDeliverables?: boolean;
  includeNext?: boolean;
}

export function buildDeck(opts: DeckOptions = {}): DeckSpec {
  const o = {
    includeCover: true, includeModules: true, includeDrl: true,
    includeMom: true, includeDeliverables: true, includeNext: true, ...opts,
  };
  const engs = loadEngagements();
  const active = engs.find(e => e.id === getActiveEngagementId()) || engs[0];
  const client = active?.clientName || "Client";
  const overall = getOverallProgress();
  const mods = getAllModuleProgress();
  const drl = loadDrl();
  const moms = loadMoms();
  const latestMom = moms[0];

  const drlOpen = drl.filter(r => r.status === "Open" || r.status === "Partially Received" || r.status === "Under Inspection");
  const drlClosed = drl.filter(r => r.status === "Closed" || r.status === "Completed");

  const slides: Slide[] = [];

  if (o.includeCover) {
    slides.push({ id: "cover", kind: "cover", title: "Progress Report", body: { client, overall, date: new Date().toISOString().slice(0, 10) } });
  }
  if (o.includeModules) {
    for (const m of mods) {
      slides.push({ id: `mod-${m.id}`, kind: "module", title: m.label, body: m });
    }
  }
  if (o.includeDrl) {
    slides.push({ id: "drl", kind: "drl", title: "Document Requests (DRL)", body: { open: drlOpen.length, closed: drlClosed.length, total: drl.length, pending: drlOpen.slice(0, 8) } });
  }
  if (o.includeMom && latestMom) {
    slides.push({ id: "mom", kind: "mom", title: "Latest Meeting Minutes", body: latestMom });
  }
  if (o.includeDeliverables) {
    const manuals = mods.find(m => m.id === "manuals")!;
    const pia = mods.find(m => m.id === "pia")!;
    slides.push({ id: "deliv", kind: "deliverables", title: "Deliverables", body: { manuals, pia } });
  }
  if (o.includeNext) {
    const actions = (latestMom?.actionItems || []).slice(0, 6);
    const gaps = mods.filter(m => m.percent < 60).map(m => `${m.label}: ${100 - m.percent}% remaining`);
    slides.push({ id: "next", kind: "next", title: "Next Steps", body: { actions, gaps } });
  }

  return { client, date: new Date().toISOString().slice(0, 10), overall, slides };
}

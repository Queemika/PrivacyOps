import { PRADAR_ITEMS, PradarTemplateItem } from "./pradarTemplate";

export interface PradarEntry {
  id: string;
  rating: number | null;
  gap: string;
  actionPlan: string;
  documentLink: string;
  drlStatus: string;
  assessor: string;
  assessmentStatus: string;
  reviewerStatus: string;
  clientComment: string;
  clientStatus: string;
  basisChecks?: Record<number, boolean>;
  responsibleParty?: string;
  timeline?: string;
  drlRowId?: string; // link to DRL row
}

const STORAGE_KEY = "pa_pradar_state";

const blank = (id: string): PradarEntry => ({
  id,
  rating: null,
  gap: "",
  actionPlan: "",
  documentLink: "",
  drlStatus: "Pending",
  assessor: "",
  assessmentStatus: "Not started",
  reviewerStatus: "Not started",
  clientComment: "",
  clientStatus: "Not Started",
  basisChecks: {},
  responsibleParty: "",
  timeline: "",
});

export function loadEntries(): Record<string, PradarEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return JSON.parse(raw);
  } catch {
    return seed();
  }
}

export function saveEntries(entries: Record<string, PradarEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function seed(): Record<string, PradarEntry> {
  const out: Record<string, PradarEntry> = {};
  for (const it of PRADAR_ITEMS) out[it.id] = blank(it.id);
  return out;
}

export function entryFor(entries: Record<string, PradarEntry>, id: string): PradarEntry {
  return entries[id] ?? blank(id);
}

export function itemsByDomain(): Record<string, PradarTemplateItem[]> {
  const map: Record<string, PradarTemplateItem[]> = {};
  for (const it of PRADAR_ITEMS) {
    (map[it.domain] ||= []).push(it);
  }
  return map;
}

export function domainAverage(domain: string, entries: Record<string, PradarEntry>): number | null {
  const items = PRADAR_ITEMS.filter(i => i.domain === domain);
  const rated = items.map(i => entries[i.id]?.rating).filter((r): r is number => typeof r === "number");
  if (!rated.length) return null;
  return rated.reduce((a, b) => a + b, 0) / rated.length;
}

export function overallMaturity(entries: Record<string, PradarEntry>): number | null {
  const all = PRADAR_ITEMS.map(i => entries[i.id]?.rating).filter((r): r is number => typeof r === "number");
  if (!all.length) return null;
  return all.reduce((a, b) => a + b, 0) / all.length;
}

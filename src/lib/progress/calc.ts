import { loadPias } from "@/lib/pia/store";
import { loadEntries } from "@/lib/pradarModel";
import { PRADAR_ITEMS } from "@/lib/pradarTemplate";
import { loadTechStackFull } from "@/lib/templates/techStackFull";
import { loadAreas } from "@/lib/inspections/store";
import { MANUAL_SECTIONS } from "@/lib/templates/manualSections";
import { loadConfig, normalizedWeights, ModuleId } from "./config";

export interface ModuleProgress {
  id: ModuleId;
  label: string;
  percent: number;       // 0..100
  completed: number;
  total: number;
  detail: string;
  href: string;
}

function piaProgress(): ModuleProgress {
  const pias = loadPias();
  const total = pias.length || 0;
  if (!total) return { id: "pia", label: "PIA", percent: 0, completed: 0, total: 0, detail: "No PIAs yet", href: "/library" };
  let filled = 0; let totalFields = 0;
  for (const p of pias) {
    const buckets = [p.phase1, p.phase2, p.phase3, p.phase4];
    for (const b of buckets) {
      const flat = JSON.stringify(b || {});
      const m = flat.match(/"[^"]{1,}":"[^"]{1,}"/g) || [];
      filled += m.length;
      totalFields += 12; // expected fields per phase (rough)
    }
  }
  const percent = totalFields ? Math.min(100, Math.round((filled / totalFields) * 100)) : 0;
  return { id: "pia", label: "PIA", percent, completed: filled, total: totalFields, detail: `${pias.length} PIA${pias.length === 1 ? "" : "s"} in progress`, href: "/library" };
}

function pradarProgress(): ModuleProgress {
  const entries = loadEntries();
  const total = PRADAR_ITEMS.length;
  const rated = PRADAR_ITEMS.filter(i => typeof entries[i.id]?.rating === "number").length;
  const percent = total ? Math.round((rated / total) * 100) : 0;
  return { id: "pradar", label: "PRADAR (5-in-1)", percent, completed: rated, total, detail: `${rated} of ${total} controls rated`, href: "/pradar" };
}

function tsaProgress(): ModuleProgress {
  const rows = loadTechStackFull();
  const total = rows.length;
  const done = rows.filter(r => r.status && r.status !== "").length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  return { id: "tsa", label: "Tech Security", percent, completed: done, total, detail: `${done} of ${total} controls assessed`, href: "/tsa" };
}

function inspectionProgress(): ModuleProgress {
  const areas = loadAreas();
  let total = 0, done = 0;
  for (const a of areas) {
    for (const r of a.rows) {
      total++;
      if (r.status && r.status !== "") done++;
    }
  }
  const percent = total ? Math.round((done / total) * 100) : 0;
  return { id: "inspection", label: "Physical Inspection", percent, completed: done, total, detail: `${done} of ${total} questions answered`, href: "/inspection" };
}

function manualsProgress(): ModuleProgress {
  const names = Object.keys(MANUAL_SECTIONS);
  let approved = 0;
  try {
    const raw = localStorage.getItem("pa_manuals_approved");
    if (raw) approved = (JSON.parse(raw) as string[]).length;
  } catch { /* noop */ }
  const total = names.length;
  const percent = total ? Math.round((approved / total) * 100) : 0;
  return { id: "manuals", label: "Manuals", percent, completed: approved, total, detail: `${approved} of ${total} manuals approved`, href: "/manuals" };
}

export function getAllModuleProgress(): ModuleProgress[] {
  return [piaProgress(), pradarProgress(), tsaProgress(), inspectionProgress(), manualsProgress()];
}

export function getModuleProgress(id: ModuleId): ModuleProgress {
  return getAllModuleProgress().find(m => m.id === id)!;
}

export function getOverallProgress(): number {
  const cfg = loadConfig();
  const w = normalizedWeights(cfg);
  const mods = getAllModuleProgress();
  return Math.round(mods.reduce((sum, m) => sum + m.percent * (w[m.id] || 0), 0));
}

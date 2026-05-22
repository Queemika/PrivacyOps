// Physical Inspection store — per-area checklists.
export type YNA = "" | "Yes" | "No" | "N-A";

export interface InspectionRow {
  id: string;
  no: number;
  question: string;          // Items for Checking / Question
  status: YNA;               // Compliance Status
  remarks: string;
  observation: string;       // Actual Observation
  recommendation: string;
  // legacy:
  photos?: string[];
}

export interface InspectionArea {
  id: string;
  name: string;
  rows: InspectionRow[];
}

const KEY = "pa_inspection_areas";
const LEGACY_KEY = "pa_inspections";

export const DEFAULT_AREAS = [
  "Management Information Systems",
  "Human Resources",
  "Administration",
  "Client-Facing Services",
  "Records Management",
  "Legal Compliance",
  "Facilities and Security",
  "Third-Party and Procurement",
  "Accounting and Finance",
  "Executive",
  "DPO Oversight",
];

export const DEFAULT_QUESTIONS = [
  "Is the entrance to the records area secured with access control?",
  "Are visitor logbooks maintained at entry points?",
  "Are CCTV cameras installed and operational in record-handling areas?",
  "Are filing cabinets containing personal data locked when unattended?",
  "Are paper-based records shredded after retention period?",
  "Are workstations positioned to prevent unauthorized viewing?",
];

function blankRows(qs: string[] = DEFAULT_QUESTIONS): InspectionRow[] {
  return qs.map((q, i) => ({
    id: `q-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    no: i + 1, question: q, status: "", remarks: "", observation: "", recommendation: "",
  }));
}

function seedAreas(): InspectionArea[] {
  return DEFAULT_AREAS.map((name, i) => ({
    id: `AREA-${i}-${Date.now()}`, name, rows: blankRows(),
  }));
}

function migrateFromLegacy(): InspectionArea[] | null {
  try {
    const raw = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
    if (!Array.isArray(raw) || raw.length === 0) return null;
    return raw.map((insp: any, i: number) => ({
      id: insp.id || `AREA-LEG-${i}`,
      name: insp.departmentArea || `Area ${i + 1}`,
      rows: (insp.rows || []).map((r: any, j: number) => ({
        id: r.id || `q-leg-${j}`,
        no: r.no ?? j + 1,
        question: r.question || "",
        status: (r.answer === "N/A" ? "N-A" : (r.answer || "")) as YNA,
        remarks: r.response || "",
        observation: r.observation || "",
        recommendation: "",
        photos: r.photos || [],
      })),
    }));
  } catch { return null; }
}

export function loadAreas(): InspectionArea[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    const migrated = migrateFromLegacy();
    const next = migrated && migrated.length ? migrated : seedAreas();
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch { return seedAreas(); }
}

export function saveAreas(list: InspectionArea[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// ---------- Backwards-compat exports (used elsewhere) ----------
export interface Inspection {
  id: string; departmentArea: string; inspector: string; date: string; rows: InspectionRow[];
}
export function loadInspections(): Inspection[] {
  return loadAreas().map(a => ({
    id: a.id, departmentArea: a.name, inspector: "",
    date: new Date().toISOString().slice(0, 10), rows: a.rows,
  }));
}

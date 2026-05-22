// Physical Inspection store - per department/area inspection records.
export type YNA = "" | "Yes" | "No" | "N/A";

export interface InspectionRow {
  id: string; no: number;
  question: string;
  answer: YNA;
  response: string;
  observation: string;
  photos: string[]; // data URLs or filenames
}
export interface Inspection {
  id: string;
  departmentArea: string;
  inspector: string;
  date: string;
  rows: InspectionRow[];
}

const KEY = "pa_inspections";

export const DEFAULT_QUESTIONS = [
  "Is the entrance to the records area secured with access control?",
  "Are visitor logbooks maintained at entry points?",
  "Are CCTV cameras installed and operational in record-handling areas?",
  "Are CCTV notices clearly displayed?",
  "Are filing cabinets containing personal data locked when unattended?",
  "Are clean-desk policies observed in shared workspaces?",
  "Are paper-based records shredded after retention period?",
  "Are storage areas free from water/fire hazards?",
  "Are workstations positioned to prevent unauthorized viewing?",
  "Is there a logbook for receiving and releasing personal data?",
  "Are USB ports / removable media controlled?",
  "Are server rooms physically secured and access-restricted?",
];

export function loadInspections(): Inspection[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveInspections(list: Inspection[]) { localStorage.setItem(KEY, JSON.stringify(list)); }
export function newInspection(departmentArea: string): Inspection {
  return {
    id: `INSP-${Date.now()}`, departmentArea, inspector: "", date: new Date().toISOString().slice(0,10),
    rows: DEFAULT_QUESTIONS.map((q, i) => ({
      id: `q-${i}`, no: i + 1, question: q, answer: "", response: "", observation: "", photos: [],
    })),
  };
}
export function upsertInspection(insp: Inspection) {
  const list = loadInspections();
  const i = list.findIndex(x => x.id === insp.id);
  if (i >= 0) list[i] = insp; else list.unshift(insp);
  saveInspections(list);
}
export function deleteInspection(id: string) {
  saveInspections(loadInspections().filter(i => i.id !== id));
}

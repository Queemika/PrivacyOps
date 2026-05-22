export type DrlCategory = "tsa" | "pradar" | "pia" | "notice" | "actions";
export type DrlStatus = "Open" | "Partially Received" | "Under Inspection" | "Closed" | "Not Applicable" | "Completed";

export interface DrlRow {
  id: string;
  category: DrlCategory;
  no: number;
  fields: Record<string, string>; // arbitrary key/value
  status: DrlStatus;
  dateRequested?: string;
  dateReceived?: string;
  remarks?: string;
  attachment?: string;
  tag?: string;     // for action items
  coListWith?: DrlCategory[]; // mirrors
  createdAt: string;
  updatedAt: string;
}

export interface DrlColumnConfig {
  key: string;
  label: string;
  width: number;
  visible: boolean;
  computed?: "daysOutstanding";
}

const ROWS_KEY = "drl:rows:v1";
const COLS_KEY = "drl:cols:v1";

export function loadDrl(): DrlRow[] {
  try { return JSON.parse(localStorage.getItem(ROWS_KEY) || "[]"); } catch { return []; }
}
export function saveDrl(rows: DrlRow[]) {
  localStorage.setItem(ROWS_KEY, JSON.stringify(rows));
}
export function loadCols(cat: DrlCategory): DrlColumnConfig[] | null {
  try {
    const all = JSON.parse(localStorage.getItem(COLS_KEY) || "{}");
    return all[cat] || null;
  } catch { return null; }
}
export function saveCols(cat: DrlCategory, cols: DrlColumnConfig[]) {
  const all = JSON.parse(localStorage.getItem(COLS_KEY) || "{}");
  all[cat] = cols;
  localStorage.setItem(COLS_KEY, JSON.stringify(all));
}

export function nextNo(rows: DrlRow[], cat: DrlCategory): number {
  return rows.filter(r => r.category === cat).reduce((m, r) => Math.max(m, r.no), 0) + 1;
}

export function addRow(cat: DrlCategory, partial: Partial<DrlRow> = {}): DrlRow {
  const rows = loadDrl();
  const row: DrlRow = {
    id: `DRL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: cat,
    no: nextNo(rows, cat),
    fields: {},
    status: "Open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  };
  rows.push(row);
  saveDrl(rows);
  return row;
}

export function updateRow(id: string, patch: Partial<DrlRow>) {
  const rows = loadDrl();
  const i = rows.findIndex(r => r.id === id);
  if (i < 0) return;
  const updated = { ...rows[i], ...patch, fields: { ...rows[i].fields, ...(patch.fields || {}) }, updatedAt: new Date().toISOString() };
  // Auto date-received when status becomes Completed/Closed
  if ((patch.status === "Completed" || patch.status === "Closed") && !updated.dateReceived) {
    updated.dateReceived = new Date().toISOString().split("T")[0];
  }
  rows[i] = updated;
  saveDrl(rows);
}

export function deleteRow(id: string) {
  saveDrl(loadDrl().filter(r => r.id !== id));
}

export interface MomRecord {
  id: string;
  transcriptId?: string;
  title: string;
  date: string;          // YYYY-MM-DD
  attendees: string[];
  agenda: string[];
  decisions: string[];
  actionItems: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const KEY = "pa_mom_records";

export function loadMoms(): MomRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveMoms(list: MomRecord[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

export function upsertMom(m: MomRecord) {
  const all = loadMoms();
  const i = all.findIndex(x => x.id === m.id);
  m.updatedAt = new Date().toISOString();
  if (i >= 0) all[i] = m; else all.unshift(m);
  saveMoms(all);
}

export function deleteMom(id: string) {
  saveMoms(loadMoms().filter(m => m.id !== id));
}

export function newMom(partial: Partial<MomRecord> = {}): MomRecord {
  const now = new Date().toISOString();
  return {
    id: `MOM-${Date.now()}`,
    title: "Untitled meeting",
    date: now.slice(0, 10),
    attendees: [],
    agenda: [],
    decisions: [],
    actionItems: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

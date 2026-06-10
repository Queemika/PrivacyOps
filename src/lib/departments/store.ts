// Shared editable department list, also seeds the Physical Inspection areas
// and powers the DRL Assignment tag suggestions.
import { DEFAULT_AREAS } from "@/lib/inspections/store";

const KEY = "departments:v1";

export function loadDepartments(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch { /* noop */ }
  const seeded = [...DEFAULT_AREAS];
  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveDepartments(list: string[]) {
  const cleaned = Array.from(new Set(list.map(s => s.trim()).filter(Boolean)));
  localStorage.setItem(KEY, JSON.stringify(cleaned));
}

export function addDepartment(name: string) {
  const list = loadDepartments();
  const v = name.trim();
  if (!v || list.includes(v)) return list;
  const next = [...list, v];
  saveDepartments(next);
  return next;
}

export function removeDepartment(name: string) {
  const next = loadDepartments().filter(d => d !== name);
  saveDepartments(next);
  return next;
}

export function renameDepartment(oldName: string, newName: string) {
  const list = loadDepartments();
  const v = newName.trim();
  if (!v) return list;
  const next = list.map(d => d === oldName ? v : d);
  saveDepartments(next);
  return next;
}

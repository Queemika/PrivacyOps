import { ROPA_FIELDS, NPC_FIELDS, FieldDef } from "./pia/ropaMap";

export interface RopaColumnConfig {
  key: string;
  label: string;
  width: number;
  visible: boolean;
}

const KEY = "ropa:compilation:v1";

type Kind = "ropa" | "npc";

function defaults(kind: Kind): RopaColumnConfig[] {
  const fields: FieldDef[] = kind === "ropa" ? ROPA_FIELDS : NPC_FIELDS;
  return fields.map(f => ({ key: f.key, label: f.label, width: 220, visible: true }));
}

export function loadCols(kind: Kind): RopaColumnConfig[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    const saved: RopaColumnConfig[] | undefined = all[kind];
    if (!saved) return defaults(kind);
    // Merge — add new fields not yet in config
    const base = defaults(kind);
    return base.map(d => saved.find(s => s.key === d.key) || d);
  } catch {
    return defaults(kind);
  }
}

export function saveCols(kind: Kind, cols: RopaColumnConfig[]) {
  const all = JSON.parse(localStorage.getItem(KEY) || "{}");
  all[kind] = cols;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function resetCols(kind: Kind) {
  const all = JSON.parse(localStorage.getItem(KEY) || "{}");
  delete all[kind];
  localStorage.setItem(KEY, JSON.stringify(all));
}

// Per-engagement settings — codenames for DRL Owner column.
import { loadEngagements } from "@/lib/pia/store";

const KEY = "engagement:settings:v1";

export interface EngagementSettings {
  clientCodename: string;
  myTeamCodename: string;
}

type Bag = Record<string, EngagementSettings>;

function loadAll(): Bag {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function saveAll(bag: Bag) {
  localStorage.setItem(KEY, JSON.stringify(bag));
}

export function getEngagementCodenames(engagementId: string | null | undefined): EngagementSettings {
  const bag = loadAll();
  const existing = engagementId ? bag[engagementId] : undefined;
  if (existing) return existing;
  const eng = engagementId ? loadEngagements().find(e => e.id === engagementId) : undefined;
  return {
    clientCodename: eng?.clientName || "Client",
    myTeamCodename: "MyTeam",
  };
}

export function setEngagementCodenames(engagementId: string, patch: Partial<EngagementSettings>) {
  const bag = loadAll();
  const cur = getEngagementCodenames(engagementId);
  bag[engagementId] = { ...cur, ...patch };
  saveAll(bag);
}

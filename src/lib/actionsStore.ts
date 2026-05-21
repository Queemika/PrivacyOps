// Shared action items extracted from transcripts. Surfaced in DRL "Action Items"
// tab and Email Generator (as default items).

export interface ActionItem {
  id: string;
  source: "Transcript" | "PIA" | "PRADAR" | "Manual";
  sourceRef?: string; // e.g. uploadId, piaId
  engagementId?: string;
  text: string;
  owner?: string;
  deadline?: string;
  status: "Open" | "In Progress" | "Closed";
  createdAt: string;
}

const KEY = "pa_action_items";

export function loadActions(): ActionItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveActions(list: ActionItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}
export function addActions(items: Omit<ActionItem, "id" | "createdAt" | "status">[]) {
  const all = loadActions();
  const now = new Date().toISOString();
  const created: ActionItem[] = items.map((i, idx) => ({
    ...i,
    id: `ACT-${Date.now()}-${idx}`,
    status: "Open",
    createdAt: now,
  }));
  saveActions([...created, ...all]);
  return created;
}

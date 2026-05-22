// Lightweight client-side audit log persisted to localStorage.
export interface AuditEntry { ts: string; user: string; action: string; target: string; }
const KEY = "pa_audit_log";
const MAX = 500;

export function loadAudit(): AuditEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function logAction(action: string, target: string, user = "current.user") {
  const list = loadAudit();
  list.unshift({ ts: new Date().toISOString().replace("T", " ").slice(0, 19), user, action, target });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}
export function clearAudit() { localStorage.removeItem(KEY); }

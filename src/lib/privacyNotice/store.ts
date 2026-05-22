import { NoticeType } from "./template";

export interface NoticeAnswer { comply: boolean; reason: string; notes: string; }
export interface PrivacyNotice {
  id: string;
  dpsName: string;
  type: NoticeType;
  department: string;
  status: "Draft" | "In Review" | "Approved" | "Non-compliant";
  answers: Record<string, NoticeAnswer>;
  updatedAt: string;
}

const KEY = "pa_privacy_notices";

export function loadNotices(): PrivacyNotice[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveNotices(list: PrivacyNotice[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
export function upsertNotice(n: PrivacyNotice) {
  const list = loadNotices();
  const i = list.findIndex(x => x.id === n.id);
  n.updatedAt = new Date().toISOString();
  if (i >= 0) list[i] = n; else list.unshift(n);
  saveNotices(list);
}
export function deleteNotice(id: string) {
  saveNotices(loadNotices().filter(n => n.id !== id));
}
export function newNotice(dpsName: string, type: NoticeType): PrivacyNotice {
  return {
    id: `PN-${Date.now()}`,
    dpsName, type, department: "",
    status: "Draft", answers: {}, updatedAt: new Date().toISOString(),
  };
}
export function compliance(n: PrivacyNotice): { total: number; complied: number } {
  const vals = Object.values(n.answers);
  return { total: vals.length, complied: vals.filter(v => v.comply).length };
}

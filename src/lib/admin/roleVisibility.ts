// Admin "View As" — controls which modules each role can see.

export const ROLES = ["Intern", "Preparer/Associate", "Lead/Supervisor", "Approver/Manager", "Admin"] as const;
export type Role = (typeof ROLES)[number];

export interface ModuleEntry { path: string; title: string }

export const MODULES: ModuleEntry[] = [
  { path: "/",            title: "Dashboard" },
  { path: "/upload",      title: "Transcript" },
  { path: "/library",     title: "PIA" },
  { path: "/analytics",   title: "Analytics" },
  { path: "/drl",         title: "DRL / IRL" },
  { path: "/pradar",      title: "PRADAR (5-in-1)" },
  { path: "/tsa",         title: "Tech Security" },
  { path: "/inspection",  title: "Physical Inspection" },
  { path: "/notice",      title: "Privacy Notice" },
  { path: "/manuals",     title: "Manuals and Outputs" },
  { path: "/email",       title: "Email Generator" },
  { path: "/audit",       title: "Audit Log" },
  { path: "/help",        title: "Help & FAQ" },
];

const KEY = "pa_role_visibility";
const VIEW_KEY = "pa_view_as";

type Map_ = Record<Role, Record<string, boolean>>;

function defaults(): Map_ {
  const m = {} as Map_;
  for (const r of ROLES) {
    m[r] = {};
    for (const mod of MODULES) {
      // Restrict admin-only modules from non-admins by default
      if (mod.path === "/audit" && r !== "Admin" && r !== "Approver/Manager") m[r][mod.path] = false;
      else m[r][mod.path] = true;
    }
  }
  return m;
}

export function loadVisibility(): Map_ {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw) return defaults();
    const d = defaults();
    for (const r of ROLES) d[r] = { ...d[r], ...(raw[r] || {}) };
    return d;
  } catch { return defaults(); }
}

export function saveVisibility(v: Map_) {
  localStorage.setItem(KEY, JSON.stringify(v));
  window.dispatchEvent(new Event("pa:visibility-change"));
}

export function getViewAsRole(): Role | null {
  const r = localStorage.getItem(VIEW_KEY) as Role | null;
  return r && (ROLES as readonly string[]).includes(r) ? r : null;
}

export function setViewAsRole(r: Role | null) {
  if (r) localStorage.setItem(VIEW_KEY, r); else localStorage.removeItem(VIEW_KEY);
  window.dispatchEvent(new Event("pa:visibility-change"));
}

export function isPathVisible(path: string): boolean {
  const role = getViewAsRole();
  if (!role || role === "Admin") return true;
  const v = loadVisibility();
  return v[role]?.[path] !== false;
}

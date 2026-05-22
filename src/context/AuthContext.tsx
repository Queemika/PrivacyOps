import { useEffect, useState, ReactNode } from "react";
import {
  AuthContextObject,
  AuthUser,
  AuditEntry,
  AuthCtx,
} from "./auth-context-base";

export { useAuth, validateCorporateEmail } from "./auth-context-base";
export type { AuthUser, AuditEntry } from "./auth-context-base";

const readUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("pa_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const readAudit = (): AuditEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const a = localStorage.getItem("pa_audit");
    return a ? JSON.parse(a) : [];
  } catch {
    return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => readAudit());
  const [ready] = useState(true);

  useEffect(() => {
    try {
      const accounts = JSON.parse(localStorage.getItem("pa_accounts") || "{}");
      if (!accounts["admin@kpmg.com"]) {
        accounts["admin@kpmg.com"] = {
          firstName: "Admin",
          lastName: "User",
          email: "admin@kpmg.com",
          password: "admin1234",
        };
        localStorage.setItem("pa_accounts", JSON.stringify(accounts));
      }
    } catch {
      /* noop */
    }
  }, []);

  const persistUser = (u: AuthUser | null) => {
    if (u) localStorage.setItem("pa_user", JSON.stringify(u));
    else localStorage.removeItem("pa_user");
    setUser(u);
  };

  const logAction = (action: string, target: string) => {
    const entry: AuditEntry = {
      ts: new Date().toISOString().replace("T", " ").slice(0, 16),
      user: user?.email ?? "anonymous",
      action,
      target,
    };
    setAuditLog((prev) => {
      const next = [entry, ...prev].slice(0, 200);
      localStorage.setItem("pa_audit", JSON.stringify(next));
      return next;
    });
  };

  const signup: AuthCtx["signup"] = ({ firstName, lastName, email, password }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
    if (!firstName.trim() || !lastName.trim()) return { ok: false, error: "First and last name are required." };
    if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
    const accounts = JSON.parse(localStorage.getItem("pa_accounts") || "{}");
    accounts[email.toLowerCase()] = { firstName, lastName, email, password };
    localStorage.setItem("pa_accounts", JSON.stringify(accounts));
    persistUser({ firstName, lastName, email });
    logAction("Account created", email);
    return { ok: true };
  };

  const login: AuthCtx["login"] = (email, password) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
    const accounts = JSON.parse(localStorage.getItem("pa_accounts") || "{}");
    const acc = accounts[email.toLowerCase()];
    if (!acc || acc.password !== password) return { ok: false, error: "Invalid email or password." };
    const u = { firstName: acc.firstName, lastName: acc.lastName, email: acc.email };
    persistUser(u);
    setTimeout(() => {
      const entry: AuditEntry = {
        ts: new Date().toISOString().replace("T", " ").slice(0, 16),
        user: u.email, action: "Signed in", target: "session",
      };
      setAuditLog((prev) => {
        const next = [entry, ...prev].slice(0, 200);
        localStorage.setItem("pa_audit", JSON.stringify(next));
        return next;
      });
    }, 0);
    return { ok: true };
  };

  const logout = () => {
    if (user) logAction("Signed out", "session");
    persistUser(null);
  };

  return (
    <AuthContextObject.Provider value={{ user, ready, login, signup, logout, logAction, auditLog }}>
      {children}
    </AuthContextObject.Provider>
  );
}

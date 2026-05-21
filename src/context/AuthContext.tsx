import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuditEntry {
  ts: string;
  user: string;
  action: string;
  target: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (u: AuthUser & { password: string }) => { ok: boolean; error?: string };
  logout: () => void;
  logAction: (action: string, target: string) => void;
  auditLog: AuditEntry[];
}

const Ctx = createContext<AuthCtx | null>(null);

// Prototype: accept any well-formed email (demo mode).
export function validateCorporateEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Please enter a valid email address.";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  useEffect(() => {
    // Seed default admin account
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
    const u = localStorage.getItem("pa_user");
    if (u) setUser(JSON.parse(u));
    const a = localStorage.getItem("pa_audit");
    if (a) setAuditLog(JSON.parse(a));
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
    const err = validateCorporateEmail(email);
    if (err) return { ok: false, error: err };
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
    const err = validateCorporateEmail(email);
    if (err) return { ok: false, error: err };
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

  return <Ctx.Provider value={{ user, login, signup, logout, logAction, auditLog }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
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

export interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (u: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  logAction: (action: string, target: string) => void;
  auditLog: AuditEntry[];
}

export const AuthContextObject = createContext<AuthCtx | null>(null);

export function useAuth() {
  const c = useContext(AuthContextObject);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export function validateCorporateEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Please enter a valid email address.";
  return null;
}

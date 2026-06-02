import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mfaVerified: boolean;
}

export interface AuditEntry {
  ts: string;
  user: string;
  action: string;
  target: string;
}

export type LoginResult =
  | { ok: true; mfa: true; email: string; devCode?: string; devNotice?: string }
  | { ok: true; mfa: false }
  | { ok: false; error: string };

export interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyLoginOtp: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  resendLoginOtp: (email: string) => Promise<{ ok: boolean; error?: string; devCode?: string; devNotice?: string }>;
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

export const INTERNAL_DOMAIN = "kpmg.com";
export const DEMO_USERS = ["admin@kpmg.com", "test_client@kpmg.com"];

export function isDemoUser(email: string | null | undefined): boolean {
  return !!email && DEMO_USERS.includes(email.toLowerCase());
}

export function isInternalEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@" + INTERNAL_DOMAIN);
}

export function validateCorporateEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Please enter a valid email address.";
  return null;
}

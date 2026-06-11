import { useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { Session, User } from "@supabase/supabase-js";
import {
  AuthContextObject,
  AuthUser,
  AuditEntry,
  AuthCtx,
  LoginResult,
  OtpResult,
  isDemoUser,
} from "./auth-context-base";

export { useAuth, validateCorporateEmail, isInternalEmail } from "./auth-context-base";
export type { AuthUser, AuditEntry, LoginResult } from "./auth-context-base";

function toAuthUser(u: User | null): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata || {}) as Record<string, string>;
  const appMeta = (u.app_metadata || {}) as Record<string, unknown>;
  const fullName = meta.full_name || meta.name || "";
  const [fnPart, ...rest] = fullName.split(" ");
  const email = u.email || "";
  return {
    id: u.id,
    email,
    firstName: meta.first_name || fnPart || (email.split("@")[0] ?? ""),
    lastName: meta.last_name || rest.join(" ") || "",
    mfaVerified: isDemoUser(email) || !!appMeta.mfa_verified_at,
  };
}

async function callFn(name: string, body: Record<string, unknown>): Promise<OtpResult> {
  const result = await supabase.functions.invoke(name, { body });

  console.log("FUNCTION RESULT:", name, result);

  const { data, error } = result;

  if (error) {
    console.error("FUNCTION ERROR:", error);

    return {
      ok: false,
      error: JSON.stringify(error),
    };
  }

  const d = (data ?? {}) as OtpResult;

  console.log("FUNCTION DATA:", d);

  if (d.error || d.ok === false) {
    return {
      ok: false,
      error: d.error || "Request failed",
    };
  }

  return {
    ok: true,
    ...d,
  };
}

const OTP_SEND_COOLDOWN_MS = 30_000;

function rememberOtpSend(email: string, r: OtpResult) {
  sessionStorage.setItem("login_email", email);
  sessionStorage.setItem("login_otp_sent_at", String(Date.now()));
  sessionStorage.removeItem("login_otp_request_started_at");
  if (r.devCode) {
    sessionStorage.setItem("login_dev_code", r.devCode);
    if (r.devNotice) sessionStorage.setItem("login_dev_notice", r.devNotice);
  }
}

function markOtpRequestStarted(email: string) {
  sessionStorage.setItem("login_email", email);
  sessionStorage.setItem("login_otp_request_started_at", String(Date.now()));
}

function hasFreshOtpRequest(email: string) {
  if (sessionStorage.getItem("login_email") !== email) return false;
  const sentAt = Number(sessionStorage.getItem("login_otp_sent_at") || 0);
  const startedAt = Number(sessionStorage.getItem("login_otp_request_started_at") || 0);
  const now = Date.now();
  return (sentAt > 0 && now - sentAt < OTP_SEND_COOLDOWN_MS) || (startedAt > 0 && now - startedAt < 10_000);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      const next = toAuthUser(session?.user ?? null);
      setUser(next);

      // Google OAuth: trigger OTP after sign-in if not yet verified
      if (event === "SIGNED_IN" && next && !next.mfaVerified) {
        // detect OAuth (provider != email) by looking at identities
        const isOAuth = (session?.user?.identities || []).some((i) => i.provider !== "email");
        if (isOAuth && !hasFreshOtpRequest(next.email)) {
          markOtpRequestStarted(next.email);
          callFn("send-login-otp", { email: next.email }).then((r) => {
            if (r.ok) rememberOtpSend(next.email, r);
            if (r.ok && !window.location.pathname.startsWith("/login/verify")) {
              window.location.assign("/login/verify");
            }
          });
        }
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(toAuthUser(data.session?.user ?? null));
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setAuditLog([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("audit_log")
        .select("created_at, user_email, action, target")
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled || !data) return;
      setAuditLog(
        data.map((d) => ({
          ts: (d.created_at as string).replace("T", " ").slice(0, 16),
          user: d.user_email || "—",
          action: d.action,
          target: d.target || "",
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const logAction = useCallback(
    (action: string, target: string) => {
      if (!user) return;
      supabase
        .from("audit_log")
        .insert({ user_id: user.id, user_email: user.email, action, target })
        .then(({ error }) => {
          if (!error) {
            const entry: AuditEntry = {
              ts: new Date().toISOString().replace("T", " ").slice(0, 16),
              user: user.email,
              action,
              target,
            };
            setAuditLog((p) => [entry, ...p].slice(0, 200));
          }
        });
    },
    [user],
  );

  const signup: AuthCtx["signup"] = async ({ firstName, lastName, email, password }) => {
    if (!firstName.trim() || !lastName.trim()) return { ok: false, error: "First and last name are required." };
    if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo, data: { first_name: firstName, last_name: lastName } },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const login: AuthCtx["login"] = async (email, password): Promise<LoginResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };

    if (isDemoUser(email)) {
      return { ok: true, mfa: false };
    }

    const send = await callFn("send-login-otp", { email: email.toLowerCase() });
    if (!send.ok) return { ok: false, error: send.error || "Could not send verification code." };
    rememberOtpSend(email.toLowerCase(), send);

    return { ok: true, mfa: true, email, devCode: send.devCode, devNotice: send.devNotice };
  };

  const verifyLoginOtp: AuthCtx["verifyLoginOtp"] = async (email, code) => {
    const r = await callFn("verify-login-otp", { email: email.toLowerCase(), code });
    if (!r.ok) return r;
    // refresh session so updated app_metadata is reflected
    const { data } = await supabase.auth.refreshSession();
    setUser(toAuthUser(data.session?.user ?? null));
    return { ok: true };
  };

  const resendLoginOtp: AuthCtx["resendLoginOtp"] = async (email) => {
    return callFn("send-login-otp", { email: email.toLowerCase() });
  };

  const loginWithGoogle: AuthCtx["loginWithGoogle"] = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContextObject.Provider
      value={{
        user,
        ready,
        login,
        verifyLoginOtp,
        resendLoginOtp,
        signup,
        loginWithGoogle,
        logout,
        logAction,
        auditLog,
      }}
    >
      {children}
    </AuthContextObject.Provider>
  );
}

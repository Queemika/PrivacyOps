import { useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { Session, User } from "@supabase/supabase-js";
import { AuthContextObject, AuthUser, AuditEntry, AuthCtx, LoginResult } from "./auth-context-base";

export { useAuth, validateCorporateEmail, isInternalEmail } from "./auth-context-base";
export type { AuthUser, AuditEntry, LoginResult } from "./auth-context-base";

function toAuthUser(u: User | null): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata || {}) as Record<string, string>;
  const fullName = meta.full_name || meta.name || "";
  const [fnPart, ...rest] = fullName.split(" ");
  return {
    id: u.id,
    email: u.email || "",
    firstName: meta.first_name || fnPart || (u.email?.split("@")[0] ?? ""),
    lastName: meta.last_name || rest.join(" ") || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(toAuthUser(session?.user ?? null));
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
        .insert({
          user_id: user.id,
          user_email: user.email,
          action,
          target,
        })
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
      options: {
        emailRedirectTo: redirectTo,
        data: { first_name: firstName, last_name: lastName },
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  // Password is step 1. On success we sign out and send an email OTP for step 2.
  const login: AuthCtx["login"] = async (email, password): Promise<LoginResult> => {
    console.log("STEP 1 - Starting password login");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("STEP 2 - Password result:", error);

    if (error) {
      return { ok: false, error: error.message };
    }

    console.log("STEP 3 - Password login succeeded");

    await supabase.auth.signOut();

    console.log("STEP 4 - Signed out");

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    console.log("STEP 5 - OTP result:", otpErr);

    if (otpErr) {
      return { ok: false, error: otpErr.message };
    }

    console.log("STEP 6 - Returning MFA");

    return {
      ok: true,
      mfa: true,
      email,
    };
  };

  const verifyLoginOtp: AuthCtx["verifyLoginOtp"] = async (email, code) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const resendLoginOtp: AuthCtx["resendLoginOtp"] = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
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

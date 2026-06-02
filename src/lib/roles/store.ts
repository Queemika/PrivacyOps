import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type AppRole = "Intern" | "Preparer" | "Lead" | "Approver" | "Admin" | "Client";

export function useMyRoles(): { roles: AppRole[]; isAdmin: boolean; ready: boolean; refresh: () => void } {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setRoles([]); setReady(true); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    setRoles((data || []).map((r) => r.role as AppRole));
    setReady(true);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { roles, isAdmin: roles.includes("Admin"), ready, refresh: load };
}

export interface ProfileLite { user_id: string; email: string; first_name: string | null; last_name: string | null }

export async function listProfiles(): Promise<ProfileLite[]> {
  const { data } = await supabase.from("profiles").select("user_id, email, first_name, last_name").order("email");
  return (data || []) as ProfileLite[];
}

export async function listEngagements() {
  const { data } = await supabase.from("engagements").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function setUserRole(user_id: string, role: AppRole, add: boolean) {
  if (add) {
    return supabase.from("user_roles").insert({ user_id, role });
  }
  return supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
}

export async function getUserRoles(user_id: string): Promise<AppRole[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user_id);
  return (data || []).map((r) => r.role as AppRole);
}

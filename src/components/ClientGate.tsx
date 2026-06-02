import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles } from "@/lib/roles/store";

/**
 * Client-only users with no engagement membership are routed to the
 * "waiting for access" screen. Admins/internal roles are unaffected.
 */
export default function ClientGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { roles, ready } = useMyRoles();
  const loc = useLocation();
  const [hasEngagement, setHasEngagement] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setHasEngagement(null); return; }
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("engagement_members")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (!cancelled) setHasEngagement((count || 0) > 0);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!ready || hasEngagement === null) return <>{children}</>;

  const isClientOnly = roles.length > 0 && roles.every((r) => r === "Client");
  const locked = isClientOnly && !hasEngagement;

  if (locked && loc.pathname !== "/engagements/waiting") {
    return <Navigate to="/engagements/waiting" replace />;
  }
  if (!locked && loc.pathname === "/engagements/waiting") {
    return <Navigate to="/engagements" replace />;
  }
  return <>{children}</>;
}

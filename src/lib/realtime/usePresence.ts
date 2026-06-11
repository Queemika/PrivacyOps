import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface PresenceUser {
  user_id: string;
  name: string;
  email: string;
  color: string;
  focusedField?: string;
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

export function usePresence(channelKey: string | null | undefined) {
  const { user } = useAuth();
  const [others, setOthers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const meRef = useRef<PresenceUser | null>(null);

  useEffect(() => {
    if (!channelKey || !user) return;
    const me: PresenceUser = {
      user_id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
      email: user.email,
      color: colorFor(user.id),
    };
    meRef.current = me;
    const ch = supabase.channel(`presence:${channelKey}`, { config: { presence: { key: user.id } } });
    channelRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, PresenceUser[]>;
      const list: PresenceUser[] = [];
      Object.entries(state).forEach(([uid, metas]) => {
        if (uid === user.id) return;
        const last = metas[metas.length - 1];
        if (last) list.push(last);
      });
      setOthers(list);
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await ch.track(me);
    });

    return () => {
      ch.unsubscribe();
      channelRef.current = null;
    };
  }, [channelKey, user]);

  const setFocusedField = (field?: string) => {
    if (!channelRef.current || !meRef.current) return;
    meRef.current = { ...meRef.current, focusedField: field };
    channelRef.current.track(meRef.current);
  };

  return { others, setFocusedField };
}

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type WorkableTable = "pia_records" | "drl_rows" | "inspection_records" | "tsa_records" | "ropa_records";

export function useRealtimeRecord<T extends { id: string; updated_by?: string | null; version?: number }>(
  table: WorkableTable,
  id: string | null | undefined,
) {
  const { user } = useAuth();
  const [record, setRecord] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingRef = useRef<Record<string, unknown>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) { setRecord(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (!cancelled) { setRecord(data as unknown as T); setLoading(false); }
    })();
    const ch = supabase
      .channel(`rt:${table}:${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table, filter: `id=eq.${id}` }, (payload) => {
        const next = payload.new as T;
        setRecord((prev) => {
          if (prev && next.updated_by && next.updated_by !== user?.id && Object.keys(pendingRef.current).length === 0) {
            toast.info("Record updated by collaborator");
          }
          return next;
        });
      })
      .subscribe();
    return () => { cancelled = true; ch.unsubscribe(); };
  }, [table, id, user?.id]);

  const flush = useCallback(async () => {
    if (!id || Object.keys(pendingRef.current).length === 0) return;
    const patch = { ...pendingRef.current, updated_by: user?.id };
    pendingRef.current = {};
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    if (error) toast.error(`Save failed: ${error.message}`);
  }, [table, id, user?.id]);

  const patch = useCallback((updates: Record<string, unknown>) => {
    setRecord((prev) => (prev ? ({ ...prev, ...updates } as T) : prev));
    pendingRef.current = { ...pendingRef.current, ...updates };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(flush, 500);
  }, [flush]);

  return { record, setRecord, loading, patch, flush };
}

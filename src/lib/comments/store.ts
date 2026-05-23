import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type CommentKind = "comment" | "highlight";
export type CommentStatus = "open" | "resolved";

export interface CommentAnchor {
  field?: string;
  selection?: { start: number; end: number; quote: string };
  color?: string;
}

export interface Comment {
  id: string;
  engagement_id: string | null;
  module: string;
  record_id: string | null;
  anchor: CommentAnchor;
  kind: CommentKind;
  author_id: string;
  body: string;
  mentions: string[];
  status: CommentStatus;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentInput {
  module: string;
  record_id?: string | null;
  engagement_id?: string | null;
  anchor?: CommentAnchor;
  kind?: CommentKind;
  body: string;
  mentions?: string[];
  parent_id?: string | null;
}

export function useComments(module: string, record_id?: string | null) {
  const { user } = useAuth();
  const [items, setItems] = useState<Comment[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    let q = supabase.from("comments").select("*").eq("module", module).order("created_at", { ascending: true });
    if (record_id != null) q = q.eq("record_id", record_id);
    const { data } = await q;
    setItems((data || []) as Comment[]);
    setReady(true);
  }, [module, record_id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel(`comments-${module}-${record_id ?? "all"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [module, record_id, load]);

  const create = async (input: CreateCommentInput) => {
    if (!user) return null;
    const payload = {
      module: input.module,
      record_id: input.record_id ?? record_id ?? null,
      engagement_id: input.engagement_id ?? null,
      anchor: input.anchor ?? {},
      kind: input.kind ?? "comment",
      body: input.body,
      mentions: input.mentions ?? [],
      parent_id: input.parent_id ?? null,
      author_id: user.id,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.from("comments").insert(payload as any).select().single();
    if (error) console.error(error);
    return data as Comment | null;
  };

  const update = async (id: string, patch: Partial<Pick<Comment, "body" | "status">>) => {
    await supabase.from("comments").update(patch).eq("id", id);
  };
  const remove = async (id: string) => { await supabase.from("comments").delete().eq("id", id); };
  const resolve = (id: string) => update(id, { status: "resolved" });
  const reopen = (id: string) => update(id, { status: "open" });

  return { items, ready, create, update, remove, resolve, reopen, refresh: load };
}

export async function assignCommentTodo(comment_id: string, assignee_id: string, due_date?: string) {
  return supabase.from("comment_todos").insert({ comment_id, assignee_id, due_date: due_date ?? null });
}

import { useState, useEffect, useRef } from "react";
import { useComments, assignCommentTodo, Comment } from "@/lib/comments/store";
import { listProfiles, ProfileLite } from "@/lib/roles/store";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, Check, RotateCcw, Trash2, Reply, UserPlus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Props {
  module: string;
  record_id?: string | null;
  trigger?: React.ReactNode;
}

export function CommentsPanel({ module, record_id, trigger }: Props) {
  const { user } = useAuth();
  const { items, create, update, remove, resolve, reopen } = useComments(module, record_id);
  const [people, setPeople] = useState<ProfileLite[]>([]);
  const [draft, setDraft] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [filter, setFilter] = useState<"open" | "all">("open");
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { listProfiles().then(setPeople); }, []);

  const roots = items.filter(c => !c.parent_id && (filter === "all" || c.status === "open"));
  const repliesOf = (id: string) => items.filter(c => c.parent_id === id);

  const submit = async () => {
    if (!draft.trim()) return;
    await create({ module, record_id: record_id ?? null, body: draft.trim(), mentions, parent_id: replyTo?.id ?? null });
    setDraft(""); setMentions([]); setReplyTo(null);
    toast.success("Comment posted");
  };

  const onDraftChange = (v: string) => {
    setDraft(v);
    const m = v.match(/@(\w*)$/);
    if (m) { setMentionQuery(m[1].toLowerCase()); setMentionOpen(true); }
    else setMentionOpen(false);
  };

  const pickMention = (p: ProfileLite) => {
    const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email;
    setDraft(d => d.replace(/@\w*$/, `@${name} `));
    setMentions(m => Array.from(new Set([...m, p.user_id])));
    setMentionOpen(false);
    ta.current?.focus();
  };

  const assignTodo = async (c: Comment) => {
    const target = prompt("Assign to (email):");
    if (!target) return;
    const found = people.find(p => p.email.toLowerCase() === target.toLowerCase());
    if (!found) { toast.error("User not found"); return; }
    await assignCommentTodo(c.id, found.user_id);
    toast.success("To-do assigned");
  };

  const filteredPeople = people.filter(p => {
    if (!mentionQuery) return true;
    const t = `${p.first_name ?? ""} ${p.last_name ?? ""} ${p.email}`.toLowerCase();
    return t.includes(mentionQuery);
  }).slice(0, 6);

  const renderComment = (c: Comment, depth = 0) => (
    <div key={c.id} className={`border rounded-md p-2.5 bg-card ${c.status === "resolved" ? "opacity-60" : ""}`} style={{ marginLeft: depth * 16 }}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{authorName(c, people)}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
            {c.anchor?.field && <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{c.anchor.field}</span>}
            {c.kind === "highlight" && <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-900 text-[10px]">Highlight</span>}
            {c.status === "resolved" && <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[10px]">Resolved</span>}
          </div>
          {c.anchor?.selection?.quote && (
            <div className="mt-1 text-[11px] italic border-l-2 border-yellow-300 pl-2 text-muted-foreground line-clamp-2">
              "{c.anchor.selection.quote}"
            </div>
          )}
          <div className="text-sm mt-1 whitespace-pre-wrap break-words">{c.body}</div>
          <div className="flex gap-1 mt-1.5">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => setReplyTo(c)}>
              <Reply className="h-3 w-3 mr-1" />Reply
            </Button>
            {c.status === "open"
              ? <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => resolve(c.id)}><Check className="h-3 w-3 mr-1" />Resolve</Button>
              : <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => reopen(c.id)}><RotateCcw className="h-3 w-3 mr-1" />Reopen</Button>}
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => assignTodo(c)}>
              <UserPlus className="h-3 w-3 mr-1" />To-do
            </Button>
            {c.author_id === user?.id && (
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] text-destructive" onClick={() => remove(c.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {repliesOf(c.id).map(r => renderComment(r, depth + 1))}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Comments {items.filter(c => c.status === "open").length > 0 && <span className="text-xs">({items.filter(c => c.status === "open").length})</span>}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[480px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-base">Comments</SheetTitle>
          <div className="flex gap-1 pt-1">
            <Button size="sm" variant={filter === "open" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFilter("open")}>Open</Button>
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFilter("all")}>All</Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {roots.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8">No comments yet. Be the first.</div>
          ) : roots.map(c => renderComment(c))}
        </div>

        <div className="border-t p-3 space-y-2 relative">
          {replyTo && (
            <div className="flex items-center justify-between text-[11px] bg-muted/40 px-2 py-1 rounded">
              <span>Replying to {authorName(replyTo, people)}</span>
              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setReplyTo(null)}><X className="h-3 w-3" /></Button>
            </div>
          )}
          <Textarea
            ref={ta}
            value={draft}
            onChange={e => onDraftChange(e.target.value)}
            placeholder="Write a comment… use @ to mention"
            className="min-h-[70px] text-sm"
          />
          {mentionOpen && filteredPeople.length > 0 && (
            <div className="absolute bottom-24 left-3 right-3 border bg-popover rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
              {filteredPeople.map(p => (
                <button key={p.user_id} type="button"
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent/10"
                  onClick={() => pickMention(p)}>
                  <span className="font-medium">{`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email}</span>
                  <span className="text-muted-foreground ml-2">{p.email}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button size="sm" onClick={submit} disabled={!draft.trim()}>Post</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function authorName(c: Comment, people: ProfileLite[]) {
  const p = people.find(x => x.user_id === c.author_id);
  if (!p) return "Someone";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email;
}

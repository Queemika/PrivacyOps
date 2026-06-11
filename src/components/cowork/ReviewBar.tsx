import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { useMyRoles } from "@/lib/roles/store";
import { can, nextStatus, STATUS_LABEL, STATUS_TONE, WorkableStatus, Action } from "@/lib/permissions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Table = "pia_records" | "drl_rows" | "inspection_records" | "tsa_records" | "ropa_records";

export function ReviewBar({
  table, recordId, status, onChanged,
}: {
  table: Table;
  recordId: string;
  status: WorkableStatus;
  onChanged?: (s: WorkableStatus) => void;
}) {
  const { roles } = useMyRoles();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(action: Action) {
    const next = nextStatus(status, action);
    if (!next) return;
    if (action === "reject" && !comment.trim()) { toast.error("Reason required to reject."); return; }
    setBusy(true);
    const { data: row } = await supabase.from(table).select("review_history").eq("id", recordId).maybeSingle();
    const history = Array.isArray(row?.review_history) ? row!.review_history : [];
    const entry = {
      at: new Date().toISOString(),
      by: user?.email,
      action,
      from: status,
      to: next,
      comment: comment.trim() || null,
    };
    const { error } = await supabase
      .from(table)
      .update({ status: next, review_history: [...history, entry], updated_by: user?.id })
      .eq("id", recordId);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setComment("");
    onChanged?.(next);
    toast.success(`Moved to ${STATUS_LABEL[next]}`);
  }

  const canSubmit = can("submit", roles, status);
  const canLead = can("leadApprove", roles, status);
  const canFinal = can("finalApprove", roles, status);
  const canReject = can("reject", roles, status);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-[11px] font-semibold px-2 py-1 rounded ${STATUS_TONE[status]}`}>
        {STATUS_LABEL[status]}
      </span>
      {canSubmit && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => act("submit")}>
          <Send className="h-3.5 w-3.5 mr-1.5" />Submit for review
        </Button>
      )}
      {canLead && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => act("leadApprove")}>
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Lead approve
        </Button>
      )}
      {canFinal && (
        <Button size="sm" disabled={busy} onClick={() => act("finalApprove")}>
          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Sign off
        </Button>
      )}
      {canReject && (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="text-destructive">
              <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Reason for rejection (required)"
              className="text-xs"
            />
            <Button size="sm" className="w-full mt-2" variant="destructive" disabled={busy} onClick={() => act("reject")}>
              Send back to preparer
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

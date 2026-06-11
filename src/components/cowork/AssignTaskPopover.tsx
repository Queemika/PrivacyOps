import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { listProfiles, ProfileLite } from "@/lib/roles/store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function AssignTaskPopover({
  module, recordId, engagementId, trigger,
}: {
  module: string;
  recordId: string;
  engagementId: string;
  trigger?: React.ReactNode;
}) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [assignee, setAssignee] = useState("");
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) listProfiles().then(setProfiles); }, [open]);

  async function submit() {
    if (!assignee) { toast.error("Pick an assignee"); return; }
    setBusy(true);
    const { error } = await supabase.from("module_assignments").insert({
      module,
      record_id: recordId,
      engagement_id: engagementId || null,
      assignee_id: assignee,
      assigned_by: user?.id,
      due_date: due || null,
      notes: notes || null,
      status: "open",
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Task assigned");
    setOpen(false); setAssignee(""); setDue(""); setNotes("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || <Button size="sm" variant="outline"><UserPlus className="h-3.5 w-3.5 mr-1.5" />Assign</Button>}
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3">
        <div>
          <Label className="text-xs">Assignee</Label>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Pick a user" /></SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.user_id} value={p.user_id}>
                  {`${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Due date</Label>
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-9" />
        </div>
        <div>
          <Label className="text-xs">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="text-xs" placeholder="Optional context" />
        </div>
        <Button size="sm" className="w-full" disabled={busy} onClick={submit}>Assign task</Button>
      </PopoverContent>
    </Popover>
  );
}

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Clock, ListChecks } from "lucide-react";

interface Task {
  id: string;
  module: string;
  record_id: string | null;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  assigned_by: string | null;
}

const STATUS = ["open", "in_progress", "done"];

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("module_assignments")
      .select("id,module,record_id,status,due_date,notes,created_at,assigned_by")
      .eq("assignee_id", user.id)
      .order("created_at", { ascending: false });
    setTasks((data || []) as Task[]);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("module_assignments").update({ status }).eq("id", id);
    load();
  }

  const groups: Record<string, Task[]> = {};
  tasks.forEach((t) => { (groups[t.status] ||= []).push(t); });

  return (
    <PageShell title="My Tasks" subtitle="Items assigned to you across all modules.">
      <div className="grid md:grid-cols-3 gap-4">
        {STATUS.map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold capitalize text-sm flex items-center gap-2">
                  {s === "done" ? <CheckCircle2 className="h-4 w-4 text-success" /> : s === "in_progress" ? <Clock className="h-4 w-4 text-warning" /> : <ListChecks className="h-4 w-4 text-accent" />}
                  {s.replace("_", " ")}
                </h3>
                <Badge variant="secondary">{(groups[s] || []).length}</Badge>
              </div>
              <div className="space-y-2">
                {(groups[s] || []).map((t) => (
                  <div key={t.id} className="border rounded p-2 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <Link to={`/${t.module}${t.record_id ? `/${t.record_id}` : ""}`} className="font-medium hover:underline">
                        {t.module}
                      </Link>
                      {t.due_date && <span className="text-muted-foreground">{t.due_date}</span>}
                    </div>
                    {t.notes && <p className="text-muted-foreground">{t.notes}</p>}
                    <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS.map((x) => <SelectItem key={x} value={x}>{x.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {(groups[s] || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Nothing here.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

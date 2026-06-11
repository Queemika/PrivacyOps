import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChangeRow {
  id: string;
  user_email: string | null;
  action: string;
  field_path: string | null;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
}

export function RecordHistory({ table, recordId }: { table: string; recordId: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ChangeRow[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("change_log")
        .select("id,user_email,action,field_path,old_value,new_value,created_at")
        .eq("table_name", table)
        .eq("record_id", recordId)
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data || []) as ChangeRow[]);
    })();
  }, [open, table, recordId]);

  const fmt = (v: unknown) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "string") return v;
    return JSON.stringify(v).slice(0, 120);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline"><History className="h-3.5 w-3.5 mr-1.5" />History</Button>
      </SheetTrigger>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader><SheetTitle>Record history</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-2">
          {rows.length === 0 && <p className="text-xs text-muted-foreground">No changes recorded yet.</p>}
          {rows.map((r) => (
            <div key={r.id} className="border rounded p-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{r.user_email || "system"}</span>
                <span>{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div className="font-medium mt-1">
                {r.action}{r.field_path ? ` · ${r.field_path}` : ""}
              </div>
              {r.action === "update" && (
                <div className="grid grid-cols-2 gap-2 mt-1 text-[11px]">
                  <div className="bg-destructive/5 p-1.5 rounded font-mono break-all">{fmt(r.old_value)}</div>
                  <div className="bg-success/5 p-1.5 rounded font-mono break-all">{fmt(r.new_value)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

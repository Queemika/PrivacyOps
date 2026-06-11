import { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollText, Download, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyRoles } from "@/lib/roles/store";
import { supabase } from "@/integrations/supabase/client";

interface ChangeRow {
  id: string;
  table_name: string;
  record_id: string;
  user_email: string | null;
  action: string;
  field_path: string | null;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
}
interface SystemRow {
  id: string;
  created_at: string;
  user_email: string | null;
  action: string;
  target: string | null;
}

function fmt(v: unknown) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  return JSON.stringify(v).slice(0, 200);
}

export default function AuditLog() {
  const { user } = useAuth();
  const { isAdmin } = useMyRoles();
  const [tab, setTab] = useState("workables");
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [sys, setSys] = useState<SystemRow[]>([]);
  const [search, setSearch] = useState("");
  const [moduleF, setModuleF] = useState<string>("all");
  const [actionF, setActionF] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("change_log")
        .select("id,table_name,record_id,user_email,action,field_path,old_value,new_value,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      setChanges((data || []) as ChangeRow[]);
    })();
    (async () => {
      const { data } = await supabase
        .from("audit_log")
        .select("id,created_at,user_email,action,target")
        .order("created_at", { ascending: false })
        .limit(500);
      setSys((data || []) as SystemRow[]);
    })();
  }, [user]);

  const filtered = useMemo(() => changes.filter((c) => {
    if (moduleF !== "all" && c.table_name !== moduleF) return false;
    if (actionF !== "all" && c.action !== actionF) return false;
    if (search) {
      const hay = `${c.user_email} ${c.field_path} ${fmt(c.old_value)} ${fmt(c.new_value)}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [changes, moduleF, actionF, search]);

  function exportCsv() {
    const rows = [["timestamp", "user", "table", "record", "action", "field", "old", "new"]];
    filtered.forEach((c) => rows.push([
      c.created_at, c.user_email || "", c.table_name, c.record_id, c.action,
      c.field_path || "", fmt(c.old_value), fmt(c.new_value),
    ]));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit-log-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!isAdmin) {
    return (
      <PageShell title="Audit Log" subtitle="Admin only">
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
          You don't have permission to view the audit log.
        </CardContent></Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Audit Log" subtitle="Tamper-evident trail of every change across the platform."
      actions={<Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="workables">Workable changes</TabsTrigger>
          <TabsTrigger value="system">System events</TabsTrigger>
        </TabsList>
        <TabsContent value="workables">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Input placeholder="Search user, field, value…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-64" />
            <Select value={moduleF} onValueChange={setModuleF}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                <SelectItem value="pia_records">PIA</SelectItem>
                <SelectItem value="drl_rows">DRL</SelectItem>
                <SelectItem value="inspection_records">Inspection</SelectItem>
                <SelectItem value="tsa_records">TSA</SelectItem>
                <SelectItem value="ropa_records">ROPA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionF} onValueChange={setActionF}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="insert">Insert</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="status_change">Status change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b text-xs text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5 w-44">Timestamp</th>
                  <th className="text-left font-medium px-4 py-2.5">User</th>
                  <th className="text-left font-medium px-4 py-2.5">Module</th>
                  <th className="text-left font-medium px-4 py-2.5">Action</th>
                  <th className="text-left font-medium px-4 py-2.5">Field</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <>
                    <tr key={c.id} className="border-b hover:bg-muted/20 cursor-pointer" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                      <td className="px-4 py-2.5 font-mono text-xs">{new Date(c.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.user_email || "—"}</td>
                      <td className="px-4 py-2.5">{c.table_name}</td>
                      <td className="px-4 py-2.5"><span className="inline-flex items-center gap-2"><ScrollText className="h-3.5 w-3.5 text-accent" />{c.action}</span></td>
                      <td className="px-4 py-2.5 font-mono text-xs">{c.field_path || "—"}</td>
                      <td className="px-2"><ChevronRight className={`h-4 w-4 transition-transform ${expanded === c.id ? "rotate-90" : ""}`} /></td>
                    </tr>
                    {expanded === c.id && (
                      <tr key={`${c.id}-d`} className="bg-muted/10 border-b">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-muted-foreground mb-1">Before</div>
                              <div className="bg-destructive/5 p-2 rounded font-mono whitespace-pre-wrap break-all">{fmt(c.old_value)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">After</div>
                              <div className="bg-success/5 p-2 rounded font-mono whitespace-pre-wrap break-all">{fmt(c.new_value)}</div>
                            </div>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-2">Record: <span className="font-mono">{c.record_id}</span></div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No changes match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="system">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b text-xs text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5 w-44">Timestamp</th>
                  <th className="text-left font-medium px-4 py-2.5">User</th>
                  <th className="text-left font-medium px-4 py-2.5">Action</th>
                  <th className="text-left font-medium px-4 py-2.5">Target</th>
                </tr>
              </thead>
              <tbody>
                {sys.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono text-xs">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{a.user_email || "—"}</td>
                    <td className="px-4 py-2.5">{a.action}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{a.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

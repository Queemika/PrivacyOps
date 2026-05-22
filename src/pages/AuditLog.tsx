import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auditTrail } from "@/lib/mockData";
import { loadAudit, clearAudit, AuditEntry } from "@/lib/auditLog";
import { Button } from "@/components/ui/button";

export default function AuditLog() {
  const { user, auditLog } = useAuth();
  const [client, setClient] = useState<AuditEntry[]>([]);
  useEffect(() => { setClient(loadAudit()); }, []);
  const isAdmin = (localStorage.getItem("pa_role") || "user") === "admin";

  if (!isAdmin) {
    return (
      <PageShell title="Audit Log" subtitle="Admin only">
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
          You don't have permission to view the audit log. Switch to the Admin role in <a href="/settings" className="text-accent underline">Settings</a>.
        </CardContent></Card>
      </PageShell>
    );
  }

  const merged = [
    ...client.map(c => ({ ts: c.ts, user: c.user, action: c.action, target: c.target })),
    ...auditLog,
    ...auditTrail,
  ];

  return (
    <PageShell title="Audit Log" subtitle="Tamper-evident trail of every action performed in the platform."
      actions={<Button variant="outline" onClick={() => { clearAudit(); setClient([]); }}>
        <Trash2 className="h-4 w-4 mr-1.5" />Clear client log
      </Button>}>
      <Card>
        <CardContent className="p-0">
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
              {merged.map((a, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{a.ts}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.user}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><ScrollText className="h-3.5 w-3.5 text-accent" />{a.action}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{a.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageShell>
  );
}

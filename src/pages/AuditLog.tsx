import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { auditTrail } from "@/lib/mockData";
import { ScrollText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuditLog() {
  const { auditLog } = useAuth();
  const merged = [...auditLog, ...auditTrail];

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Tamper-evident audit trail of every action — uploads, generations, validations, anonymization, and forwards. Each action is associated with the signed-in user."
      />
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
    </>
  );
}

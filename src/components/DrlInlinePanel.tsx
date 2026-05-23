import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { DrlCategory, DrlRow, loadDrl } from "@/lib/drl/store";
import { useEffect, useState } from "react";

interface Props { category: DrlCategory; title?: string; piaId?: string; }

const STATUS_TONE: Record<string, string> = {
  Open: "bg-rose-100 text-rose-700",
  "Partially Received": "bg-amber-100 text-amber-700",
  "Under Inspection": "bg-blue-100 text-blue-700",
  Closed: "bg-emerald-100 text-emerald-700",
  Completed: "bg-emerald-100 text-emerald-700",
  "Not Applicable": "bg-slate-100 text-slate-600",
};

export function DrlInlinePanel({ category, title, piaId }: Props) {
  const [rows, setRows] = useState<DrlRow[]>([]);
  useEffect(() => {
    let r = loadDrl().filter(x => x.category === category);
    if (piaId) r = r.filter(x => x.fields.piaId === piaId);
    setRows(r);
  }, [category, piaId]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">{title || "DRL / IRL items"}</h3>
            <p className="text-[11px] text-muted-foreground">Showing rows scoped to this workable.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/drl?tab=${category}`}><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Open full DRL</Link>
          </Button>
        </div>
        {rows.length === 0 ? (
          <div className="p-6 text-sm text-center text-muted-foreground">
            No DRL items yet for this workable. <Link to={`/drl?tab=${category}`} className="text-accent underline">Add in DRL →</Link>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-2 w-16">No.</th>
                <th className="text-left font-medium px-3 py-2">Request / Description</th>
                <th className="text-left font-medium px-3 py-2 w-28">Requested</th>
                <th className="text-left font-medium px-3 py-2 w-28">Received</th>
                <th className="text-left font-medium px-3 py-2 w-36">Status</th>
                <th className="text-left font-medium px-3 py-2 w-40">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const desc = r.fields.request || r.fields.proof || r.fields.item || r.fields.requirement || r.fields.field || "—";
                return (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono">{r.no}</td>
                    <td className="px-3 py-2"><div className="line-clamp-2">{desc}</div></td>
                    <td className="px-3 py-2 text-muted-foreground">{r.dateRequested || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.dateReceived || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_TONE[r.status] || "bg-muted text-muted-foreground"}`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.remarks || r.fields.remarks || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

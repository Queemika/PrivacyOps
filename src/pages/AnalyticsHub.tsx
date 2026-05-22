import { PageShell } from "@/components/ui/PageShell";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { mockPIAs } from "@/lib/mockData";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileText, AlertTriangle, ShieldCheck, Activity } from "lucide-react";

const RISK = [
  { name: "Low", value: 12, fill: "hsl(var(--success))" },
  { name: "Medium", value: 8, fill: "hsl(var(--warning))" },
  { name: "High", value: 4, fill: "hsl(var(--destructive))" },
  { name: "Critical", value: 1, fill: "hsl(252 80% 55%)" },
];

const STATUS = [
  { name: "Draft", value: mockPIAs.filter((p) => p.status === "Draft").length },
  { name: "For Finalization", value: mockPIAs.filter((p) => p.status === "For Finalization").length },
  { name: "Final", value: mockPIAs.filter((p) => p.status === "Final").length },
];

export default function AnalyticsHub() {
  const high = RISK.find((r) => r.name === "High")?.value ?? 0;
  return (
    <PageShell title="Analytics" subtitle="Distribution of PIAs, risks, and processing activities">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="PIAs assessed" value={mockPIAs.length} icon={FileText} accent="blue" />
        <StatTile label="High risks" value={high} icon={AlertTriangle} accent="rose" />
        <StatTile label="Mitigated" value={9} icon={ShieldCheck} accent="green" />
        <StatTile label="Active reviews" value={3} icon={Activity} accent="violet" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Risk distribution</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={RISK} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {RISK.map((r) => <Cell key={r.name} fill={r.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center text-xs mt-2">
              {RISK.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.fill }} /> {r.name} ({r.value})</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">PIAs by status</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={STATUS}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

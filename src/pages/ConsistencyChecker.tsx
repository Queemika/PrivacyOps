import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, GitCompare } from "lucide-react";

const issues = [
  { phase: "Phase 1 vs Phase 2", field: "Data sharing", p1: "No third-party sharing mentioned", p2: "Payroll vendor + BG Check (HK)", severity: "High", suggestion: "Update Phase 1 'Sharing' field to include both vendors." },
  { phase: "Phase 2 vs Phase 3", field: "SPI handling", p1: "Medical certs stored", p2: "Risk for SPI not flagged", severity: "Medium", suggestion: "Add Phase 3 risk: 'SPI exposure' with mitigation." },
  { phase: "Phase 1 vs Phase 2", field: "Retention period", p1: "5 years", p2: "10 years (payroll)", severity: "Medium", suggestion: "Clarify whether 5 or 10 yrs applies; add lawful-basis citation." },
  { phase: "Phase 2 vs Phase 3", field: "Disposal", p1: "—", p2: "Cryptographic erasure", severity: "Low", suggestion: "Mention disposal method in Phase 1 system overview." },
];

const passed = [
  "Lawful basis consistent across all phases",
  "Data subjects categories aligned",
  "Cross-border declaration matches sharing list",
];

export default function ConsistencyChecker() {
  return (
    <>
      <PageHeader
        title="PIA Consistency Checker"
        description="Detect mismatches across Phase 1, 2, and 3 of a PIA. Suggested fixes can be applied in one click."
        actions={<Button><GitCompare className="mr-2 h-4 w-4" />Re-check</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Inconsistencies</div>
          <div className="text-3xl font-semibold mt-1 text-warning">{issues.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Checks passed</div>
          <div className="text-3xl font-semibold mt-1 text-success">{passed.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Severity (max)</div>
          <div className="text-3xl font-semibold mt-1 text-destructive">High</div>
        </CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold">Issues found</h3>
          </div>
          <div className="divide-y">
            {issues.map((it, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="text-xs text-accent font-medium">{it.phase} · {it.field}</div>
                    <div className="text-sm font-medium mt-0.5">Mismatch: {it.field}</div>
                  </div>
                  <span className={`status-chip ${
                    it.severity === "High" ? "bg-destructive/10 text-destructive border-destructive/30"
                    : it.severity === "Medium" ? "bg-warning/10 text-warning border-warning/30"
                    : "bg-success/10 text-success border-success/30"}`}>{it.severity}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-3 rounded bg-muted/40"><span className="text-muted-foreground">Reference A:</span> {it.p1}</div>
                  <div className="p-3 rounded bg-muted/40"><span className="text-muted-foreground">Reference B:</span> {it.p2}</div>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="text-foreground"><strong className="text-accent">Suggested fix:</strong> {it.suggestion}</div>
                  <Button size="sm" variant="outline">Apply fix</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold">Checks passed</h3>
          </div>
          <ul className="divide-y">
            {passed.map((p, i) => (
              <li key={i} className="px-4 py-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />{p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

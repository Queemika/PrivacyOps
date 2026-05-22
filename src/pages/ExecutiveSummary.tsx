import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { loadPias } from "@/lib/pia/store";
import { Pia } from "@/lib/pia/schema";
import { aggregate, ExecAggregate } from "@/lib/analytics/executiveSummary";
import { Download, Filter } from "lucide-react";
import { RelatedLinks } from "@/components/RelatedLinks";
import { FileText, BookOpen, Mail, ShieldAlert, Table2 } from "lucide-react";

const PURPOSE_TEMPLATE = `The PIA evaluates the privacy risks associated with the collection, use, sharing, storage, and disposal of personal data processed through Client systems, which support its mandate to deliver public services, implement local programs, and perform local governance functions. It seeks to ensure lawful and secure processing aligned with applicable data protection laws.`;

const SCOPE_TEMPLATE = `The PIA covers the full data lifecycle of all DPS, including: Data Collection (from complainants, clients, partners, employees), Data Use and Storage (filing cabinets, on-premise and cloud-based platforms with role-based access controls), Data Sharing, Outsourcing, and Cross-Border Transfer (external partners and accredited service providers), Retention and Disposal (aligned with legal mandates; disposal via secure destruction / deletion).`;

export default function ExecutiveSummary() {
  const [pias, setPias] = useState<Pia[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const all = loadPias();
    setPias(all);
    setSelected(new Set(all.map(p => p.id)));
  }, []);

  const active = useMemo(() => pias.filter(p => selected.has(p.id)), [pias, selected]);
  const agg = useMemo(() => aggregate(active), [active]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const exportCSV = () => {
    const lines = [
      ["Section", "Metric", "Value"],
      ["01 Overview", "# DPS", agg.totalDps],
      ["01 Overview", "Full PIA", agg.fullPia],
      ["01 Overview", "Phase 1 Only", agg.phase1Only],
      ["01.1 DPS", "Existing", agg.existing],
      ["01.1 DPS", "New", agg.newDps],
      ["01.1 DPS", "Consolidated", agg.consolidated],
      ["01.1 DPS", "Individual", agg.individual],
      ["03.1 Collect", "PI records", agg.piRecords],
      ["03.1 Collect", "SPI records", agg.spiRecords],
      ["03.1 Collect", "Privileged records", agg.privRecords],
      ["03.2 Use & Store", "Total info", agg.totalInfo],
      ["03.2 Use & Store", "With repository", agg.withRepository],
      ["03.2 Use & Store", "Without repository", agg.withoutRepository],
      ["03.2 Use & Store", "Electronic", agg.electronicCount],
      ["03.2 Use & Store", "Physical", agg.physicalCount],
      ["03.3 Disclose", "With sharing", agg.withSharing],
      ["03.3 Disclose", "With DSA", agg.withDSA],
      ["03.3 Disclose", "With cross-border", agg.withCrossBorder],
      ["03.4 Retention", "Avg days", agg.avgRetentionDays],
      ["03.4 Retention", "Avg years", agg.avgRetentionYears],
      ["03.5 Disposal", "With disposal", agg.withDisposal],
      ["03.5 Disposal", "Without disposal", agg.withoutDisposal],
      ["08 Conclusion", "Overall risk band", agg.overallRiskBand],
    ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([lines], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "executive_summary.csv"; a.click();
  };

  return (
    <PageShell
      title="Executive Summary"
      subtitle="Live narrative + analytics aggregated from Phase 2 and Phase 3 of selected PIAs."
      actions={
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1" />PIAs ({selected.size}/{pias.length})</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 max-h-96 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Include PIAs</h4>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelected(new Set(pias.map(p => p.id)))}>All</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelected(new Set())}>None</Button>
                </div>
              </div>
              <div className="space-y-1">
                {pias.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded">
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                    <span className="truncate">{p.title}</span>
                  </label>
                ))}
                {pias.length === 0 && <div className="p-2 text-xs text-muted-foreground">No PIAs yet.</div>}
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" />Export CSV</Button>
        </>
      }
    >
      {pias.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No PIAs available. Create one to begin.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <PiaStatusCard active={active} />
          <Section id="01" title="Overview">
            <Grid>
              <Metric label="# DPS" value={agg.totalDps} />
              <Metric label="Full PIA" value={agg.fullPia} />
              <Metric label="Phase 1 Only" value={agg.phase1Only} />
            </Grid>
          </Section>

          <Section id="01.1" title="Data Processing System">
            <Grid>
              <Metric label="Existing DPS" value={agg.existing} />
              <Metric label="New DPS" value={agg.newDps} />
              <Metric label="Consolidated" value={agg.consolidated} />
              <Metric label="Individual" value={agg.individual} />
            </Grid>
            {agg.consolidatedGroups.length > 0 && (
              <div className="mt-3 text-xs">
                <div className="font-medium mb-1">Consolidated groups</div>
                {agg.consolidatedGroups.map(g => (
                  <div key={g.groupId} className="text-muted-foreground">{g.groupId}: {g.components.join(", ") || "(none listed)"}</div>
                ))}
              </div>
            )}
          </Section>

          <Section id="02" title="Purpose">
            <p className="text-sm leading-relaxed">{PURPOSE_TEMPLATE}</p>
          </Section>
          <Section id="03" title="Scope">
            <p className="text-sm leading-relaxed">{SCOPE_TEMPLATE}</p>
          </Section>

          <Section id="03.1" title="Collect — Type of Personal Data">
            <Grid>
              <Metric label="PI records" value={agg.piRecords} />
              <Metric label="SPI records" value={agg.spiRecords} />
              <Metric label="Privileged records" value={agg.privRecords} />
            </Grid>
            <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs">
              <SourceBreakdown label="External-facing" value={agg.externalCount} />
              <SourceBreakdown label="Internal-facing" value={agg.internalCount} />
              <SourceBreakdown label="Both" value={agg.bothCount} />
            </div>
          </Section>

          <Section id="03.1.2" title="Legal Basis for Processing">
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <BasisList title="Personal Information" counts={agg.basisPI} />
              <BasisList title="Sensitive Personal Information" counts={agg.basisSPI} />
            </div>
          </Section>

          <Section id="03.2" title="Use & Store">
            <Grid>
              <Metric label="Total info records" value={agg.totalInfo} />
              <Metric label="With repository" value={agg.withRepository} />
              <Metric label="Without repository" value={agg.withoutRepository} />
              <Metric label="With retention" value={agg.withRetention} />
              <Metric label="Without retention" value={agg.withoutRetention} />
              <Metric label="Electronic" value={agg.electronicCount} />
              <Metric label="Physical" value={agg.physicalCount} />
              <Metric label="Unspecified" value={agg.unspecifiedCount} />
            </Grid>
          </Section>

          <Section id="03.3" title="Disclose">
            <Grid>
              <Metric label="With sharing" value={agg.withSharing} />
              <Metric label="No sharing" value={agg.withoutSharing} />
              <Metric label="With DSA" value={agg.withDSA} />
              <Metric label="Without DSA" value={agg.withoutDSA} />
              <Metric label="Cross-border" value={agg.withCrossBorder} />
              <Metric label="No cross-border" value={agg.withoutCrossBorder} />
            </Grid>
          </Section>

          <Section id="03.4" title="Retention">
            <Grid>
              <Metric label="Avg retention (days)" value={agg.avgRetentionDays} />
              <Metric label="Avg retention (years)" value={agg.avgRetentionYears} />
            </Grid>
          </Section>

          <Section id="03.5" title="Disposal">
            <Grid>
              <Metric label="With disposal" value={agg.withDisposal} />
              <Metric label="Without disposal" value={agg.withoutDisposal} />
              <Metric label="N/A (Permanent)" value={agg.disposalNA} />
              <Metric label="To Be Determined" value={agg.disposalTBD} />
            </Grid>
          </Section>

          <Section id="06" title="Key Risks Identified (Phase 3 Matrix)">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <RiskMatrixCard title="General Data Privacy Principles" b={agg.riskMatrix.principles} />
              <RiskMatrixCard title="Data Subject Rights" b={agg.riskMatrix.rights} />
              <RiskMatrixCard title="Data Security" b={agg.riskMatrix.security} />
              <RiskMatrixCard title="Cross-Border Data Flows" b={agg.riskMatrix.crossBorder} />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <TopRisks title="Top — Principles" items={agg.topRisks.principles} />
              <TopRisks title="Top — Rights" items={agg.topRisks.rights} />
              <TopRisks title="Top — Security" items={agg.topRisks.security} />
              <TopRisks title="Top — Cross-Border" items={agg.topRisks.crossBorder} />
            </div>
          </Section>

          <Section id="07" title="Mitigation Measures (Top 5)">
            {agg.topMitigation.length === 0
              ? <div className="text-sm text-muted-foreground">No mitigations recorded in Phase 3 yet.</div>
              : <ol className="list-decimal list-inside text-sm space-y-1">
                  {agg.topMitigation.map(m => <li key={m.measure}>{m.measure} <Badge variant="secondary" className="ml-2 text-[10px]">×{m.count}</Badge></li>)}
                </ol>}
          </Section>

          <Section id="08" title="Conclusion">
            <p className="text-sm leading-relaxed">
              While the PIAs identified <strong>{agg.overallRiskBand}</strong> privacy risks, these are manageable
              with the proposed mitigation measures. With safeguards in place, the DPS will be considered compliant
              with the Data Privacy Act of 2012, its IRR, and relevant NPC guidelines. Client remains committed to
              continuous improvement in data protection through regular reviews, capacity-building, and proactive
              risk mitigation strategies.
            </p>
          </Section>

          <Section id="09" title="Annexes">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                "A. Full List of PIAs (Individually Assessed and Consolidated)",
                "B. Data Collection",
                "C. Data Use and Storage",
                "D. Data Sharing, Outsourcing, and Cross-Border Transfer",
                "E. Retention",
                "F. Disposal",
                "G. Legal Basis for Processing Personal Data",
              ].map(a => (
                <a key={a} href="/library" className="p-3 rounded border hover:bg-muted/40 flex items-center justify-between">
                  <span>{a}</span><Download className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </Section>
        </div>
      )}

      <RelatedLinks
        title="Drill through"
        links={[
          { to: "/library", label: "PIA Library", icon: FileText },
          { to: "/compile", label: "Compilation Builder", icon: BookOpen },
          { to: "/ropa", label: "ROPA / NPC-RS", icon: Table2 },
          { to: "/drl", label: "DRL / IRL", icon: ShieldAlert },
          { to: "/email?source=summary", label: "Send progress report", icon: Mail },
        ]}
      />
    </PageShell>
  );
}

function PiaStatusCard({ active }: { active: Pia[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-2.5 border-b bg-muted/40 text-sm font-semibold">PIA Status</div>
        <table className="w-full text-xs">
          <thead className="bg-muted/20 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2">PIA</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">DPS Status</th>
              <th className="text-left px-3 py-2">Scope</th>
              <th className="text-left px-3 py-2">Components</th>
            </tr>
          </thead>
          <tbody>
            {active.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 font-medium">{p.title}</td>
                <td className="px-3 py-2">{p.type === "Full" ? "Full PIA" : "Phase 1 only"}</td>
                <td className="px-3 py-2">{p.dpsStatus}</td>
                <td className="px-3 py-2">{p.scope}</td>
                <td className="px-3 py-2 text-muted-foreground">{(p.consolidatedComponents || []).join(", ") || "—"}</td>
              </tr>
            ))}
            {active.length === 0 && <tr><td className="px-3 py-3 text-muted-foreground" colSpan={5}>No PIAs selected.</td></tr>}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-baseline gap-2">
          <span className="text-accent font-mono text-xs">{id}</span> {title}
        </h3>
        {children}
      </CardContent>
    </Card>
  );
}
const Grid = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">{children}</div>;
const Metric = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded border bg-muted/20 p-3">
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-xl font-semibold tabular-nums mt-0.5">{value}</div>
  </div>
);
const SourceBreakdown = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between rounded border p-2">
    <span className="text-muted-foreground">{label}</span><span className="font-semibold tabular-nums">{value}</span>
  </div>
);
const BasisList = ({ title, counts }: { title: string; counts: Record<string, number> }) => {
  const entries = Object.entries(counts);
  return (
    <div>
      <div className="font-medium mb-1">{title}</div>
      {entries.length === 0 ? <div className="text-muted-foreground">No data</div> : (
        <ul className="space-y-1">
          {entries.map(([k, v]) => <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span className="font-semibold tabular-nums">{v}</span></li>)}
        </ul>
      )}
    </div>
  );
};
const RiskMatrixCard = ({ title, b }: { title: string; b: { yes: number; no: number; na: number; blank: number } }) => (
  <Card><CardContent className="p-3">
    <div className="font-medium text-xs mb-2">{title}</div>
    <div className="grid grid-cols-4 gap-1 text-center">
      <div><div className="text-base font-semibold tabular-nums text-green-600">{b.yes}</div><div className="text-[9px] uppercase text-muted-foreground">Yes</div></div>
      <div><div className="text-base font-semibold tabular-nums text-rose-600">{b.no}</div><div className="text-[9px] uppercase text-muted-foreground">No</div></div>
      <div><div className="text-base font-semibold tabular-nums text-muted-foreground">{b.na}</div><div className="text-[9px] uppercase text-muted-foreground">N/A</div></div>
      <div><div className="text-base font-semibold tabular-nums text-muted-foreground">{b.blank}</div><div className="text-[9px] uppercase text-muted-foreground">—</div></div>
    </div>
  </CardContent></Card>
);
const TopRisks = ({ title, items }: { title: string; items: { id: string; piaTitle: string; risk: string; rating: string }[] }) => (
  <Card><CardContent className="p-3">
    <div className="font-medium text-xs mb-2">{title}</div>
    {items.length === 0 ? <div className="text-[11px] text-muted-foreground">No high-rated risks</div> : (
      <ol className="space-y-1.5 text-[11px]">
        {items.map((r, i) => (
          <li key={`${r.id}-${i}`} className="border-l-2 pl-2 border-rose-400">
            <div className="font-medium">{r.risk}</div>
            <div className="text-muted-foreground">{r.piaTitle} · <span className="font-mono">{r.rating}</span></div>
          </li>
        ))}
      </ol>
    )}
  </CardContent></Card>
);

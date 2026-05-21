import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, FileText, Table2, ShieldAlert, ShieldCheck, Mail } from "lucide-react";
import { RelatedLinks } from "@/components/RelatedLinks";

const sections = [
  { id: "01", title: "Overview", body: "This compilation covers 4 Data Processing Systems across HR, Sales, Finance, and Procurement, processed by Acme Corp (PIC) with 3 contracted PIPs." },
  { id: "01.1", title: "Data Processing Systems", body: "HR Onboarding Portal · Customer CRM · Payroll Disbursement · Vendor Management." },
  { id: "02", title: "Purpose", body: "Lawful operations supporting employment lifecycle, customer relationship management, statutory payroll obligations, and vendor due diligence." },
  { id: "03", title: "Scope", body: "All Philippine entities and EU-resident data subjects. GDPR overlay applies to EU subjects; NPC PH primary regulator." },
  { id: "03.1", title: "Collection", body: "Direct from data subject (web forms, email, ID upload). No covert collection." },
  { id: "03.2", title: "Use & Storage", body: "Data stored in AWS Singapore and on-premise SQL. Encryption at rest (AES-256) and transit (TLS 1.3)." },
  { id: "03.3", title: "Disclosure", body: "Limited to contracted PIPs (payroll vendor, BG check). DSA/DPA in place for all sharing." },
  { id: "03.4", title: "Retention", body: "Ranges from 3 years (CRM) to 10 years (Payroll BIR). Auto-purge enforced." },
  { id: "03.5", title: "Disposal", body: "Cryptographic erasure with certificate of destruction; physical records shredded." },
  { id: "04", title: "Key Risks Identified", body: "Cross-border SPI transfer (HK); vendor access scope; potential retention drift." },
  { id: "08", title: "Mitigation Measures", body: "SCCs, vendor audits, RBAC + JIT, quarterly access reviews, automated retention jobs, SIEM alerting." },
  { id: "09", title: "Conclusion", body: "Residual risk assessed Low. Compilation ready for NPC registration submission pending DPO sign-off." },
];

const annexes = [
  { id: "A", title: "Full List of PIAs", count: 24 },
  { id: "B", title: "Data Collection", count: 24 },
  { id: "C", title: "Data Use & Storage", count: 24 },
  { id: "D", title: "Sharing / Cross-Border", count: 7 },
  { id: "E", title: "Retention Schedule", count: 24 },
  { id: "F", title: "Disposal Methods", count: 24 },
  { id: "G", title: "Legal Basis Mapping", count: 24 },
];

const metrics = [
  { label: "Total DPS", value: 4 },
  { label: "Cross-border", value: 1 },
  { label: "SPI involved", value: 2 },
  { label: "Avg retention", value: "5.5 yrs" },
  { label: "Vendors (PIP)", value: 3 },
  { label: "Open risks", value: 0 },
];

export default function ExecutiveSummary() {
  return (
    <>
      <PageHeader
        title="Executive Summary"
        description="Generated narrative + annexes from the active compilation. Q2 2026 NPC Submission."
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export PDF</Button>
            <Button><BookOpen className="mr-2 h-4 w-4" />Submit to NPC Workspace</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {metrics.map(m => (
          <Card key={m.label}><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{m.value}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-5">
            {sections.map(s => (
              <div key={s.id}>
                <h3 className="text-sm font-semibold flex items-baseline gap-2">
                  <span className="text-accent font-mono text-xs">{s.id}</span>
                  {s.title}
                </h3>
                <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit sticky top-20">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-3">Annexes</h3>
            <div className="space-y-1.5">
              {annexes.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent w-5">{a.id}</span>
                    <span className="text-sm">{a.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{a.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

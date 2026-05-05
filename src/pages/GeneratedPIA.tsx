import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusChip } from "@/components/StatusChip";
import { Download, Edit3, Sparkles, ShieldCheck, Send, FileLock2 } from "lucide-react";
import { toast } from "sonner";
import { anonymizeText } from "@/lib/anonymize";
import { transcriptSample } from "@/lib/mockData";

interface UploadRecord {
  id: string;
  fileName: string;
  anonymizedContent: string;
}

const phase1 = [
  ["DPS Name", "HR Onboarding Portal"],
  ["Owner / PIC", "People Operations — Acme Corp"],
  ["System Type", "Electronic"],
  ["Purpose", "Employment onboarding, payroll setup, pre-employment screening"],
  ["Scope", "All new hires (PH operations); reps onboarded via portal"],
  ["Data Subjects", "Job candidates, new employees"],
  ["Personal Data", "Full name, contact info, government IDs, bank details"],
  ["Sensitive PI", "Medical certificates (pre-employment)"],
  ["Volume", "~250 records / month"],
  ["Source of Data", "Direct from candidate; HR-uploaded documents"],
];

const phase2 = [
  ["Lawful Basis", "Contract performance (employment); Consent for SPI"],
  ["Use", "Identity verification, payroll setup, regulatory reporting"],
  ["Storage Location", "AWS Singapore (ap-southeast-1)"],
  ["Encryption", "AES-256 at rest, TLS 1.3 in transit"],
  ["Access Control", "RBAC; MFA enforced; quarterly access review"],
  ["Disclosure / Sharing", "Payroll vendor (PH); Background check (HK)"],
  ["Cross-Border", "Yes — Hong Kong (BG check provider)"],
  ["DSA / DPA Status", "Executed with both vendors"],
  ["Retention", "5 years post-separation; payroll 10 yrs (BIR)"],
  ["Disposal", "Cryptographic erasure; certificate of destruction"],
];

const phase3 = [
  { risk: "Cross-border transfer of SPI to HK vendor", likelihood: "Medium", impact: "High", mitigation: "Standard Contractual Clauses; data minimization; vendor audit annually", residual: "Low" },
  { risk: "Excessive vendor access scope", likelihood: "Medium", impact: "Medium", mitigation: "Just-in-time access; quarterly review; logging via SIEM", residual: "Low" },
  { risk: "SPI leakage via misconfigured S3", likelihood: "Low", impact: "High", mitigation: "Block public ACLs; bucket policy review; AWS Config rules", residual: "Low" },
  { risk: "Retention beyond 5 years", likelihood: "Medium", impact: "Medium", mitigation: "Auto-purge job; quarterly retention audit", residual: "Low" },
];

export default function GeneratedPIA() {
  const [edit, setEdit] = useState(false);
  return (
    <>
      <PageHeader
        title="HR Onboarding Portal — PIA"
        description="PIA-007 · Auto-generated 2026-04-30 09:14 · Confidence 87%"
        actions={
          <>
            <StatusChip status="Draft" />
            <Button variant="outline" onClick={() => setEdit(!edit)}><Edit3 className="mr-2 h-4 w-4" />{edit ? "Done editing" : "Edit"}</Button>
            <Button variant="outline"><Sparkles className="mr-2 h-4 w-4" />AI re-assess</Button>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Excel</Button>
            <Button onClick={() => toast.success("Sent to supervisor for validation")}>
              <ShieldCheck className="mr-2 h-4 w-4" />Send to Supervisor
            </Button>
          </>
        }
      />

      <Tabs defaultValue="p1">
        <TabsList>
          <TabsTrigger value="p1">Phase 1 — Project Context</TabsTrigger>
          <TabsTrigger value="p2">Phase 2 — Data Lifecycle</TabsTrigger>
          <TabsTrigger value="p3">Phase 3 — Risk & Mitigation</TabsTrigger>
        </TabsList>

        <TabsContent value="p1">
          <Card><CardContent className="p-0">
            <KVTable rows={phase1} editable={edit} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="p2">
          <Card><CardContent className="p-0">
            <KVTable rows={phase2} editable={edit} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="p3">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Risk</th>
                  <th className="text-left font-medium px-4 py-2.5">Likelihood</th>
                  <th className="text-left font-medium px-4 py-2.5">Impact</th>
                  <th className="text-left font-medium px-4 py-2.5">Mitigation</th>
                  <th className="text-left font-medium px-4 py-2.5">Residual</th>
                </tr>
              </thead>
              <tbody>
                {phase3.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3 max-w-xs">{r.risk}</td>
                    <td className="px-4 py-3"><StatusChip status={r.likelihood} /></td>
                    <td className="px-4 py-3"><StatusChip status={r.impact} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{r.mitigation}</td>
                    <td className="px-4 py-3"><StatusChip status={r.residual} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-4 bg-info/5 border-info/30">
        <CardContent className="p-4 flex items-center gap-3 text-sm">
          <Send className="h-4 w-4 text-info shrink-0" />
          <div className="flex-1">
            <strong>Validation workflow:</strong> Supervisor reviews → forwards to AM/Manager (final checker). Audit trail captured automatically.
          </div>
          <Button size="sm" variant="outline" onClick={() => toast("Forwarded to AM/Manager")}>Forward to AM</Button>
        </CardContent>
      </Card>
    </>
  );
}

function KVTable({ rows, editable }: { rows: string[][]; editable: boolean }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i} className="border-b last:border-0">
            <td className="px-4 py-3 font-medium w-48 bg-muted/20 align-top">{k}</td>
            <td className="px-4 py-3">
              {editable ? (
                <input defaultValue={v} className="w-full bg-transparent border-b border-dashed focus:border-accent outline-none" />
              ) : v}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

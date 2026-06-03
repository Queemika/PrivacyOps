import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ShieldCheck, FileText, Mail, ListChecks } from "lucide-react";
import { suggestFromTranscript } from "@/lib/tsa/autofill";

export type OutputKind = "pia" | "tsa" | "drl" | "email";

interface Props {
  kind: OutputKind;
  transcript: string;
  fileName: string;
}

export function OutputPreviewPane({ kind, transcript, fileName }: Props) {
  if (kind === "pia") return <PiaPreview text={transcript} />;
  if (kind === "tsa") return <TsaPreview text={transcript} />;
  if (kind === "drl") return <DrlPreview text={transcript} />;
  return <EmailPreview text={transcript} fileName={fileName} />;
}

// ---------- PIA ----------
function PiaPreview({ text }: { text: string }) {
  const hits = useMemo(() => {
    const has = (re: RegExp) => re.test(text);
    return {
      purpose: has(/onboard|payroll|performance|leave/i) ? "Employee data management for onboarding, payroll, and leave" : "Data processing activity (auto-detected)",
      subjects: has(/employee/i) ? "Employees" : "Data subjects",
      personal: ["Full name", "Birthdate", "TIN", "Bank account"].filter(() => has(/employee|hr|payroll/i)),
      sensitive: ["PhilHealth #", "SSS #", "Medical certs"].filter(() => has(/health|medical|philhealth|sss/i)),
      retention: has(/10 years|retention/i) ? "10 years after separation" : "Retention TBD",
      crossBorder: has(/aws|singapore|cross.?border/i) ? "AWS Singapore (backup)" : "None detected",
    };
  }, [text]);

  return (
    <Card>
      <CardContent className="p-5">
        <Header icon={<Sparkles className="h-4 w-4 text-accent" />} title="PIA — AI Extraction Preview" sub="Auto-filled Phase 1 fields from transcript." />
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <Field label="Purpose" value={hits.purpose} />
          <Field label="Data Subjects" value={hits.subjects} />
          <Field label="Retention" value={hits.retention} />
          <Field label="Cross-Border" value={hits.crossBorder} />
        </div>
        <BadgeRow label="Personal Information" items={hits.personal.length ? hits.personal : ["—"]} tone="bg-[hsl(var(--tile-blue-bg))] text-[hsl(var(--tile-blue-fg))]" />
        <BadgeRow label="Sensitive PI" items={hits.sensitive.length ? hits.sensitive : ["—"]} tone="bg-[hsl(var(--tile-rose-bg))] text-[hsl(var(--tile-rose-fg))]" />
      </CardContent>
    </Card>
  );
}

// ---------- TSA ----------
function TsaPreview({ text }: { text: string }) {
  const suggestions = useMemo(() => suggestFromTranscript(text), [text]);
  return (
    <Card>
      <CardContent className="p-5">
        <Header icon={<ShieldCheck className="h-4 w-4 text-accent" />} title="Tech Security — Affected Controls" sub={`${suggestions.length} control(s) inferred from transcript.`} />
        {suggestions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No specific controls mentioned in this transcript.</p>
        ) : (
          <ul className="divide-y border rounded-md">
            {suggestions.map((s) => (
              <li key={s.rowId} className="p-3 text-xs flex items-start gap-3">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5">{s.rowId}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{s.tool ?? "Control mentioned"}</div>
                  <div className="text-muted-foreground">{s.remarks}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success shrink-0">{s.status ?? "Detected"}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- DRL ----------
function DrlPreview({ text }: { text: string }) {
  const items = useMemo(() => extractDrl(text), [text]);
  return (
    <Card>
      <CardContent className="p-5">
        <Header icon={<ListChecks className="h-4 w-4 text-accent" />} title="DRL — Extracted Items" sub={`${items.length} document request(s) extracted.`} />
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Requirement</th>
                <th className="text-left px-3 py-2 w-32">Owner</th>
                <th className="text-left px-3 py-2 w-24">Due</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{it.req}</td>
                  <td className="px-3 py-2 text-muted-foreground">{it.owner}</td>
                  <td className="px-3 py-2 text-muted-foreground">{it.due}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">No action items detected.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Email ----------
function EmailPreview({ text, fileName }: { text: string; fileName: string }) {
  const items = useMemo(() => extractDrl(text), [text]);
  const summary = useMemo(() => {
    const firstLine = text.split(/\r?\n/).find(l => l.trim().length > 30) || "Discussion of data processing activities.";
    return firstLine.slice(0, 180) + (firstLine.length > 180 ? "…" : "");
  }, [text]);
  return (
    <Card>
      <CardContent className="p-5">
        <Header icon={<Mail className="h-4 w-4 text-accent" />} title="Email — Draft Follow-up" sub="Summary + DRL items pre-filled." />
        <div className="text-xs space-y-2 border rounded-md p-3 bg-muted/20">
          <div><span className="text-muted-foreground">Subject:</span> Follow-up — action items from {fileName}</div>
          <div className="border-t pt-2">
            <p>Hi team,</p>
            <p className="mt-2">Summary of our discussion: {summary}</p>
            <p className="mt-2">Outstanding document requests:</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {items.map((it, i) => <li key={i}>{it.req} — <span className="text-muted-foreground">{it.owner}</span></li>)}
              {items.length === 0 && <li className="text-muted-foreground">No items extracted.</li>}
            </ul>
            <p className="mt-2">Please share by end of week. Thanks.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- shared ----------
function Header({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-[12px]">{value}</div>
    </div>
  );
}
function BadgeRow({ label, items, tone }: { label: string; items: string[]; tone: string }) {
  return (
    <div className="mt-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((i, idx) => <span key={idx} className={`text-[10px] px-1.5 py-0.5 rounded ${tone}`}>{i}</span>)}
      </div>
    </div>
  );
}

function extractDrl(text: string): { req: string; owner: string; due: string }[] {
  const out: { req: string; owner: string; due: string }[] = [];
  const lines = text.split(/\r?\n/);
  const verbs = /\b(send|share|provide|submit|update|prepare|deliver)\b/i;
  for (const ln of lines) {
    if (!verbs.test(ln) || ln.length < 12) continue;
    const ownerMatch = /(HR|Legal|IT(?:\s+Security)?|Finance|DPO|Vendor)/i.exec(ln);
    const due = /\b(this week|next week|EOW|EOD|by Friday|by Monday)\b/i.exec(ln)?.[0] ?? "TBD";
    out.push({
      req: ln.trim().replace(/^[-•*\d.\s]+/, "").slice(0, 140),
      owner: ownerMatch?.[1] ?? "TBD",
      due,
    });
    if (out.length >= 6) break;
  }
  // Fallback seeds when the transcript doesn't include obvious verbs
  if (out.length === 0) {
    return [
      { req: "Provide updated DSA with payroll vendor", owner: "HR Lead", due: "this week" },
      { req: "Share SCC for cross-border BG-check provider", owner: "Legal", due: "EOW" },
      { req: "Submit latest access review report", owner: "IT Security", due: "next week" },
    ];
  }
  return out;
}

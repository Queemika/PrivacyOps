import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function EmailGenerator() {
  const [dps, setDps] = useState("HR Onboarding Portal");
  const [status, setStatus] = useState("For Finalization");
  const [deadline, setDeadline] = useState("2026-05-14");
  const [docs, setDocs] = useState("Updated DSA with payroll vendor; cross-border SCC with HK BG-check provider; latest access review report.");
  const [notes, setNotes] = useState("Please pay attention to the highlighted sections on retention and SPI handling.");

  const body = `Hi People Ops Team,

Thank you for the walkthrough of the ${dps}. Below is a summary of next steps and outstanding items based on our discussion.

Status: ${status}
Target close date: ${deadline}

Documents requested:
${docs.split(";").map(d => `  • ${d.trim()}`).join("\n")}

Notes:
${notes}

Kindly send the requested documents on or before ${deadline} so we can finalize the PIA and proceed with the NPC registration update.

Reminder: This communication and any attached materials are auto-generated and require human review before external use.

Best regards,
Maria Santos
Data Protection Officer — Acme Corp`;

  return (
    <>
      <PageHeader
        title="Walkthrough Email Generator"
        description="Generate a professional follow-up email after a privacy walkthrough."
        actions={<Button><Sparkles className="mr-2 h-4 w-4" />Re-generate</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-semibold mb-2">Inputs</h3>
          <Field label="DPS Name"><Input value={dps} onChange={(e) => setDps(e.target.value)} /></Field>
          <Field label="Status"><Input value={status} onChange={(e) => setStatus(e.target.value)} /></Field>
          <Field label="Deadline"><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
          <Field label="Documents requested (semicolon-separated)">
            <Textarea value={docs} onChange={(e) => setDocs(e.target.value)} rows={3} />
          </Field>
          <Field label="Notes / highlighted sections">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </Field>
        </CardContent></Card>

        <Card><CardContent className="p-0">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Email preview</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(body); toast.success("Copied"); }}>
                <Copy className="mr-2 h-3.5 w-3.5" />Copy
              </Button>
              <Button size="sm" onClick={() => toast.success("Email queued for sending")}>
                <Send className="mr-2 h-3.5 w-3.5" />Send
              </Button>
            </div>
          </div>
          <div className="p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed">{body}</div>
        </CardContent></Card>
      </div>
    </>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

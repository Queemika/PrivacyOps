import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail } from "lucide-react";
import { toast } from "sonner";

const faqs = [
  { q: "How do I generate a PIA from a transcript?", a: "Go to Transcript → upload the file → review the anonymized preview → click Process PIA → choose Generate new PIA or link to an existing one." },
  { q: "What's the difference between Compilation and NPC-RS?", a: "Compilation (Records of Processing Activities) is the GDPR-style inventory. NPC-RS is the Philippine NPC Registration System format with additional fields like consolidated DPS and lawful basis details." },
  { q: "Who can edit tooltips?", a: "Only Admins. Go to Settings → set role to Admin → Configure tooltips." },
  { q: "Where do action items appear?", a: "Action items extracted from transcripts surface in the DRL module under the Action Items tab, and in the Email Generator as pre-filled items." },
  { q: "Is my data secure?", a: "This is a prototype using localStorage for persistence. All transcripts are anonymized before storage. Production deployment will use Lovable Cloud." },
];

export default function Help() {
  const [subj, setSubj] = useState("");
  const [body, setBody] = useState("");

  return (
    <PageShell title="Help & FAQ" subtitle="Find answers or reach the admin">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold mb-3">Frequently asked</h3>
              <Accordion type="single" collapsible>
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`f-${i}`}>
                    <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Mail className="h-4 w-4" /> Email admin</h3>
              <div className="space-y-2">
                <Input placeholder="Subject" value={subj} onChange={(e) => setSubj(e.target.value)} />
                <Textarea placeholder="Describe your question or issue…" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
                <div className="flex justify-end">
                  <Button onClick={() => { toast.success("Sent to admin@privacyops.example"); setSubj(""); setBody(""); }} disabled={!subj || !body}>
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2"><Sparkles className="h-4 w-4 text-accent" /> Ask Pixie</div>
            <p className="text-xs text-muted-foreground mb-3">Pixie is your in-app assistant. Open the floating button in the bottom-right to chat — she answers in EN / Filipino / Taglish and cites PH DPA, GDPR, or CCPA.</p>
            <ul className="text-xs space-y-1.5 text-muted-foreground">
              <li>• "How do I file a breach notification under NPC?"</li>
              <li>• "Anong difference ng PIC at PIP?"</li>
              <li>• "Walk me through Phase 2 lifecycle."</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

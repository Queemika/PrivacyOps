import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, FileText, Lock, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { transcriptSample } from "@/lib/mockData";
import { toast } from "sonner";

export default function Upload() {
  const navigate = useNavigate();
  const [anonymize, setAnonymize] = useState(true);
  const [scrub, setScrub] = useState(true);
  const [tech, setTech] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "uploading" | "anon" | "extract" | "done">("idle");

  const onPick = (name: string) => {
    setFile(name);
    setStep("uploading");
    setTimeout(() => setStep("anon"), 700);
    setTimeout(() => setStep("extract"), 1600);
    setTimeout(() => setStep("done"), 2700);
  };

  return (
    <>
      <PageHeader
        title="Upload Transcript"
        description="Upload a meeting transcript (e.g., from Fireflies). Client identifiers are anonymized before AI processing."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div
              className="border-2 border-dashed rounded-lg p-10 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => onPick("fireflies_hr_onboarding_transcript.txt")}
            >
              <div className="h-14 w-14 mx-auto rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
                <UploadIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Drop transcript here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">.txt, .docx, .vtt, .srt · max 25 MB</p>
              <Button className="mt-4" type="button">Choose file</Button>
            </div>

            {file && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{file}</span>
                    <span className="text-xs text-muted-foreground">· 12.4 KB</span>
                  </div>
                  {step === "done" && (
                    <Button size="sm" onClick={() => { toast.success("PIA draft generated"); navigate("/review"); }}>
                      <Sparkles className="h-3.5 w-3.5 mr-1" />Review extraction
                    </Button>
                  )}
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <PipelineRow label="Uploading securely (TLS 1.3)" active={step === "uploading"} done={["anon","extract","done"].includes(step)} />
                  <PipelineRow label="Anonymizing client identifiers" active={step === "anon"} done={["extract","done"].includes(step)} />
                  <PipelineRow label="AI extraction of privacy fields" active={step === "extract"} done={step === "done"} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Processing options</h3>
            <div className="space-y-4">
              <ToggleRow id="anon" checked={anonymize} onChange={setAnonymize} icon={Lock}
                title="Anonymize client names" desc="Replace client and rep names with tokens before AI." />
              <ToggleRow id="scrub" checked={scrub} onChange={setScrub} icon={Lock}
                title="Scrub before storage" desc="PII removed prior to persisted storage." />
              <ToggleRow id="tech" checked={tech} onChange={setTech} icon={Sparkles}
                title="Enable Tech Security (DRL/IRL)" desc="Enables technical security questions during extraction." />
            </div>
            <div className="mt-6 p-3 rounded-md bg-info/5 border border-info/20 text-xs text-foreground">
              <strong className="text-info">Compliance:</strong> Aligned with NPC Philippines requirements; GDPR overlay applies for EU data subjects.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Sample transcript preview</h3>
            <span className="text-xs text-muted-foreground">Anonymized view</span>
          </div>
          <pre className="text-xs leading-relaxed bg-muted/40 rounded-md p-4 whitespace-pre-wrap font-mono">{transcriptSample}</pre>
        </CardContent>
      </Card>
    </>
  );
}

function PipelineRow({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {done ? <CheckCircle2 className="h-4 w-4 text-success" />
        : active ? <Loader2 className="h-4 w-4 animate-spin text-accent" />
        : <div className="h-4 w-4 rounded-full border-2 border-muted" />}
      <span className={done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function ToggleRow({ id, checked, onChange, icon: Icon, title, desc }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-md bg-primary/5 text-primary flex items-center justify-center shrink-0"><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{title}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

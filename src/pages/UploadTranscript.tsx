import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, Loader2, CheckCircle2, ShieldCheck, Sparkles, Link2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { transcriptSample, mockPIAs } from "@/lib/mockData";
import { anonymizeText } from "@/lib/anonymize";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Upload() {
  const navigate = useNavigate();
  const { logAction } = useAuth();
  const [file, setFile] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "uploading" | "anon" | "done">("idle");
  const [anonymized, setAnonymized] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<"new" | "existing">("new");
  const [linkedPia, setLinkedPia] = useState<string>("");

  const onPick = (name: string) => {
    setFile(name);
    setStep("uploading");
    logAction("Uploaded transcript", name);
    setTimeout(() => {
      setStep("anon");
      logAction("Anonymized client identifiers (server-side)", name);
    }, 700);
    setTimeout(() => {
      // Backend "returns" only the anonymized version
      setAnonymized(anonymizeText(transcriptSample, true).text);
      setStep("done");
    }, 1700);
  };

  const handleContinue = () => {
    if (choice === "new") {
      logAction("Generated new PIA from transcript", file ?? "");
      toast.success("PIA draft created");
      setOpen(false);
      navigate("/review");
    } else {
      if (!linkedPia) {
        toast.error("Please select a PIA to link");
        return;
      }
      logAction("Linked transcript to existing PIA", linkedPia);
      toast.success(`Transcript linked to ${linkedPia}`);
      setOpen(false);
      navigate("/library");
    }
  };

  return (
    <>
      <PageHeader
        title="Upload Transcript"
        description="Upload meeting transcripts to generate a Privacy Impact Assessment (PIA)."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step 1: Upload */}
        <Card>
          <CardContent className="p-8">
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => onPick("hr_onboarding_transcript.txt")}
            >
              <div className="h-14 w-14 mx-auto rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
                <UploadIcon className="h-6 w-6" />
              </div>
              <p className="text-base font-medium">Drag and drop your transcript here</p>
              <p className="text-xs text-muted-foreground mt-1">or</p>
              <Button className="mt-4" type="button">Browse Files</Button>
              <p className="text-xs text-muted-foreground mt-4">Supported formats: PDF, DOCX, TXT</p>
            </div>

            {file && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b">
                  <FileText className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{file}</span>
                  <span className="text-xs text-muted-foreground">· 12.4 KB</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <PipelineRow label="Uploading securely" active={step === "uploading"} done={["anon", "done"].includes(step)} />
                  <PipelineRow label="Anonymizing on server" active={step === "anon"} done={step === "done"} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info box */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-3">What this will generate</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Data Processing System (DPS) details</li>
              <li>Personal &amp; sensitive data categories</li>
              <li>Legal basis</li>
              <li>Risks and security controls</li>
              <li>Data sharing and retention</li>
            </ul>
          </CardContent>
        </Card>

        {/* Anonymized preview */}
        {step === "done" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-success" />
                <h3 className="text-sm font-semibold">Anonymized Transcript Preview</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                All personal data has been automatically anonymized.
              </p>
              <pre className="text-xs leading-relaxed bg-muted/30 border rounded-md p-4 whitespace-pre-wrap font-mono max-h-96 overflow-auto">
                {anonymized}
              </pre>

              <div className="mt-6 flex justify-end">
                <Button size="lg" onClick={() => setOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />Process PIA
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Process PIA modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What would you like to do?</DialogTitle>
            <DialogDescription>
              Choose how to process this anonymized transcript.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup value={choice} onValueChange={(v) => setChoice(v as "new" | "existing")} className="space-y-3 py-2">
            <label className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${choice === "new" ? "border-accent bg-accent/5" : "hover:bg-muted/30"}`}>
              <RadioGroupItem value="new" id="opt-new" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <Label htmlFor="opt-new" className="text-sm font-medium cursor-pointer">Generate New PIA</Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Create a fresh PIA draft from this transcript.</p>
              </div>
            </label>

            <label className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${choice === "existing" ? "border-accent bg-accent/5" : "hover:bg-muted/30"}`}>
              <RadioGroupItem value="existing" id="opt-existing" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-info" />
                  <Label htmlFor="opt-existing" className="text-sm font-medium cursor-pointer">Link to Existing PIA</Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Attach this transcript to a PIA already in your library.</p>

                {choice === "existing" && (
                  <div className="mt-3">
                    <Select value={linkedPia} onValueChange={setLinkedPia}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a PIA…" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPIAs.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.id} — {p.dpsName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </label>
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleContinue}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PipelineRow({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {done ? <CheckCircle2 className="h-4 w-4 text-success" />
        : active ? <Loader2 className="h-4 w-4 animate-spin text-accent" />
        : <div className="h-4 w-4 rounded-full border-2 border-muted" />}
      <span className={done || active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

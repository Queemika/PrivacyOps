import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, Loader2, CheckCircle2, ShieldCheck, Sparkles, Link2, FilePlus2 } from "lucide-react";
import { transcriptSample, mockPIAs } from "@/lib/mockData";
import { anonymizeText } from "@/lib/anonymize";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock "uploads" store — in a real backend this would be a DB row.
// IMPORTANT: only the anonymized content is ever persisted.
export interface UploadRecord {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  anonymizedContent: string;
  speakerMap: Record<string, string>;
  stats: { emails: number; phones: number; ids: number; persons: number };
  createdAt: string;
}

const UPLOADS_KEY = "pa_uploads";

function persistUpload(rec: UploadRecord) {
  const all: UploadRecord[] = JSON.parse(localStorage.getItem(UPLOADS_KEY) || "[]");
  all.unshift(rec);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(all.slice(0, 25)));
}

type AnonMode = "off" | "standard" | "strict";

export default function Upload() {
  const navigate = useNavigate();
  const { logAction } = useAuth();
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [step, setStep] = useState<"idle" | "uploading" | "anon" | "done">("idle");
  const [anonymized, setAnonymized] = useState<string>("");
  const [uploadId, setUploadId] = useState<string>("");
  const [processOpen, setProcessOpen] = useState(false);
  const [linkPiaId, setLinkPiaId] = useState<string>("");
  const [anonMode, setAnonMode] = useState<AnonMode>("standard");

  const onPick = (name: string, size = 12400) => {
    setFile({ name, size });
    setStep("uploading");
    logAction("Uploaded transcript", name);

    setTimeout(() => {
      setStep("anon");
      logAction("Anonymized client identifiers (server-side)", name);
    }, 700);

    setTimeout(() => {
      const text = anonMode === "off" ? transcriptSample : anonymizeText(transcriptSample, anonMode === "strict").text;
      const result = anonMode === "off"
        ? { text, replacements: [], speakerMap: {}, stats: { emails: 0, phones: 0, ids: 0, persons: 0 } }
        : anonymizeText(transcriptSample, anonMode === "strict");
      const id = `UPL-${Date.now()}`;
      const rec: UploadRecord = {
        id,
        fileName: name,
        fileSize: size,
        fileType: name.split(".").pop() || "txt",
        anonymizedContent: result.text,
        speakerMap: result.speakerMap,
        stats: result.stats,
        createdAt: new Date().toISOString(),
      };
      persistUpload(rec);
      setAnonymized(result.text);
      setUploadId(id);
      setStep("done");
    }, 1700);
  };

  const handleGenerateNew = () => {
    logAction("Generated new PIA from transcript", file?.name ?? "");
    toast.success("Generating new PIA from anonymized transcript");
    setProcessOpen(false);
    navigate(`/pia/new?uploadId=${uploadId}`);
  };

  const handleLinkExisting = () => {
    if (!linkPiaId) {
      toast.error("Please select a PIA to link");
      return;
    }
    logAction("Linked transcript to existing PIA", `${file?.name ?? ""} → ${linkPiaId}`);
    toast.success(`Linked to ${linkPiaId}`);
    setProcessOpen(false);
    navigate(`/pia?uploadId=${uploadId}&piaId=${linkPiaId}`);
  };

  const beforeUpload = step === "idle";

  return (
    <>
      <PageHeader
        title="Upload Transcript"
        description="Upload meeting transcripts to generate a Privacy Impact Assessment (PIA)."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload card */}
        <Card>
          <CardContent className="p-8">
            {beforeUpload && (
              <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-md border bg-muted/20">
                <div>
                  <div className="text-sm font-medium">Anonymization mode</div>
                  <div className="text-xs text-muted-foreground">Controls how PII is masked before storage.</div>
                </div>
                <Select value={anonMode} onValueChange={(v) => setAnonMode(v as AnonMode)}>
                  <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off — keep raw</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => step === "idle" && onPick("hr_onboarding_transcript.txt")}
            >
              <div className="h-14 w-14 mx-auto rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
                <UploadIcon className="h-6 w-6" />
              </div>
              <p className="text-base font-medium">Drag and drop your transcript here</p>
              <p className="text-xs text-muted-foreground mt-1">or</p>
              <Button className="mt-4" type="button" disabled={step !== "idle"}>Browse Files</Button>
              <p className="text-xs text-muted-foreground mt-4">Supported formats: PDF, DOCX, TXT</p>
            </div>

            {file && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b">
                  <FileText className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">· {(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <PipelineRow label="Uploading securely" active={step === "uploading"} done={["anon", "done"].includes(step)} />
                  <PipelineRow label="Anonymizing on server" active={step === "anon"} done={step === "done"} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pre-upload info box only */}
        {beforeUpload && (
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
        )}

        {/* Anonymized preview + Generate PIA */}
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
                <Button size="lg" onClick={() => setProcessOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />Process PIA
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process PIA</DialogTitle>
            <DialogDescription>
              Choose how to process this anonymized transcript.
            </DialogDescription>
          </DialogHeader>

          <div className="grid sm:grid-cols-2 gap-3 py-2">
            <button
              onClick={handleGenerateNew}
              className="text-left border rounded-lg p-4 hover:border-accent hover:bg-accent/5 transition-colors"
            >
              <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center mb-3">
                <FilePlus2 className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold">Generate New PIA</div>
              <div className="text-xs text-muted-foreground mt-1">
                Create a brand new PIA from this transcript.
              </div>
            </button>

            <div className="border rounded-lg p-4">
              <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center mb-3">
                <Link2 className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold">Link to Existing PIA</div>
              <div className="text-xs text-muted-foreground mt-1 mb-3">
                Attach this transcript to a PIA in the library.
              </div>
              <Select value={linkPiaId} onValueChange={setLinkPiaId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select PIA…" />
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkExisting} disabled={!linkPiaId}>
              <Link2 className="h-4 w-4 mr-2" />Link Selected
            </Button>
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload as UploadIcon, FileText, Loader2, CheckCircle2, ShieldCheck, Sparkles,
  Link2, FilePlus2, Mail, Users, Play,
} from "lucide-react";
import { transcriptSample, mockPIAs } from "@/lib/mockData";
import { anonymizeText } from "@/lib/anonymize";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addActions } from "@/lib/actionsStore";
import { addTodos } from "@/lib/todosStore";
import { loadTeamUploads, addTeamUpload, tagTeamUpload, type TeamUpload } from "@/lib/teamUploadsStore";

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

const TAG_TONE: Record<string, string> = {
  PIA: "bg-[hsl(var(--tile-blue-bg))] text-[hsl(var(--tile-blue-fg))]",
  TSA: "bg-[hsl(var(--tile-amber-bg))] text-[hsl(var(--tile-amber-fg))]",
  DRL: "bg-[hsl(var(--tile-violet-bg))] text-[hsl(var(--tile-violet-fg))]",
  Email: "bg-[hsl(var(--tile-green-bg))] text-[hsl(var(--tile-green-fg))]",
};

export default function Upload() {
  const navigate = useNavigate();
  const { user, logAction } = useAuth();
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [step, setStep] = useState<"idle" | "uploading" | "anon" | "done">("idle");
  const [anonymized, setAnonymized] = useState<string>("");
  const [uploadId, setUploadId] = useState<string>("");
  const [processOpen, setProcessOpen] = useState(false);
  const [linkPiaId, setLinkPiaId] = useState<string>("");
  const [anonMode, setAnonMode] = useState<AnonMode>("standard");
  const [team, setTeam] = useState<TeamUpload[]>([]);

  useEffect(() => { setTeam(loadTeamUploads()); }, []);

  const onPick = (name: string, size = 12400) => {
    setFile({ name, size });
    setStep("uploading");
    logAction("Uploaded transcript", name);

    setTimeout(() => {
      setStep("anon");
      logAction("Anonymized client identifiers (server-side)", name);
    }, 700);

    setTimeout(() => {
      const result = anonMode === "off"
        ? { text: transcriptSample, replacements: [], speakerMap: {}, stats: { emails: 0, phones: 0, ids: 0, persons: 0 } }
        : anonymizeText(transcriptSample, anonMode === "strict");
      const id = `UPL-${Date.now()}`;
      const rec: UploadRecord = {
        id, fileName: name, fileSize: size, fileType: name.split(".").pop() || "txt",
        anonymizedContent: result.text, speakerMap: result.speakerMap, stats: result.stats,
        createdAt: new Date().toISOString(),
      };
      persistUpload(rec);
      addTeamUpload({ id, fileName: name, uploader: user?.name || "You", tags: [] });

      const owner = user?.name || "You";
      addActions([
        { source: "Transcript", sourceRef: id, text: "Provide updated DSA with payroll vendor", owner: "HR Lead", deadline: "" },
        { source: "Transcript", sourceRef: id, text: "Share SCC for cross-border BG-check provider", owner: "Legal", deadline: "" },
        { source: "Transcript", sourceRef: id, text: "Submit latest access review report", owner: "IT Security", deadline: "" },
      ]);
      // Auto-add a to-do for the uploader so action items land on their dashboard
      addTodos([
        { text: `Review action items extracted from ${name}`, source: "Transcript", sourceRef: id, owner },
        { text: `Confirm anonymization output for ${name}`, source: "Transcript", sourceRef: id, owner },
      ]);

      setAnonymized(result.text);
      setUploadId(id);
      setStep("done");
      setTeam(loadTeamUploads());
    }, 1700);
  };

  const handleGenerateNew = () => {
    logAction("Generated new PIA from transcript", file?.name ?? "");
    tagTeamUpload(uploadId, "PIA");
    toast.success("Generating new PIA from anonymized transcript");
    setProcessOpen(false);
    navigate(`/pia/new?uploadId=${uploadId}`);
  };

  const handleLinkExisting = () => {
    if (!linkPiaId) { toast.error("Please select a PIA to link"); return; }
    logAction("Linked transcript to existing PIA", `${file?.name ?? ""} → ${linkPiaId}`);
    tagTeamUpload(uploadId, "PIA");
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

      <div className="max-w-5xl mx-auto space-y-6">
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

        {step === "done" && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold">Anonymized Transcript Preview</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">All personal data has been automatically anonymized.</p>
                <pre className="text-xs leading-relaxed bg-muted/30 border rounded-md p-4 whitespace-pre-wrap font-mono max-h-72 overflow-auto">{anonymized}</pre>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Process pipeline</h3>
                <p className="text-xs text-muted-foreground mb-4">Select the steps you want to run, then click <em>Run selected</em>. Modules won't auto-open.</p>
                <PipelineMultiSelect uploadId={uploadId} onLink={() => setProcessOpen(true)} />
              </CardContent>
            </Card>
          </>
        )}

        {/* Team transcripts */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> Team transcripts</h3>
            <p className="text-xs text-muted-foreground mb-4">Transcripts uploaded by your team. Tags show which modules were processed from each.</p>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">File</th>
                    <th className="text-left font-medium px-3 py-2">Uploader</th>
                    <th className="text-left font-medium px-3 py-2">Date</th>
                    <th className="text-left font-medium px-3 py-2">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-xs">{t.fileName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{t.id}</div>
                      </td>
                      <td className="px-3 py-2.5 text-xs">{t.uploader}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.uploadedAt}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {t.tags.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                          {t.tags.map((tag) => (
                            <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded ${TAG_TONE[tag] || "bg-muted text-muted-foreground"}`}>{tag}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link or Generate PIA</DialogTitle>
            <DialogDescription>Create a new PIA or link this transcript to an existing one.</DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3 py-2">
            <button onClick={handleGenerateNew} className="text-left border rounded-lg p-4 hover:border-accent hover:bg-accent/5 transition-colors">
              <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center mb-3"><FilePlus2 className="h-4 w-4" /></div>
              <div className="text-sm font-semibold">Generate New PIA</div>
              <div className="text-xs text-muted-foreground mt-1">Create a brand new PIA from this transcript.</div>
            </button>
            <div className="border rounded-lg p-4">
              <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center mb-3"><Link2 className="h-4 w-4" /></div>
              <div className="text-sm font-semibold">Link to Existing PIA</div>
              <div className="text-xs text-muted-foreground mt-1 mb-3">Attach this transcript to a PIA in the library.</div>
              <Select value={linkPiaId} onValueChange={setLinkPiaId}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select PIA…" /></SelectTrigger>
                <SelectContent>
                  {mockPIAs.map((p) => (<SelectItem key={p.id} value={p.id}>{p.id} — {p.dpsName}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkExisting} disabled={!linkPiaId}><Link2 className="h-4 w-4 mr-2" />Link Selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PipelineMultiSelect({ uploadId, onLink }: { uploadId: string; onLink: () => void }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  const steps: { id: string; tag?: string; title: string; desc: string; run: () => void }[] = [
    { id: "pia", tag: "PIA", title: "Generate / link PIA", desc: "Create a new PIA or attach to existing.", run: () => onLink() },
    { id: "tsa", tag: "TSA", title: "Push to Tech Security", desc: "Autofill remarks for relevant TSA controls.", run: () => { tagTeamUpload(uploadId, "TSA"); toast.success("Tech Security remarks updated"); } },
    { id: "drl", tag: "DRL", title: "Create DRL items", desc: "Open document requests from action items.", run: () => { tagTeamUpload(uploadId, "DRL"); toast.success("3 DRL items created"); } },
    { id: "email", tag: "Email", title: "Draft follow-up email", desc: "Pre-fill an email with assigned action items.", run: () => {
        tagTeamUpload(uploadId, "Email");
        addTodos([{ text: `Send follow-up email for ${uploadId}`, source: "Email", sourceRef: uploadId, owner: user?.name || "You" }]);
        toast.success("Follow-up email drafted; to-do added");
      } },
  ];

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const runSelected = () => {
    if (selectedCount === 0) { toast.error("Select at least one process"); return; }
    steps.filter(s => selected[s.id]).forEach((s) => { s.run(); setDone((d) => ({ ...d, [s.id]: true })); });
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y border rounded-md">
        {steps.map((s) => (
          <li key={s.id} className="flex items-center gap-3 p-3">
            <Checkbox checked={!!selected[s.id]} onCheckedChange={() => toggle(s.id)} />
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${done[s.id] ? "bg-success border-success" : "border-muted-foreground/40"}`}>
              {done[s.id] && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">{s.title}
                {s.tag && <span className={`text-[10px] px-1.5 py-0.5 rounded ${TAG_TONE[s.tag] || ""}`}>{s.tag}</span>}
              </div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <Button onClick={runSelected} disabled={selectedCount === 0}><Play className="h-3.5 w-3.5 mr-1.5" />Run selected ({selectedCount})</Button>
      </div>
    </div>
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

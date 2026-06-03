import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload as UploadIcon, FileText, Loader2, CheckCircle2, ShieldCheck, Sparkles,
  Link2, FilePlus2, Users, Play, Database, UserCheck, Pencil, RotateCw, X, Languages,
} from "lucide-react";
import { transcriptSample, mockPIAs } from "@/lib/mockData";
import { anonymizeText, relabelAsSpeakers, applyLanguageHints, type SpeakerInfo } from "@/lib/anonymize";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { addActions } from "@/lib/actionsStore";
import { addTodos } from "@/lib/todosStore";
import {
  loadTeamUploads, addTeamUpload, tagTeamUpload, updateTeamUpload,
  type TeamUpload, type TranscriptStatus,
} from "@/lib/teamUploadsStore";
import { TranscriptPreviewModal, type PreviewTranscript } from "@/components/TranscriptPreviewModal";
import { getPia, normalizePiaToLatestTemplate } from "@/lib/pia/store";
import { useMyRoles } from "@/lib/roles/store";
import { OutputPreviewPane, type OutputKind } from "@/components/transcript/OutputPreviewPane";
import { ChevronDown } from "lucide-react";

export interface UploadRecord {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  rawContent: string;
  anonymizedContent: string;
  speakerMap: Record<string, string>;
  speakers: SpeakerInfo[];
  stats: { emails: number; phones: number; ids: number; persons: number };
  language: "EN" | "FIL" | "Taglish";
  anonMode: "off" | "standard" | "strict";
  status: TranscriptStatus;
  createdAt: string;
}

const UPLOADS_KEY = "pa_uploads";

function persistUpload(rec: UploadRecord) {
  const all: UploadRecord[] = JSON.parse(localStorage.getItem(UPLOADS_KEY) || "[]");
  all.unshift(rec);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(all.slice(0, 25)));
}
function updateUpload(id: string, patch: Partial<UploadRecord>) {
  const all: UploadRecord[] = JSON.parse(localStorage.getItem(UPLOADS_KEY) || "[]");
  const i = all.findIndex(u => u.id === id);
  if (i < 0) return;
  all[i] = { ...all[i], ...patch };
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(all));
}

type AnonMode = "off" | "standard" | "strict";
type Language = "EN" | "FIL" | "Taglish";

const TAG_TONE: Record<string, string> = {
  PIA: "bg-[hsl(var(--tile-blue-bg))] text-[hsl(var(--tile-blue-fg))]",
  TSA: "bg-[hsl(var(--tile-amber-bg))] text-[hsl(var(--tile-amber-fg))]",
  DRL: "bg-[hsl(var(--tile-violet-bg))] text-[hsl(var(--tile-violet-fg))]",
  Email: "bg-[hsl(var(--tile-green-bg))] text-[hsl(var(--tile-green-fg))]",
};
const TAG_ROUTE: Record<string, string> = { PIA: "/library", TSA: "/tsa", DRL: "/drl", Email: "/email" };
const STATUS_TONE: Record<TranscriptStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-warning/10 text-warning",
  reviewed: "bg-[hsl(var(--tile-blue-bg))] text-[hsl(var(--tile-blue-fg))]",
  validated: "bg-success/10 text-success",
};
const STATUS_LABEL: Record<TranscriptStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  reviewed: "Reviewed",
  validated: "Validated",
};

export default function Upload() {
  const navigate = useNavigate();
  const { user, logAction } = useAuth();
  const { roles, isAdmin } = useMyRoles();
  const canValidate = isAdmin || roles.some(r => r === "Lead" || r === "Approver");

  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [preProcessOpen, setPreProcessOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  const [step, setStep] = useState<"idle" | "uploading" | "anon" | "done">("idle");
  const [anonymized, setAnonymized] = useState<string>("");
  const [speakers, setSpeakers] = useState<SpeakerInfo[]>([]);
  const [uploadId, setUploadId] = useState<string>("");
  const [status, setStatus] = useState<TranscriptStatus>("pending_review");

  const [processOpen, setProcessOpen] = useState(false);
  const [linkPiaId, setLinkPiaId] = useState<string>("");
  const [anonMode, setAnonMode] = useState<AnonMode>("standard");
  const [language, setLanguage] = useState<Language>("EN");
  const [team, setTeam] = useState<TeamUpload[]>([]);
  const [previewing, setPreviewing] = useState<PreviewTranscript | null>(null);

  useEffect(() => { setTeam(loadTeamUploads()); }, []);

  // --- Step 1: pick a file → open pre-process modal with raw content
  const onPick = (name: string, size = 12400) => {
    setFile({ name, size });
    setRawText(transcriptSample);
    setHasEdited(false);
    setEditing(false);
    setPreProcessOpen(true);
    logAction("Selected transcript for preview", name);
  };

  const cancelPreProcess = () => {
    setPreProcessOpen(false);
    setFile(null);
    setRawText("");
    setEditing(false);
    setHasEdited(false);
    setStep("idle");
  };

  // --- Step 2: Process (or Reprocess after edit)
  const runProcess = () => {
    if (!file) return;
    setPreProcessOpen(false);
    setEditing(false);
    setStep("uploading");
    logAction(hasEdited ? "Reprocessing edited transcript" : "Processing transcript", file.name);

    setTimeout(() => setStep("anon"), 500);

    setTimeout(() => {
      const hinted = applyLanguageHints(rawText, language);
      const anon = anonMode === "off"
        ? { text: hinted, replacements: [], speakerMap: {}, stats: { emails: 0, phones: 0, ids: 0, persons: 0 } }
        : anonymizeText(hinted, anonMode === "strict");
      const labeled = relabelAsSpeakers(anon.text);

      const id = uploadId || `UPL-${Date.now()}`;
      const rec: UploadRecord = {
        id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.split(".").pop() || "txt",
        rawContent: rawText,
        anonymizedContent: labeled.text,
        speakerMap: anon.speakerMap,
        speakers: labeled.speakers,
        stats: anon.stats,
        language,
        anonMode,
        status: "pending_review",
        createdAt: new Date().toISOString(),
      };

      if (uploadId) {
        updateUpload(id, rec);
      } else {
        persistUpload(rec);
        addTeamUpload({
          id,
          fileName: file.name,
          uploader: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You",
          tags: [],
          status: "pending_review",
          language,
        });
        addActions([
          { source: "Transcript", sourceRef: id, text: "Review extracted action items", owner: "HR Lead", deadline: "" },
        ]);
        addTodos([
          { text: `Review action items extracted from ${file.name}`, source: "Transcript", sourceRef: id, owner: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You" },
        ]);
      }

      setAnonymized(labeled.text);
      setSpeakers(labeled.speakers);
      setUploadId(id);
      setStatus("pending_review");
      setStep("done");
      setTeam(loadTeamUploads());
    }, 1300);
  };

  // --- Validation
  const markReviewed = () => {
    const who = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You";
    updateUpload(uploadId, { status: "reviewed" });
    updateTeamUpload(uploadId, { status: "reviewed", reviewedBy: who });
    setStatus("reviewed");
    setTeam(loadTeamUploads());
    logAction("Marked transcript reviewed", uploadId);
    toast.success("Marked as reviewed");
  };
  const validateSupervisor = () => {
    if (!canValidate) { toast.error("Only Lead/Approver/Admin can validate."); return; }
    const who = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Supervisor";
    updateUpload(uploadId, { status: "validated" });
    updateTeamUpload(uploadId, { status: "validated", validatedBy: who, validatedAt: new Date().toISOString() });
    setStatus("validated");
    setTeam(loadTeamUploads());
    logAction("Validated transcript", uploadId);
    toast.success("Validated — outputs are now available");
  };

  // --- Downstream
  const handleGenerateNew = () => {
    logAction("Generated new PIA from transcript", file?.name ?? "");
    tagTeamUpload(uploadId, "PIA");
    toast.success("Generating new PIA from anonymized transcript");
    setProcessOpen(false);
    navigate(`/pia/new?uploadId=${uploadId}`);
  };
  const handleLinkExisting = () => {
    if (!linkPiaId) { toast.error("Please select a PIA to link"); return; }
    const target = getPia(linkPiaId);
    if (target) normalizePiaToLatestTemplate(target);
    logAction("Linked transcript to existing PIA", `${file?.name ?? ""} → ${linkPiaId}`);
    tagTeamUpload(uploadId, "PIA");
    toast.success(`Linked to ${linkPiaId} and upgraded to latest PIA template`);
    setProcessOpen(false);
    navigate(`/pia/${linkPiaId}?uploadId=${uploadId}`);
  };

  const askPixieDataHandling = () => {
    const msg = encodeURIComponent(
      `Where is transcript ${uploadId || "this upload"} stored, and is it anonymized?`
    );
    window.dispatchEvent(new CustomEvent("pixie:ask", { detail: { question: decodeURIComponent(msg) } }));
    toast.info("Asked Pixie about data handling");
  };

  const beforeUpload = step === "idle";
  const validated = status === "validated";

  return (
    <>
      <PageHeader
        title="Upload Transcript"
        description="Upload, review, and validate transcripts before generating downstream outputs."
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Upload card */}
        <Card>
          <CardContent className="p-8">
            {beforeUpload && (
              <div className="mb-5 grid sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-md border bg-muted/20">
                  <div>
                    <div className="text-sm font-medium">Anonymization</div>
                    <div className="text-xs text-muted-foreground">PII masking before storage.</div>
                  </div>
                  <Select value={anonMode} onValueChange={(v) => setAnonMode(v as AnonMode)}>
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off — raw</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-md border bg-muted/20">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1"><Languages className="h-3.5 w-3.5" />Language</div>
                    <div className="text-xs text-muted-foreground">Taglish optimizes PH-mixed speech.</div>
                  </div>
                  <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EN">English</SelectItem>
                      <SelectItem value="FIL">Filipino</SelectItem>
                      <SelectItem value="Taglish">Taglish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <p className="text-xs text-muted-foreground mt-4">PDF, DOCX, TXT · You'll preview & edit before processing</p>
            </div>

            {file && step !== "idle" && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b">
                  <FileText className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">· {(file.size / 1024).toFixed(1)} KB · {language}</span>
                  {step === "done" && <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>}
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <PipelineRow label="Uploading securely" active={step === "uploading"} done={["anon", "done"].includes(step)} />
                  <PipelineRow label="Anonymizing & identifying speakers" active={step === "anon"} done={step === "done"} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {step === "done" && (
          <>
            {/* Validation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="h-4 w-4 text-accent" />
                      <h3 className="text-sm font-semibold">Review & Validation</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Transcripts must be reviewed and validated by a supervisor before any downstream module can use them.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={status !== "pending_review"} onClick={markReviewed}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Mark reviewed
                    </Button>
                    <Button size="sm" disabled={status === "validated" || !canValidate} onClick={validateSupervisor}
                      title={!canValidate ? "Requires Lead/Approver/Admin role" : ""}>
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" />Validate (supervisor)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anonymized + Speakers */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold">Anonymized Transcript</h3>
                  <button onClick={askPixieDataHandling} className="ml-auto text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded border hover:border-accent">
                    <Database className="h-3 w-3" />Where is this stored?
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {speakers.length} speaker(s) identified · {anonMode === "off" ? "Raw" : anonMode} anonymization · Language: {language}
                </p>
                {speakers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {speakers.map(s => (
                      <span key={s.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                        {s.label} · {s.lineCount} mention{s.lineCount === 1 ? "" : "s"}
                      </span>
                    ))}
                  </div>
                )}
                <pre className="text-xs leading-relaxed bg-muted/30 border rounded-md p-4 whitespace-pre-wrap font-mono max-h-72 overflow-auto">{anonymized}</pre>
              </CardContent>
            </Card>

            {/* Output mapping + previews */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" /> Output mapping
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Select outputs to preview, then commit them to their modules.
                  {!validated && <span className="text-warning"> · Awaiting supervisor validation</span>}
                </p>
                <OutputMapping
                  uploadId={uploadId}
                  fileName={file?.name ?? ""}
                  transcript={anonymized}
                  disabled={!validated}
                  onLink={() => setProcessOpen(true)}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Team transcripts */}
        <Collapsible defaultOpen={step !== "uploading" && step !== "anon"} open={step === "uploading" || step === "anon" ? false : undefined}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">Team transcripts</h3>
                  <span className="text-[10px] text-muted-foreground">({team.length})</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground mb-4">Status reflects review & supervisor validation. Outputs are gated until validated.</p>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
                      <tr>
                        <th className="text-left font-medium px-3 py-2">File</th>
                        <th className="text-left font-medium px-3 py-2">Uploader</th>
                        <th className="text-left font-medium px-3 py-2">Status</th>
                        <th className="text-left font-medium px-3 py-2">Date</th>
                        <th className="text-left font-medium px-3 py-2">Processed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.map((t) => {
                        const s = (t.status ?? "pending_review") as TranscriptStatus;
                        return (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-3 py-2.5">
                              <button
                                onClick={() => setPreviewing({ id: t.id, fileName: t.fileName, content: transcriptSample, tags: t.tags })}
                                className="text-left hover:text-accent"
                              >
                                <div className="font-medium text-xs">{t.fileName}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{t.id}</div>
                              </button>
                            </td>
                            <td className="px-3 py-2.5 text-xs">{t.uploader}</td>
                            <td className="px-3 py-2.5"><span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_TONE[s]}`}>{STATUS_LABEL[s]}</span></td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.uploadedAt}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {t.tags.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                                {t.tags.map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() => navigate(TAG_ROUTE[tag] || "/")}
                                    title={`Open ${tag} module`}
                                    className={`text-[10px] px-1.5 py-0.5 rounded hover:ring-1 hover:ring-accent transition ${TAG_TONE[tag] || "bg-muted text-muted-foreground"}`}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

      </div>

      {/* ---------- Pre-process modal ---------- */}
      <Dialog open={preProcessOpen} onOpenChange={(v) => !v && cancelPreProcess()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />Preview before processing</DialogTitle>
            <DialogDescription>Review {file?.name}. Edit the transcript text if needed before anonymization + speaker labeling.</DialogDescription>
          </DialogHeader>

          {editing ? (
            <Textarea
              value={rawText}
              onChange={(e) => { setRawText(e.target.value); setHasEdited(true); }}
              className="font-mono text-xs min-h-[40vh]"
            />
          ) : (
            <pre className="text-xs leading-relaxed bg-muted/30 border rounded-md p-4 whitespace-pre-wrap font-mono max-h-[40vh] overflow-auto">{rawText}</pre>
          )}

          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            <div className="text-[11px] text-muted-foreground">
              {hasEdited ? "Edited — click Reprocess to re-run anonymization on the new text." : "Untouched original."}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={cancelPreProcess}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
              {!editing ? (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Done editing</Button>
              )}
              <Button size="sm" onClick={runProcess}>
                {hasEdited ? <><RotateCw className="h-3.5 w-3.5 mr-1" />Reprocess</> : <><Play className="h-3.5 w-3.5 mr-1" />Process</>}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Link PIA modal ---------- */}
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

      <TranscriptPreviewModal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        transcript={previewing}
        onSave={(next) => setPreviewing(next)}
      />
    </>
  );
}

// ---------- Output mapping with preview pane ----------
function OutputMapping({
  uploadId, fileName, transcript, disabled, onLink,
}: { uploadId: string; fileName: string; transcript: string; disabled: boolean; onLink: () => void }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Record<OutputKind, boolean>>({ pia: false, tsa: false, drl: false, email: false });
  const [previewKind, setPreviewKind] = useState<OutputKind | null>(null);
  const [committed, setCommitted] = useState<Record<OutputKind, boolean>>({ pia: false, tsa: false, drl: false, email: false });

  const steps: { id: OutputKind; tag: string; title: string; desc: string }[] = [
    { id: "pia",   tag: "PIA",   title: "Generate / link PIA",      desc: "Auto-fill Phase 1 fields from transcript." },
    { id: "tsa",   tag: "TSA",   title: "Push to Tech Security",    desc: "Identify affected technical controls." },
    { id: "drl",   tag: "DRL",   title: "Create DRL items",         desc: "Extract document requests as a table." },
    { id: "email", tag: "Email", title: "Draft follow-up email",    desc: "Summary + DRL bullets pre-filled." },
  ];

  const toggle = (id: OutputKind) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const firstSelected = (Object.entries(selected).find(([, v]) => v)?.[0] ?? null) as OutputKind | null;
  const activePreview = previewKind ?? firstSelected;

  const commit = (id: OutputKind) => {
    if (id === "pia") { onLink(); return; }
    if (id === "tsa") { tagTeamUpload(uploadId, "TSA"); toast.success("Tech Security remarks updated"); }
    if (id === "drl") { tagTeamUpload(uploadId, "DRL"); toast.success("3 DRL items created"); }
    if (id === "email") {
      tagTeamUpload(uploadId, "Email");
      addTodos([{ text: `Send follow-up email for ${uploadId}`, source: "Email", sourceRef: uploadId, owner: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "You" }]);
      toast.success("Follow-up email drafted; to-do added");
    }
    setCommitted(c => ({ ...c, [id]: true }));
  };

  const runSelected = () => {
    if (disabled) { toast.error("Awaiting supervisor validation"); return; }
    if (selectedCount === 0) { toast.error("Select at least one output"); return; }
    (Object.keys(selected) as OutputKind[]).filter(k => selected[k]).forEach(commit);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ul className="divide-y border rounded-md">
        {steps.map((s) => (
          <li key={s.id} className={`flex items-center gap-3 p-3 ${activePreview === s.id ? "bg-accent/5" : ""}`}>
            <Checkbox checked={!!selected[s.id]} onCheckedChange={() => toggle(s.id)} disabled={disabled} />
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${committed[s.id] ? "bg-success border-success" : "border-muted-foreground/40"}`}>
              {committed[s.id] && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
            </div>
            <button onClick={() => setPreviewKind(s.id)} className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium flex items-center gap-2">{s.title}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${TAG_TONE[s.tag] || ""}`}>{s.tag}</span>
              </div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </button>
          </li>
        ))}
      </ul>

      <div>
        {activePreview ? (
          <OutputPreviewPane kind={activePreview} transcript={transcript} fileName={fileName} />
        ) : (
          <div className="border rounded-md p-6 text-center text-xs text-muted-foreground">
            Select or click an output on the left to preview it here.
          </div>
        )}
        <div className="flex justify-end mt-3">
          <Button onClick={runSelected} disabled={disabled || selectedCount === 0}>
            <Play className="h-3.5 w-3.5 mr-1.5" />Commit selected ({selectedCount})
          </Button>
        </div>
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

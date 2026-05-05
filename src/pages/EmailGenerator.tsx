import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy, Send, Sparkles, Plus, X, Upload as UploadIcon, FileText, Mail,
  RotateCcw, Eye, Save, Wand2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// ---------- Types ----------
type EmailType = "PIA Follow-up" | "DRL Request" | "Reminder" | "Internal Coordination";
type EmailStatus = "Pending Documentation" | "Under Review" | "Completed" | "Overdue";

interface ActionItem { text: string; owner?: string; deadline?: string }
interface EmailDraft {
  id: string;
  type: EmailType;
  subject: string;
  dpsName: string;
  clientName: string;
  contactName: string;
  date: string;
  deadline: string;
  documents: string[];
  actionItems: ActionItem[];
  includeActionItems: boolean;
  notes: string;
  body: string;
  status: EmailStatus;
  createdAt: string;
}
interface UserTemplate {
  id: string;
  name: string;
  type: EmailType;
  scope: "Personal" | "Shared";
  body: string;
  createdAt: string;
}

const EMAILS_KEY = "pa_emails";
const TEMPLATES_KEY = "pa_email_templates";

const DOC_SUGGESTIONS = [
  "Privacy Notice",
  "Data Processing Agreement",
  "Security Assessment Report",
  "Data Retention Policy",
  "Access Control Matrix",
];

const SMART_DOC_MAP: Record<string, string[]> = {
  HR: ["Privacy Notice", "Non-Disclosure Agreement", "Data Retention Policy"],
  Finance: ["Data Processing Agreement", "Access Control Matrix", "Security Assessment Report"],
  CRM: ["Privacy Notice", "Data Processing Agreement", "Data Retention Policy"],
  Marketing: ["Privacy Notice", "Consent Records", "Data Retention Policy"],
  Vendor: ["Data Processing Agreement", "Security Assessment Report"],
  Facilities: ["Privacy Notice", "CCTV Notice", "Data Retention Policy"],
};

// Mocked transcript-extracted action items
const MOCK_ACTION_ITEMS: ActionItem[] = [
  { text: "Provide updated DSA with payroll vendor", owner: "John D. (HR Lead)", deadline: "2026-05-10" },
  { text: "Share SCC for cross-border BG-check provider", owner: "Legal", deadline: "2026-05-12" },
  { text: "Submit latest access review report", owner: "IT Security", deadline: "2026-05-08" },
  { text: "Confirm 5-year retention period for medical certificates", owner: "People Ops" },
];

const DEFAULT_TEMPLATES: Record<EmailType, { subject: string; body: string }> = {
  "PIA Follow-up": {
    subject: "PIA Follow-up — {{DPS_NAME}}",
    body: `Hi {{CONTACT_NAME}},

Thank you for the walkthrough of {{DPS_NAME}} on {{DATE}}. Below is a summary of the next steps and outstanding items.

Documents requested:
{{DOCUMENTS_REQUESTED}}

Action Items from Walkthrough
{{ACTION_ITEMS}}

Notes:
{{NOTES}}

Kindly send the requested items on or before {{DEADLINE}} so we can finalize the PIA.

Best regards,
Privacy Team — {{CLIENT_NAME}}`,
  },
  "DRL Request": {
    subject: "Document Request List — {{DPS_NAME}}",
    body: `Hi {{CONTACT_NAME}},

Following our review of {{DPS_NAME}}, please provide the following documents by {{DEADLINE}}:

{{DOCUMENTS_REQUESTED}}

Action Items from Walkthrough
{{ACTION_ITEMS}}

Notes:
{{NOTES}}

Best regards,
Privacy Team — {{CLIENT_NAME}}`,
  },
  "Reminder": {
    subject: "Reminder — Pending items for {{DPS_NAME}}",
    body: `Hi {{CONTACT_NAME}},

This is a friendly reminder regarding the pending items for {{DPS_NAME}}, originally requested on {{DATE}}.

Outstanding documents:
{{DOCUMENTS_REQUESTED}}

Open action items:
{{ACTION_ITEMS}}

Please share these by {{DEADLINE}}.

{{NOTES}}

Best regards,
Privacy Team — {{CLIENT_NAME}}`,
  },
  "Internal Coordination": {
    subject: "Internal — Coordination on {{DPS_NAME}}",
    body: `Team,

Sharing a quick coordination note on {{DPS_NAME}} ({{CLIENT_NAME}}).

Action items:
{{ACTION_ITEMS}}

Open documents:
{{DOCUMENTS_REQUESTED}}

Notes:
{{NOTES}}

Target close date: {{DEADLINE}}.

Thanks,
Privacy Team`,
  },
};

// ---------- Helpers ----------
function loadEmails(): EmailDraft[] {
  return JSON.parse(localStorage.getItem(EMAILS_KEY) || "[]");
}
function saveEmails(list: EmailDraft[]) {
  localStorage.setItem(EMAILS_KEY, JSON.stringify(list.slice(0, 50)));
}
function loadTemplates(): UserTemplate[] {
  return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]");
}
function saveTemplates(list: UserTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list.slice(0, 50)));
}

function formatActionItems(items: ActionItem[]): string {
  if (!items.length) return "  • (no action items)";
  return items
    .map((it) => {
      const meta = [it.owner, it.deadline ? `due ${it.deadline}` : ""].filter(Boolean).join(" · ");
      return `  • ${it.text}${meta ? ` — ${meta}` : ""}`;
    })
    .join("\n");
}

function formatDocs(docs: string[]): string {
  if (!docs.length) return "  • (none)";
  return docs.map((d) => `  • ${d}`).join("\n");
}

function fillTemplate(
  tpl: string,
  vars: Record<string, string>,
): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? `{{${k}}}`));
}

function computeStatus(deadline: string, raw: EmailStatus): EmailStatus {
  if (raw === "Completed" || raw === "Under Review") return raw;
  try {
    if (deadline && new Date(deadline) < new Date(new Date().toDateString())) return "Overdue";
  } catch {}
  return raw;
}

const STATUS_STYLES: Record<EmailStatus, string> = {
  "Pending Documentation": "bg-warning/15 text-warning border-warning/30",
  "Under Review": "bg-accent/15 text-accent border-accent/30",
  "Completed": "bg-success/15 text-success border-success/30",
  "Overdue": "bg-destructive/15 text-destructive border-destructive/30",
};

// ---------- Component ----------
export default function EmailGenerator() {
  const { logAction } = useAuth();

  // Builder state
  const [emailType, setEmailType] = useState<EmailType>("PIA Follow-up");
  const [dpsName, setDpsName] = useState("HR Onboarding Portal");
  const [dpsCategory, setDpsCategory] = useState<string>("HR");
  const [clientName, setClientName] = useState("Acme Corp");
  const [contactName, setContactName] = useState("People Ops Team");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState("2026-05-14");
  const [documents, setDocuments] = useState<string[]>([
    "Updated DSA with payroll vendor",
    "Cross-border SCC with HK BG-check provider",
  ]);
  const [newDoc, setNewDoc] = useState("");
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [actionItems, setActionItems] = useState<ActionItem[]>(MOCK_ACTION_ITEMS);
  const [notes, setNotes] = useState("Please pay attention to the highlighted sections on retention and SPI handling.");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedText, setUploadedText] = useState("");
  const [uploadedName, setUploadedName] = useState("");
  const [mappingScope, setMappingScope] = useState<"Personal" | "Shared">("Personal");
  const [mappingType, setMappingType] = useState<EmailType>("PIA Follow-up");

  // Recent
  const [emails, setEmails] = useState<EmailDraft[]>([]);

  useEffect(() => {
    setEmails(loadEmails());
    setTemplates(loadTemplates());
  }, []);

  // Smart doc suggestions (don't override user list)
  const suggestedDocs = useMemo(
    () => (SMART_DOC_MAP[dpsCategory] ?? DOC_SUGGESTIONS).filter((d) => !documents.includes(d)),
    [dpsCategory, documents],
  );

  // Build body from inputs
  const generate = () => {
    const tpl = DEFAULT_TEMPLATES[emailType];
    const vars: Record<string, string> = {
      DPS_NAME: dpsName,
      CLIENT_NAME: clientName,
      CONTACT_NAME: contactName,
      DATE: date,
      DEADLINE: deadline,
      DOCUMENTS_REQUESTED: formatDocs(documents),
      ACTION_ITEMS: includeActionItems ? formatActionItems(actionItems) : "  • (omitted)",
      NOTES: notes,
    };
    setSubject(fillTemplate(tpl.subject, vars));
    setBody(fillTemplate(tpl.body, vars));
    setPreviewOpen(true);
    logAction("Generated email", `${emailType} · ${dpsName}`);
  };

  const addDocument = (val: string) => {
    const v = val.trim();
    if (!v) return;
    if (documents.includes(v)) { toast.message("Already added"); return; }
    setDocuments([...documents, v]);
    setNewDoc("");
  };
  const removeDocument = (d: string) => setDocuments(documents.filter((x) => x !== d));

  const updateAction = (i: number, patch: Partial<ActionItem>) => {
    setActionItems(actionItems.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };
  const removeAction = (i: number) => setActionItems(actionItems.filter((_, idx) => idx !== i));
  const addAction = () => setActionItems([...actionItems, { text: "" }]);

  const saveDraft = (status: EmailStatus = "Pending Documentation") => {
    const draft: EmailDraft = {
      id: `EM-${Date.now()}`,
      type: emailType,
      subject,
      dpsName,
      clientName,
      contactName,
      date,
      deadline,
      documents,
      actionItems,
      includeActionItems,
      notes,
      body,
      status: computeStatus(deadline, status),
      createdAt: new Date().toISOString(),
    };
    const next = [draft, ...emails];
    setEmails(next);
    saveEmails(next);
    toast.success("Email saved");
    logAction("Saved email draft", draft.id);
    return draft;
  };

  const sendViaOutlook = () => {
    const draft = saveDraft("Under Review");
    const url = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.location.href = url;
    logAction("Opened email in Outlook", draft.id);
  };

  const reuseEmail = (e: EmailDraft) => {
    setEmailType(e.type);
    setDpsName(e.dpsName);
    setClientName(e.clientName);
    setContactName(e.contactName);
    setDate(e.date);
    setDeadline(e.deadline);
    setDocuments(e.documents);
    setActionItems(e.actionItems);
    setIncludeActionItems(e.includeActionItems);
    setNotes(e.notes);
    setSubject(e.subject);
    setBody(e.body);
    toast.success("Loaded into builder");
  };

  // Template upload — accept DOCX or TXT (DOCX read as raw best-effort)
  const onTemplateFile = async (file: File) => {
    setUploadedName(file.name);
    if (file.name.toLowerCase().endsWith(".txt")) {
      setUploadedText(await file.text());
    } else {
      // DOCX: best-effort placeholder — strip to a sample preview
      setUploadedText(
        `[Imported from ${file.name}]\n\nHi {{CONTACT_NAME}},\n\nThis is a draft template imported from your document. Highlight phrases below and replace them with placeholders such as {{DPS_NAME}}, {{DEADLINE}}, {{DOCUMENTS_REQUESTED}} or {{ACTION_ITEMS}}.\n\nRegards,\nPrivacy Team`
      );
    }
  };

  const insertPlaceholder = (token: string) => {
    setUploadedText((t) => t + (t.endsWith(" ") ? "" : " ") + token);
  };

  const saveImportedTemplate = () => {
    if (!uploadedText.trim()) { toast.error("Template is empty"); return; }
    const tpl: UserTemplate = {
      id: `TPL-${Date.now()}`,
      name: uploadedName || "Imported template",
      type: mappingType,
      scope: mappingScope,
      body: uploadedText,
      createdAt: new Date().toISOString(),
    };
    const next = [tpl, ...templates];
    setTemplates(next);
    saveTemplates(next);
    setUploadOpen(false);
    setUploadedText("");
    setUploadedName("");
    toast.success("Template saved");
    logAction("Saved email template", tpl.name);
  };

  const useTemplate = (tpl: UserTemplate) => {
    const vars: Record<string, string> = {
      DPS_NAME: dpsName,
      CLIENT_NAME: clientName,
      CONTACT_NAME: contactName,
      DATE: date,
      DEADLINE: deadline,
      DOCUMENTS_REQUESTED: formatDocs(documents),
      ACTION_ITEMS: includeActionItems ? formatActionItems(actionItems) : "  • (omitted)",
      NOTES: notes,
    };
    setEmailType(tpl.type);
    setBody(fillTemplate(tpl.body, vars));
    setSubject(`${tpl.type} — ${dpsName}`);
    setPreviewOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Email Generator"
        description="Build, preview, and send privacy follow-up emails with transcript-driven content."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(true)}>
              <UploadIcon className="mr-2 h-4 w-4" />Upload Template
            </Button>
            <Button onClick={generate}>
              <Sparkles className="mr-2 h-4 w-4" />Generate Email
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent ({emails.length})</TabsTrigger>
        </TabsList>

        {/* ---------------- BUILDER ---------------- */}
        <TabsContent value="builder">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <Card><CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Email details</h3>
                <Badge variant="outline" className="text-xs">{emailType}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Email Type">
                  <Select value={emailType} onValueChange={(v) => setEmailType(v as EmailType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DEFAULT_TEMPLATES) as EmailType[]).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="DPS Category">
                  <Select value={dpsCategory} onValueChange={setDpsCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(SMART_DOC_MAP).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="DPS Name"><Input value={dpsName} onChange={(e) => setDpsName(e.target.value)} /></Field>
                <Field label="Client Name"><Input value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Contact"><Input value={contactName} onChange={(e) => setContactName(e.target.value)} /></Field>
                <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
                <Field label="Deadline"><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
              </div>

              {/* Documents */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Documents Requested</Label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                  {documents.map((d) => (
                    <Badge key={d} variant="secondary" className="gap-1">
                      {d}
                      <button onClick={() => removeDocument(d)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {!documents.length && <span className="text-xs text-muted-foreground">No documents added</span>}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a document…"
                    value={newDoc}
                    onChange={(e) => setNewDoc(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDocument(newDoc))}
                  />
                  <Button type="button" variant="outline" onClick={() => addDocument(newDoc)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {!!suggestedDocs.length && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground mr-1">Suggested:</span>
                    {suggestedDocs.map((s) => (
                      <button
                        key={s}
                        onClick={() => addDocument(s)}
                        className="text-xs px-2 py-0.5 rounded-full border border-dashed hover:bg-accent/10"
                      >+ {s}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Action Items <span className="ml-1 italic">(from transcript)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Include in email</span>
                    <Switch checked={includeActionItems} onCheckedChange={setIncludeActionItems} />
                  </div>
                </div>
                <div className="space-y-2">
                  {actionItems.map((a, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-start">
                      <Input
                        className="col-span-6"
                        placeholder="Action"
                        value={a.text}
                        onChange={(e) => updateAction(i, { text: e.target.value })}
                      />
                      <Input
                        className="col-span-3"
                        placeholder="Owner"
                        value={a.owner ?? ""}
                        onChange={(e) => updateAction(i, { owner: e.target.value })}
                      />
                      <Input
                        className="col-span-2"
                        type="date"
                        value={a.deadline ?? ""}
                        onChange={(e) => updateAction(i, { deadline: e.target.value })}
                      />
                      <Button
                        variant="ghost" size="icon" className="col-span-1"
                        onClick={() => removeAction(i)}
                      ><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={addAction}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add action item
                </Button>
              </div>

              <Field label="Additional Notes">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </Field>

              <div className="flex gap-2 pt-2">
                <Button onClick={generate} className="flex-1">
                  <Wand2 className="h-4 w-4 mr-2" />Generate Email
                </Button>
                <Button variant="outline" onClick={() => setPreviewOpen(true)} disabled={!body}>
                  <Eye className="h-4 w-4 mr-2" />Preview
                </Button>
              </div>
            </CardContent></Card>

            {/* Live preview */}
            <Card><CardContent className="p-0">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />Email preview
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"
                    onClick={() => { navigator.clipboard.writeText(`${subject}\n\n${body}`); toast.success("Copied"); }}
                    disabled={!body}
                  ><Copy className="mr-2 h-3.5 w-3.5" />Copy</Button>
                  <Button size="sm" variant="outline" onClick={() => saveDraft()} disabled={!body}>
                    <Save className="mr-2 h-3.5 w-3.5" />Save
                  </Button>
                  <Button size="sm" onClick={sendViaOutlook} disabled={!body}>
                    <Send className="mr-2 h-3.5 w-3.5" />Send via Outlook
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Click Generate Email…" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Body (editable)</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={18}
                    className="font-mono text-xs leading-relaxed"
                    placeholder="Generated email will appear here…"
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground border rounded-md p-3 bg-warning/5 border-warning/20">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                  <span>
                    Reminder: This email is auto-generated. Please review and customize before sending to stakeholders.
                  </span>
                </div>
              </div>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* ---------------- TEMPLATES ---------------- */}
        <TabsContent value="templates">
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Saved templates</h3>
              <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
                <UploadIcon className="h-4 w-4 mr-2" />Upload Template
              </Button>
            </div>
            {!templates.length ? (
              <div className="text-sm text-muted-foreground border border-dashed rounded-md p-8 text-center">
                No templates yet. Upload a DOCX or TXT to get started.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {templates.map((t) => (
                  <div key={t.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">{t.name}</div>
                      <Badge variant="outline" className="text-[10px]">{t.scope}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">{t.type}</div>
                    <pre className="text-xs bg-muted/30 rounded p-2 max-h-32 overflow-auto whitespace-pre-wrap font-mono">
                      {t.body.slice(0, 280)}{t.body.length > 280 ? "…" : ""}
                    </pre>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => useTemplate(t)}>
                        Use template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ---------------- RECENT ---------------- */}
        <TabsContent value="recent">
          <Card><CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Recent Follow-up Emails</h3>
            {!emails.length ? (
              <div className="text-sm text-muted-foreground border border-dashed rounded-md p-8 text-center">
                No emails saved yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b">
                      <th className="py-2 pr-4">DPS Name</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Date Sent</th>
                      <th className="py-2 pr-4">Deadline</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((e) => {
                      const status = computeStatus(e.deadline, e.status);
                      return (
                        <tr key={e.id} className="border-b last:border-b-0">
                          <td className="py-2 pr-4 font-medium">{e.dpsName}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{e.type}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{e.createdAt.slice(0, 10)}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{e.deadline || "—"}</td>
                          <td className="py-2 pr-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[status]}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right">
                            <Button size="sm" variant="ghost" onClick={() => { reuseEmail(e); setPreviewOpen(true); }}>
                              <Eye className="h-3.5 w-3.5 mr-1" />View
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => reuseEmail(e)}>
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />Reuse
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ----- Preview Dialog ----- */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />Email Preview
            </DialogTitle>
            <DialogDescription>Review and edit before sending.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Body</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16} className="font-mono text-xs" />
            </div>
            <div className="text-xs text-muted-foreground border-l-2 border-warning pl-3">
              Reminder: This email is auto-generated. Please review and customize before sending to stakeholders.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`${subject}\n\n${body}`); toast.success("Copied"); }}>
              <Copy className="h-4 w-4 mr-2" />Copy
            </Button>
            <Button variant="outline" onClick={() => saveDraft()}>
              <Save className="h-4 w-4 mr-2" />Save Draft
            </Button>
            <Button onClick={sendViaOutlook}>
              <Send className="h-4 w-4 mr-2" />Send via Outlook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----- Upload Template Dialog ----- */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upload Email Template</DialogTitle>
            <DialogDescription>
              Accepts DOCX or TXT. After upload, insert placeholders to map dynamic fields.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm">Choose a .docx or .txt file</p>
              <input
                type="file"
                accept=".docx,.txt"
                className="mt-3 text-xs"
                onChange={(e) => e.target.files?.[0] && onTemplateFile(e.target.files[0])}
              />
              {uploadedName && <p className="text-xs text-muted-foreground mt-2">Loaded: {uploadedName}</p>}
            </div>

            {uploadedText && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Template Type">
                    <Select value={mappingType} onValueChange={(v) => setMappingType(v as EmailType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(DEFAULT_TEMPLATES) as EmailType[]).map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Scope">
                    <Select value={mappingScope} onValueChange={(v) => setMappingScope(v as "Personal" | "Shared")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Shared">Shared (future-ready)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Insert placeholder at end of template
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {["{{DPS_NAME}}","{{CLIENT_NAME}}","{{CONTACT_NAME}}","{{DATE}}","{{DEADLINE}}","{{DOCUMENTS_REQUESTED}}","{{ACTION_ITEMS}}","{{NOTES}}"].map((p) => (
                      <button
                        key={p}
                        onClick={() => insertPlaceholder(p)}
                        className="text-xs px-2 py-1 rounded border hover:bg-accent/10 font-mono"
                      >{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Template body (editable — replace highlighted phrases with placeholders above)
                  </Label>
                  <Textarea
                    value={uploadedText}
                    onChange={(e) => setUploadedText(e.target.value)}
                    rows={12}
                    className="font-mono text-xs"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={saveImportedTemplate} disabled={!uploadedText}>
              <Save className="h-4 w-4 mr-2" />Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

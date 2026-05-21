import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { RelatedLinks } from "@/components/RelatedLinks";
import { ShieldAlert, Upload as UploadIcon2, BookOpen } from "lucide-react";
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
import {
  Plus, X, Upload as UploadIcon, FileText, Mail, RotateCcw, Save, Send, Eye,
  Pencil, Bold, List, ListOrdered, Table as TableIcon, Image as ImageIcon, Paperclip, Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// ---------- Types ----------
type TemplateScope = "External" | "Internal";
type EmailStatus = "Draft" | "Sent" | "Under Review" | "Completed" | "Overdue";

interface ActionItem { text: string; owner?: string; deadline?: string }

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  scope: TemplateScope;
  subject: string;
  body: string;     // HTML
  builtIn?: boolean;
}

interface EmailDraft {
  id: string;
  templateId: string;
  templateName: string;
  scope: TemplateScope;
  subject: string;
  bodyHtml: string;
  dpsName: string;
  clientName: string;
  contactName: string;
  date: string;
  deadline: string;
  documents: string[];
  includeActionItems: boolean;
  status: EmailStatus;
  createdAt: string;
}

const EMAILS_KEY = "pa_emails";
const TEMPLATES_KEY = "pa_email_templates_v2";

const DOC_SUGGESTIONS = [
  "Privacy Notice", "Data Processing Agreement", "Security Assessment Report",
  "Data Retention Policy", "Access Control Matrix",
];

const MOCK_ACTION_ITEMS: ActionItem[] = [
  { text: "Provide updated DSA with payroll vendor", owner: "John D. (HR Lead)", deadline: "2026-05-10" },
  { text: "Share SCC for cross-border BG-check provider", owner: "Legal", deadline: "2026-05-12" },
  { text: "Submit latest access review report", owner: "IT Security", deadline: "2026-05-08" },
];

const BUILT_IN_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl-pia-followup",
    name: "PIA Follow-up (External)",
    description: "Follow-up email after PIA walkthrough session",
    scope: "External",
    subject: "Follow-up: Privacy Impact Assessment for {{DPS_NAME}}",
    body:
      `<p>Dear {{CONTACT_NAME}},</p>
<p>Following our recent walkthrough session regarding the Privacy Impact Assessment (PIA) for <strong>{{DPS_NAME}}</strong>, I am writing to provide a summary and outline the next steps.</p>
<p><strong>Date of Meeting:</strong> {{DATE}}<br/><strong>Deadline for Submission:</strong> {{DEADLINE}}</p>
<p><strong>Documents Requested:</strong></p>
{{DOCUMENTS_REQUESTED}}
<p><strong>Action Items:</strong></p>
{{ACTION_ITEMS}}
<p>Please ensure all requested documentation is submitted by the deadline mentioned above. If you have any questions or require clarification, do not hesitate to reach out.</p>
<p>We appreciate your cooperation in ensuring compliance with data privacy regulations.</p>
<p>Best regards,<br/>Privacy Team — {{CLIENT_NAME}}</p>`,
    builtIn: true,
  },
  {
    id: "tpl-drl-request",
    name: "DRL Request (External)",
    description: "Document request list for compliance verification",
    scope: "External",
    subject: "Document Request List — {{DPS_NAME}}",
    body:
      `<p>Dear {{CONTACT_NAME}},</p>
<p>As part of the ongoing review of <strong>{{DPS_NAME}}</strong>, please provide the following documents by <strong>{{DEADLINE}}</strong>:</p>
{{DOCUMENTS_REQUESTED}}
<p><strong>Action Items:</strong></p>
{{ACTION_ITEMS}}
<p>Best regards,<br/>Privacy Team — {{CLIENT_NAME}}</p>`,
    builtIn: true,
  },
  {
    id: "tpl-reminder",
    name: "Reminder / Escalation (External)",
    description: "Reminder or escalation for pending items",
    scope: "External",
    subject: "Reminder — Pending items for {{DPS_NAME}}",
    body:
      `<p>Dear {{CONTACT_NAME}},</p>
<p>This is a friendly reminder regarding the pending items for <strong>{{DPS_NAME}}</strong>, originally requested on {{DATE}}.</p>
<p><strong>Outstanding documents:</strong></p>
{{DOCUMENTS_REQUESTED}}
<p><strong>Open action items:</strong></p>
{{ACTION_ITEMS}}
<p>Kindly share these by <strong>{{DEADLINE}}</strong>.</p>
<p>Best regards,<br/>Privacy Team — {{CLIENT_NAME}}</p>`,
    builtIn: true,
  },
  {
    id: "tpl-internal",
    name: "Internal Coordination (Internal)",
    description: "Internal team coordination and updates",
    scope: "Internal",
    subject: "Internal — Coordination on {{DPS_NAME}}",
    body:
      `<p>Team,</p>
<p>Sharing a quick coordination note on <strong>{{DPS_NAME}}</strong> ({{CLIENT_NAME}}).</p>
<p><strong>Action items:</strong></p>
{{ACTION_ITEMS}}
<p><strong>Open documents:</strong></p>
{{DOCUMENTS_REQUESTED}}
<p>Target close date: <strong>{{DEADLINE}}</strong>.</p>
<p>Thanks,<br/>Privacy Team</p>`,
    builtIn: true,
  },
];

const DPS_OPTIONS = [
  "HR Onboarding Portal",
  "Employee Management System",
  "CRM Platform",
  "Payroll System",
  "Marketing Automation",
];

// ---------- Helpers ----------
function loadEmails(): EmailDraft[] {
  try { return JSON.parse(localStorage.getItem(EMAILS_KEY) || "[]"); } catch { return []; }
}
function saveEmails(list: EmailDraft[]) {
  localStorage.setItem(EMAILS_KEY, JSON.stringify(list.slice(0, 50)));
}
function loadTemplates(): EmailTemplate[] {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]"); } catch { return []; }
}
function saveTemplates(list: EmailTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function docsToHtml(docs: string[]): string {
  if (!docs.length) return "<ul><li><em>(none)</em></li></ul>";
  return `<ol>${docs.map((d, i) => `<li>${escapeHtml(d)}</li>`).join("")}</ol>`;
}
function actionsToHtml(items: ActionItem[], include: boolean): string {
  if (!include) return "<ul><li><em>(omitted)</em></li></ul>";
  if (!items.length) return "<ul><li><em>(no action items)</em></li></ul>";
  return `<ol>${items.map((it) => {
    const meta = [it.owner ? `Owner: ${escapeHtml(it.owner)}` : "", it.deadline ? `Due: ${escapeHtml(it.deadline)}` : ""]
      .filter(Boolean).join(" · ");
    return `<li>${escapeHtml(it.text)}${meta ? ` <span style="color:#64748b">(${meta})</span>` : ""}</li>`;
  }).join("")}</ol>`;
}
function fillVars(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? `{{${k}}}`));
}

const STATUS_STYLES: Record<EmailStatus, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Sent: "bg-success/15 text-success border-success/30",
  "Under Review": "bg-accent/15 text-accent border-accent/30",
  Completed: "bg-success/15 text-success border-success/30",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
};

// ---------- Component ----------
export default function EmailGenerator() {
  const { logAction } = useAuth();

  const [userTemplates, setUserTemplates] = useState<EmailTemplate[]>([]);
  const [emails, setEmails] = useState<EmailDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form state
  const [dpsName, setDpsName] = useState("HR Onboarding Portal");
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

  // Editable preview
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  // Modals
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState<EmailDraft | null>(null);

  // Create / edit form
  const [tplDraft, setTplDraft] = useState<EmailTemplate>({
    id: "", name: "", description: "", scope: "External", subject: "", body: "",
  });

  useEffect(() => {
    setEmails(loadEmails());
    setUserTemplates(loadTemplates());
  }, []);

  const allTemplates: EmailTemplate[] = useMemo(
    () => [...BUILT_IN_TEMPLATES, ...userTemplates],
    [userTemplates],
  );

  const selectedTemplate = allTemplates.find((t) => t.id === selectedId) ?? null;
  const topFour = allTemplates.slice(0, 4);

  // Build vars and fill template
  const buildVars = (): Record<string, string> => ({
    DPS_NAME: dpsName,
    CLIENT_NAME: clientName,
    CONTACT_NAME: contactName,
    DATE: date,
    DEADLINE: deadline,
    DOCUMENTS_REQUESTED: docsToHtml(documents),
    ACTION_ITEMS: actionsToHtml(MOCK_ACTION_ITEMS, includeActionItems),
  });

  const applyTemplate = (tpl: EmailTemplate) => {
    const vars = buildVars();
    const sub = fillVars(tpl.subject, vars);
    const body = fillVars(tpl.body, vars);
    setSubject(sub);
    setBodyHtml(body);
    if (editorRef.current) editorRef.current.innerHTML = body;
  };

  const selectTemplate = (id: string) => {
    setSelectedId(id);
    const tpl = allTemplates.find((t) => t.id === id);
    if (tpl) applyTemplate(tpl);
  };

  // Re-fill when form fields change (preserves user edits to body? — keep simple: only refresh on explicit Reset)
  // Subject is regenerated automatically when DPS/contact changes IF the user hasn't manually edited.
  // To keep things simple and predictable, we don't auto-overwrite. User can hit "Reset to Template".

  const resetToTemplate = () => {
    if (!selectedTemplate) return;
    applyTemplate(selectedTemplate);
    toast.success("Reverted to template");
  };

  // Documents
  const addDocument = (val: string) => {
    const v = val.trim();
    if (!v) return;
    if (documents.includes(v)) { toast.message("Already added"); return; }
    setDocuments([...documents, v]);
    setNewDoc("");
  };
  const removeDocument = (d: string) => setDocuments(documents.filter((x) => x !== d));

  // Rich text commands
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  };
  const insertTable = () => {
    const html = `<table style="border-collapse:collapse;width:100%;margin:8px 0">
<thead><tr><th style="border:1px solid #cbd5e1;padding:6px;background:#f1f5f9">Item</th><th style="border:1px solid #cbd5e1;padding:6px;background:#f1f5f9">Owner</th><th style="border:1px solid #cbd5e1;padding:6px;background:#f1f5f9">Due</th></tr></thead>
<tbody><tr><td style="border:1px solid #cbd5e1;padding:6px"> </td><td style="border:1px solid #cbd5e1;padding:6px"> </td><td style="border:1px solid #cbd5e1;padding:6px"> </td></tr></tbody>
</table><p></p>`;
    exec("insertHTML", html);
  };
  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (url) exec("insertImage", url);
  };
  const insertAttachment = () => {
    const url = window.prompt("Attachment URL");
    const name = window.prompt("Attachment name (e.g. invoice.pdf)") || "attachment";
    if (url) exec("insertHTML", `<p>📎 <a href="${escapeHtml(url)}">${escapeHtml(name)}</a></p>`);
  };

  // Save / send
  const buildDraft = (status: EmailStatus): EmailDraft => ({
    id: `EM-${Date.now()}`,
    templateId: selectedTemplate?.id ?? "",
    templateName: selectedTemplate?.name ?? "Custom",
    scope: selectedTemplate?.scope ?? "External",
    subject,
    bodyHtml: editorRef.current?.innerHTML ?? bodyHtml,
    dpsName, clientName, contactName, date, deadline,
    documents, includeActionItems, status,
    createdAt: new Date().toISOString(),
  });
  const saveDraft = (status: EmailStatus = "Draft") => {
    const draft = buildDraft(status);
    const next = [draft, ...emails];
    setEmails(next);
    saveEmails(next);
    toast.success("Email saved");
    logAction("Saved email draft", draft.id);
    return draft;
  };
  const sendViaOutlook = () => {
    const draft = saveDraft("Sent");
    const text = (editorRef.current?.innerText ?? bodyHtml).trim();
    const url = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
    logAction("Opened email in Outlook", draft.id);
  };

  const reuseEmail = (e: EmailDraft) => {
    setSelectedId(e.templateId || null);
    setDpsName(e.dpsName); setClientName(e.clientName); setContactName(e.contactName);
    setDate(e.date); setDeadline(e.deadline); setDocuments(e.documents);
    setIncludeActionItems(e.includeActionItems);
    setSubject(e.subject); setBodyHtml(e.bodyHtml);
    if (editorRef.current) editorRef.current.innerHTML = e.bodyHtml;
    toast.success("Loaded into builder");
  };

  // Template CRUD
  const openCreate = () => {
    setTplDraft({ id: "", name: "", description: "", scope: "External", subject: "", body: "<p></p>" });
    setCreateOpen(true);
  };
  const openEdit = () => {
    if (!selectedTemplate) return;
    setTplDraft({ ...selectedTemplate });
    setEditOpen(true);
  };
  const saveTemplate = (mode: "create" | "edit") => {
    if (!tplDraft.name.trim() || !tplDraft.subject.trim()) {
      toast.error("Name and subject are required");
      return;
    }
    if (mode === "create") {
      const tpl: EmailTemplate = { ...tplDraft, id: `TPL-${Date.now()}` };
      const next = [tpl, ...userTemplates];
      setUserTemplates(next); saveTemplates(next);
      setCreateOpen(false);
      setSelectedId(tpl.id);
      applyTemplate(tpl);
      toast.success("Template created");
    } else {
      // Editing a built-in clones it as a user template
      const isBuiltIn = !!BUILT_IN_TEMPLATES.find((b) => b.id === tplDraft.id);
      if (isBuiltIn) {
        const tpl: EmailTemplate = { ...tplDraft, id: `TPL-${Date.now()}`, builtIn: false };
        const next = [tpl, ...userTemplates];
        setUserTemplates(next); saveTemplates(next);
        setSelectedId(tpl.id); applyTemplate(tpl);
        toast.success("Saved as new template");
      } else {
        const next = userTemplates.map((t) => (t.id === tplDraft.id ? { ...tplDraft } : t));
        setUserTemplates(next); saveTemplates(next);
        applyTemplate(tplDraft);
        toast.success("Template updated");
      }
      setEditOpen(false);
    }
  };

  // Upload template
  const [uploadName, setUploadName] = useState("");
  const [uploadText, setUploadText] = useState("");
  const onTemplateFile = async (file: File) => {
    setUploadName(file.name);
    if (file.name.toLowerCase().endsWith(".txt")) {
      setUploadText(await file.text());
    } else {
      setUploadText(
        `Hi {{CONTACT_NAME}},\n\nThis is a draft template imported from "${file.name}". Replace highlighted phrases with placeholders such as {{DPS_NAME}}, {{DEADLINE}}, {{DOCUMENTS_REQUESTED}}, {{ACTION_ITEMS}}.\n\nRegards,\nPrivacy Team`,
      );
    }
  };
  const saveUploaded = () => {
    if (!uploadText.trim()) { toast.error("Template is empty"); return; }
    const html = uploadText.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`).join("");
    const tpl: EmailTemplate = {
      id: `TPL-${Date.now()}`,
      name: uploadName.replace(/\.[^.]+$/, "") || "Imported Template",
      description: "Imported from file",
      scope: "External",
      subject: `Follow-up — {{DPS_NAME}}`,
      body: html,
    };
    const next = [tpl, ...userTemplates];
    setUserTemplates(next); saveTemplates(next);
    setUploadOpen(false); setUploadText(""); setUploadName("");
    setSelectedId(tpl.id); applyTemplate(tpl);
    toast.success("Template uploaded");
  };

  return (
    <>
      <PageHeader
        title="Email Generator"
        description="Generate professional follow-up emails with customizable templates"
      />

      {/* ---- Template selection row ---- */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3">Choose a Template</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {topFour.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              selected={selectedId === tpl.id}
              onClick={() => selectTemplate(tpl.id)}
            />
          ))}
          <button
            onClick={() => setSeeMoreOpen(true)}
            className="rounded-lg border-2 border-dashed border-border bg-card hover:border-primary hover:bg-accent/5 transition-colors p-4 flex flex-col items-center justify-center text-center min-h-[140px]"
          >
            <Plus className="h-6 w-6 text-muted-foreground mb-2" />
            <div className="text-sm font-medium">See More</div>
            <div className="text-xs text-muted-foreground mt-0.5">Browse or create</div>
          </button>
        </div>
      </section>

      {/* ---- Two panels (only when a template is selected) ---- */}
      {selectedTemplate && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={openEdit}>
              <Pencil className="h-4 w-4 mr-2" />Edit Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              <UploadIcon className="h-4 w-4 mr-2" />Upload Template (DOCX/TXT)
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Email Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Email Details</h3>
                  <p className="text-xs text-muted-foreground">Fill in the variables for this email</p>
                </div>

                <Field label="Email Type">
                  <Input value={selectedTemplate.name} disabled />
                </Field>

                <Field label="DPS Name *">
                  <Select value={dpsName} onValueChange={setDpsName}>
                    <SelectTrigger><SelectValue placeholder="Select DPS" /></SelectTrigger>
                    <SelectContent>
                      {DPS_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Client Name">
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g., ABC Corporation" />
                </Field>

                <Field label="Contact Name *">
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g., John Doe" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                  <Field label="Deadline *">
                    <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </Field>
                </div>

                {/* Documents */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Documents Requested</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter document name"
                      value={newDoc}
                      onChange={(e) => setNewDoc(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDocument(newDoc))}
                    />
                    <Button type="button" size="icon" onClick={() => addDocument(newDoc)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {documents.map((d) => (
                      <Badge key={d} variant="secondary" className="gap-1">
                        {d}
                        <button onClick={() => removeDocument(d)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DOC_SUGGESTIONS.filter((d) => !documents.includes(d)).map((d) => (
                      <button
                        key={d}
                        onClick={() => addDocument(d)}
                        className="text-xs px-2 py-1 rounded-full border border-border hover:bg-accent/10"
                      >+ {d}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">Include Action Items in Email</div>
                    <div className="text-xs text-muted-foreground">Pulled from transcript walkthrough</div>
                  </div>
                  <Switch checked={includeActionItems} onCheckedChange={setIncludeActionItems} />
                </div>

                {includeActionItems && (
                  <div className="rounded-md border bg-muted/20 p-3 space-y-1.5">
                    {MOCK_ACTION_ITEMS.map((it, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-medium">{i + 1}.</span> {it.text}
                        {it.owner && <span className="text-muted-foreground"> · {it.owner}</span>}
                        {it.deadline && <span className="text-muted-foreground"> · due {it.deadline}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RIGHT: Editable Preview */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Email Preview</h3>
                    <p className="text-xs text-muted-foreground">Live preview · editable before sending</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetToTemplate}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset to Template
                  </Button>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="font-medium" />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Body</Label>
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 border border-b-0 rounded-t-md bg-muted/30 px-2 py-1.5">
                    <ToolBtn onClick={() => exec("bold")} title="Bold"><Bold className="h-3.5 w-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullets"><List className="h-3.5 w-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
                    <span className="w-px h-4 bg-border mx-1" />
                    <ToolBtn onClick={insertTable} title="Insert table"><TableIcon className="h-3.5 w-3.5" /></ToolBtn>
                    <ToolBtn onClick={insertImage} title="Insert image"><ImageIcon className="h-3.5 w-3.5" /></ToolBtn>
                    <ToolBtn onClick={insertAttachment} title="Insert attachment link"><Paperclip className="h-3.5 w-3.5" /></ToolBtn>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setBodyHtml((e.target as HTMLDivElement).innerHTML)}
                    className="min-h-[320px] border rounded-b-md p-4 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring prose prose-sm max-w-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-2"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="outline" onClick={() => saveDraft("Draft")}>
                    <Save className="h-4 w-4 mr-2" />Save Draft
                  </Button>
                  <Button onClick={sendViaOutlook}>
                    <Send className="h-4 w-4 mr-2" />Send via Outlook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ---- Recent emails ---- */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Recent Emails</h3>
            <p className="text-xs text-muted-foreground">Previously drafted and sent emails</p>
          </div>
          {emails.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-md">
              No emails yet. Pick a template to start.
            </div>
          ) : (
            <ul className="divide-y">
              {emails.map((e) => (
                <li key={e.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{e.dpsName}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[e.status]}`}>{e.status}</span>
                      <span className="text-xs text-muted-foreground">{e.templateName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Created: {new Date(e.createdAt).toISOString().slice(0, 10)} · Deadline: {e.deadline || "—"}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setViewOpen(e)}>
                    <Eye className="h-4 w-4 mr-1.5" />View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reuseEmail(e)}>Reuse</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ---- Reminder banner ---- */}
      <div className="mt-6 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
        <strong className="text-warning">Reminder:</strong>{" "}
        <span className="text-foreground/80">This email is auto-generated. Please review and customize before sending.</span>
      </div>

      {/* ============ See More Modal ============ */}
      <Dialog open={seeMoreOpen} onOpenChange={setSeeMoreOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Templates</DialogTitle>
            <DialogDescription>Browse the full library or create a new template.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
            <Button onClick={() => { setSeeMoreOpen(false); openCreate(); }}>
              <Plus className="h-4 w-4 mr-2" />Create New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {allTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                tpl={tpl}
                selected={selectedId === tpl.id}
                onClick={() => { selectTemplate(tpl.id); setSeeMoreOpen(false); }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ Create / Edit Template Modal ============ */}
      <Dialog open={createOpen || editOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setEditOpen(false); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{createOpen ? "Create New Template" : "Edit Template"}</DialogTitle>
            <DialogDescription>
              {editOpen && BUILT_IN_TEMPLATES.find((b) => b.id === tplDraft.id)
                ? "Built-in templates can't be overwritten — your edits will be saved as a new template."
                : "Use placeholders like {{DPS_NAME}}, {{CONTACT_NAME}}, {{DATE}}, {{DEADLINE}}, {{DOCUMENTS_REQUESTED}}, {{ACTION_ITEMS}}, {{CLIENT_NAME}}."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Template Name">
                <Input value={tplDraft.name} onChange={(e) => setTplDraft({ ...tplDraft, name: e.target.value })} placeholder="e.g. Vendor Risk Follow-up" />
              </Field>
              <Field label="Type">
                <Select value={tplDraft.scope} onValueChange={(v) => setTplDraft({ ...tplDraft, scope: v as TemplateScope })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="External">External</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <Input value={tplDraft.description} onChange={(e) => setTplDraft({ ...tplDraft, description: e.target.value })} placeholder="Short description shown on the card" />
            </Field>
            <Field label="Subject">
              <Input value={tplDraft.subject} onChange={(e) => setTplDraft({ ...tplDraft, subject: e.target.value })} placeholder="Subject line with placeholders" />
            </Field>
            <Field label="Body (HTML)">
              <Textarea
                value={tplDraft.body}
                onChange={(e) => setTplDraft({ ...tplDraft, body: e.target.value })}
                rows={12}
                className="font-mono text-xs"
                placeholder="<p>Hi {{CONTACT_NAME}}, ...</p>"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditOpen(false); }}>Cancel</Button>
            <Button onClick={() => saveTemplate(createOpen ? "create" : "edit")}>
              <Check className="h-4 w-4 mr-2" />Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Upload Template Modal ============ */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Email Template</DialogTitle>
            <DialogDescription>Accepts DOCX or TXT — converted into an editable template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm">Choose a .docx or .txt file</p>
              <input
                type="file"
                accept=".docx,.txt"
                className="mt-3 text-xs"
                onChange={(e) => e.target.files?.[0] && onTemplateFile(e.target.files[0])}
              />
              {uploadName && <p className="text-xs text-muted-foreground mt-2">Loaded: {uploadName}</p>}
            </div>
            {uploadText && (
              <Textarea value={uploadText} onChange={(e) => setUploadText(e.target.value)} rows={12} className="font-mono text-xs" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={saveUploaded} disabled={!uploadText}>
              <Save className="h-4 w-4 mr-2" />Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ View Email Modal ============ */}
      <Dialog open={!!viewOpen} onOpenChange={(o) => !o && setViewOpen(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="h-4 w-4" />{viewOpen?.subject}</DialogTitle>
            <DialogDescription>{viewOpen?.dpsName} · {viewOpen && new Date(viewOpen.createdAt).toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none border rounded-md p-4 bg-background max-h-[60vh] overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: viewOpen?.bodyHtml ?? "" }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(null)}>Close</Button>
            {viewOpen && <Button onClick={() => { reuseEmail(viewOpen); setViewOpen(null); }}>Reuse</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Subcomponents ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function ToolBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent/30 text-foreground/80"
    >
      {children}
    </button>
  );
}

function TemplateCard({
  tpl, selected, onClick,
}: { tpl: EmailTemplate; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border bg-card p-4 transition-all min-h-[140px] flex flex-col ${
        selected
          ? "border-primary ring-2 ring-primary/30 shadow-sm"
          : "border-border hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="font-semibold text-sm leading-tight">{tpl.name}</div>
        {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
      </div>
      <p className="text-xs text-muted-foreground flex-1">{tpl.description}</p>
      <div className="mt-3">
        <span
          className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${
            tpl.scope === "External"
              ? "bg-foreground text-background"
              : "bg-accent/20 text-accent border border-accent/30"
          }`}
        >
          {tpl.scope}
        </span>
      </div>
    </button>
  );
}

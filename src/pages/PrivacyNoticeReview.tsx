import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Eye, FileCheck2, Plus, Trash2, ShieldCheck, ListChecks, ArrowLeft, ChevronDown } from "lucide-react";
import {
  loadNotices, upsertNotice, deleteNotice, newNotice, compliance, PrivacyNotice,
} from "@/lib/privacyNotice/store";
import { SECTIONS, sectionsFor, NoticeType } from "@/lib/privacyNotice/template";
import { logAction } from "@/lib/auditLog";
import { DrlInlinePanel } from "@/components/DrlInlinePanel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

const NOTICE_TYPES: NoticeType[] = ["Full", "Layered", "CCTV", "JustInTime"];

export default function PrivacyNoticeReview() {
  const [params, setParams] = useSearchParams();
  const openId = params.get("id");
  const [tab, setTab] = useState(params.get("tab") || "summary");
  const [notices, setNotices] = useState<PrivacyNotice[]>([]);
  const [newDlg, setNewDlg] = useState(false);
  const [draft, setDraft] = useState({ dpsName: "", type: "Full" as NoticeType });

  const refresh = () => setNotices(loadNotices());
  useEffect(() => { refresh(); }, []);

  const current = openId ? notices.find(n => n.id === openId) : null;

  if (current) return <NoticeEditor notice={current} onBack={() => { setParams({}); refresh(); }} />;

  const compliant = notices.filter(n => {
    const c = compliance(n); return c.total > 0 && c.complied === c.total;
  }).length;
  const total = notices.length;

  return (
    <PageShell
      title="Privacy Notice Review"
      subtitle="Evaluate client privacy notices against the DPA / NPC criteria."
      actions={<Button onClick={() => setNewDlg(true)}><Plus className="mr-2 h-4 w-4" />New notice</Button>}
    >
      <SectionTabs
        tabs={[{ id: "summary", label: "Summary" }, { id: "wf", label: "Working File", count: notices.length }, { id: "drl", label: "DRL" }, { id: "ref", label: "References" }]}
        value={tab} onChange={setTab}
      />

      {tab === "summary" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Notices" value={total} icon={Eye} accent="blue" />
            <StatTile label="Fully compliant" value={compliant} icon={FileCheck2} accent="green" />
            <StatTile label="Needs work" value={total - compliant} icon={ShieldCheck} accent="amber" />
            <StatTile label="Avg. compliance" value={total ? `${Math.round(notices.reduce((s, n) => {
              const c = compliance(n); return s + (c.total ? (c.complied / c.total) * 100 : 0);
            }, 0) / total)}%` : "—"} icon={ListChecks} accent="violet" />
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">DPS / Notice</th>
                    <th className="text-left font-medium px-4 py-2.5">Type</th>
                    <th className="text-left font-medium px-4 py-2.5">Department</th>
                    <th className="text-left font-medium px-4 py-2.5">Status</th>
                    <th className="text-left font-medium px-4 py-2.5">Compliance</th>
                    <th className="text-right font-medium px-4 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No notices yet. Click <strong>New notice</strong> to begin an assessment.
                    </td></tr>
                  )}
                  {notices.map(n => {
                    const c = compliance(n);
                    const pct = c.total ? Math.round((c.complied / c.total) * 100) : 0;
                    return (
                      <tr key={n.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">
                          <button className="hover:text-accent" onClick={() => setParams({ id: n.id })}>{n.dpsName}</button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{n.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{n.department || "—"}</td>
                        <td className="px-4 py-3"><span className="status-chip bg-muted text-muted-foreground border-border">{n.status}</span></td>
                        <td className="px-4 py-3 text-xs">{c.complied}/{c.total} ({pct}%)</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => { deleteNotice(n.id); refresh(); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "wf" && <WorkingFileTab notices={notices} onOpen={(id) => setParams({ id })} />}

      {tab === "drl" && <DrlInlinePanel category="notice" title="Privacy Notice DRL items" />}

      {tab === "ref" && (
        <Card><CardContent className="p-6 text-sm space-y-2">
          <p className="font-semibold">References (admin-configurable)</p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Republic Act 10173 (Data Privacy Act of 2012) — § 16 (Rights of Data Subject)</li>
            <li>NPC Circular 16-01 (Security of Personal Data)</li>
            <li>NPC Advisory 2017-01 (Designation of Data Protection Officers)</li>
            <li>NPC Privacy Notice Toolkit</li>
          </ul>
        </CardContent></Card>
      )}

      <Dialog open={newDlg} onOpenChange={setNewDlg}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Privacy Notice</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="DPS Name" value={draft.dpsName} onChange={(e) => setDraft({ ...draft, dpsName: e.target.value })} />
            <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as NoticeType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {NOTICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDlg(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!draft.dpsName.trim()) { toast.error("DPS Name required"); return; }
              const n = newNotice(draft.dpsName.trim(), draft.type);
              upsertNotice(n); logAction("PrivacyNotice.create", n.dpsName);
              setNewDlg(false); setDraft({ dpsName: "", type: "Full" }); refresh();
              setParams({ id: n.id });
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function NoticeEditor({ notice, onBack }: { notice: PrivacyNotice; onBack: () => void }) {
  const [n, setN] = useState<PrivacyNotice>(notice);
  const sections = sectionsFor(n.type);

  const set = (patch: Partial<PrivacyNotice>) => setN({ ...n, ...patch });
  const setAns = (id: string, patch: Partial<typeof n.answers[string]>) => {
    const ans = { ...(n.answers[id] || { comply: false, reason: "", notes: "" }), ...patch };
    setN({ ...n, answers: { ...n.answers, [id]: ans } });
  };

  const save = () => { upsertNotice(n); logAction("PrivacyNotice.save", n.dpsName); toast.success("Notice saved"); };

  return (
    <PageShell
      title={n.dpsName}
      subtitle={`${n.type} Privacy Notice assessment`}
      actions={<>
        <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
        <Button onClick={save}>Save</Button>
      </>}
    >
      <Card><CardContent className="p-4 grid md:grid-cols-4 gap-3 text-sm">
        <div><label className="text-xs text-muted-foreground">Type</label>
          <Select value={n.type} onValueChange={(v) => set({ type: v as NoticeType })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{NOTICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><label className="text-xs text-muted-foreground">Department</label>
          <Input value={n.department} onChange={(e) => set({ department: e.target.value })} className="h-9" />
        </div>
        <div><label className="text-xs text-muted-foreground">Status</label>
          <Select value={n.status} onValueChange={(v) => set({ status: v as PrivacyNotice["status"] })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Non-compliant">Non-compliant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><label className="text-xs text-muted-foreground">DPS Name</label>
          <Input value={n.dpsName} onChange={(e) => set({ dpsName: e.target.value })} className="h-9" />
        </div>
      </CardContent></Card>

      {sections.map(sid => {
        const sec = SECTIONS[sid];
        return (
          <Card key={sid}>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h3 className="font-semibold text-sm">{sec.title}</h3>
                {sec.intro && <p className="text-xs text-muted-foreground mt-1">{sec.intro}</p>}
              </div>
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="text-left font-medium px-3 py-2 w-20">Comply?</th>
                    <th className="text-left font-medium px-3 py-2">Description</th>
                    <th className="text-left font-medium px-3 py-2 w-72">Reason</th>
                    <th className="text-left font-medium px-3 py-2 w-72">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.items.map(it => {
                    const a = n.answers[it.id] || { comply: false, reason: "", notes: "" };
                    return (
                      <tr key={it.id} className="border-b last:border-0">
                        <td className="px-3 py-2"><Checkbox checked={a.comply} onCheckedChange={(v) => setAns(it.id, { comply: !!v })} /></td>
                        <td className="px-3 py-2">{it.description}</td>
                        <td className="px-3 py-2"><Textarea rows={2} className="text-xs" value={a.reason} onChange={(e) => setAns(it.id, { reason: e.target.value })} /></td>
                        <td className="px-3 py-2"><Textarea rows={2} className="text-xs" value={a.notes} onChange={(e) => setAns(it.id, { notes: e.target.value })} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </PageShell>
  );
}

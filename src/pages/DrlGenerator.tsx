import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusChip } from "@/components/StatusChip";
import { drlSystems } from "@/lib/mockData";
import { Sparkles, Download, FileText, Mail, BookOpen, ShieldCheck } from "lucide-react";
import { loadActions, saveActions, ActionItem } from "@/lib/actionsStore";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const guideQuestions = [
  "Confirm encryption is enforced at rest and in transit for all production data stores.",
  "Provide MFA enrollment evidence for all privileged users.",
  "Walk through quarterly access review process and provide latest report.",
  "Demonstrate egress filtering rules and exception handling.",
  "Show backup integrity test results within the past 90 days.",
];

const drl = [
  { item: "Network diagram (current state)", status: "Open", owner: "Network Team" },
  { item: "Endpoint encryption attestation report", status: "Open", owner: "IT Ops" },
  { item: "MFA enrollment register", status: "Closed", owner: "IT Sec" },
  { item: "Quarterly access review (Q1 2026)", status: "Open", owner: "IT Sec" },
  { item: "Backup test logs (last 90 days)", status: "Open", owner: "DBA" },
];

const irl = [
  { q: "How is privileged access provisioned and de-provisioned?", basis: "ISO 27001 A.9.2" },
  { q: "What is the patch management cadence for endpoints and servers?", basis: "NPC IRR Sec 26" },
  { q: "How are third-party integrations reviewed for data privacy impact?", basis: "DPA Sec 20" },
  { q: "What is the escalation path for a confirmed data breach?", basis: "NPC Circular 16-03" },
];

export default function DrlGenerator() {
  const [params] = useSearchParams();
  const piaId = params.get("piaId");
  const source = params.get("source");
  const [actions, setActions] = useState<ActionItem[]>([]);
  const defaultTab = source === "transcript" || piaId ? "actions" : "guide";

  useEffect(() => { setActions(loadActions()); }, []);

  const updateStatus = (id: string, status: ActionItem["status"]) => {
    const next = actions.map(a => a.id === id ? { ...a, status } : a);
    setActions(next); saveActions(next);
  };

  return (
    <>
      <PageHeader
        title="DRL / IRL Generator"
        description={piaId
          ? `Filtered to PIA ${piaId}. Items across Tech Security, PRADAR, Privacy Notice, PIA, and Action Items.`
          : "Technical Security assessment. Configure systems and applicability — guide questions, DRL, and IRL are auto-generated."}
        actions={
          <>
            <Button variant="outline"><Sparkles className="mr-2 h-4 w-4" />Re-generate</Button>
            <Button><Download className="mr-2 h-4 w-4" />Export</Button>
          </>
        }
      />

      <Card className="mb-6">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs min-w-[1000px]">
            <thead className="bg-muted/40 border-b text-muted-foreground">
              <tr>
                {["Domain","System","Requirement","Status","Tool","Version","Managed By","Direct Access","AD Integrated","Scope"].map(h =>
                  <th key={h} className="text-left font-medium px-3 py-2.5 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {drlSystems.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-3 py-2.5">{r.domain}</td>
                  <td className="px-3 py-2.5 font-medium">{r.system}</td>
                  <td className="px-3 py-2.5">{r.requirement}</td>
                  <td className="px-3 py-2.5"><StatusChip status={r.status} /></td>
                  <td className="px-3 py-2.5">{r.tool}</td>
                  <td className="px-3 py-2.5">{r.version}</td>
                  <td className="px-3 py-2.5">{r.managedBy}</td>
                  <td className="px-3 py-2.5">{r.direct}</td>
                  <td className="px-3 py-2.5">{r.ad}</td>
                  <td className="px-3 py-2.5">{r.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="guide">Guide Questions</TabsTrigger>
          <TabsTrigger value="drl">Document Request List</TabsTrigger>
          <TabsTrigger value="irl">Inquiry Request List</TabsTrigger>
          <TabsTrigger value="actions">Action Items {actions.length > 0 && <span className="ml-1 text-[10px] text-muted-foreground">({actions.length})</span>}</TabsTrigger>
        </TabsList>

        <TabsContent value="guide">
          <Card><CardContent className="p-6">
            <ol className="space-y-3 list-decimal list-inside text-sm">
              {guideQuestions.map((q, i) => <li key={i} className="leading-relaxed">{q}</li>)}
            </ol>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="drl">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b text-xs text-muted-foreground">
                <tr><th className="text-left font-medium px-4 py-2.5">Document</th><th className="text-left font-medium px-4 py-2.5">Owner</th><th className="text-left font-medium px-4 py-2.5">Status</th></tr>
              </thead>
              <tbody>
                {drl.map((d, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3">{d.item}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.owner}</td>
                    <td className="px-4 py-3"><StatusChip status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="irl">
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b text-xs text-muted-foreground">
                <tr><th className="text-left font-medium px-4 py-2.5">Question</th><th className="text-left font-medium px-4 py-2.5 w-48">Basis</th></tr>
              </thead>
              <tbody>
                {irl.map((d, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3">{d.q}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card><CardContent className="p-0">
            {actions.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground text-center">
                No action items yet. Upload a transcript to extract action items automatically.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Action</th>
                    <th className="text-left font-medium px-4 py-2.5 w-32">Owner</th>
                    <th className="text-left font-medium px-4 py-2.5 w-28">Source</th>
                    <th className="text-left font-medium px-4 py-2.5 w-40">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map(a => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="px-4 py-3">{a.text}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.owner || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {a.source}
                        {a.sourceRef && <span className="block text-[10px] font-mono">{a.sourceRef}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v as ActionItem["status"])}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <RelatedLinks
        title="Jump to"
        links={[
          ...(piaId ? [{ to: `/pia/${piaId}`, label: "Source PIA", icon: FileText }] : []),
          { to: "/library", label: "PIA Library", icon: FileText },
          { to: "/tsa", label: "Technical Security", icon: ShieldCheck },
          { to: "/pradar", label: "PRADAR", icon: ShieldCheck },
          { to: `/email?source=drl${piaId ? `&refId=${piaId}` : ""}`, label: "Send follow-up email", icon: Mail },
          { to: "/summary", label: "Executive Summary", icon: BookOpen },
        ]}
      />
    </>
  );
}

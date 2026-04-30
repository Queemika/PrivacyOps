import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusChip } from "@/components/StatusChip";
import { drlSystems } from "@/lib/mockData";
import { Sparkles, Download } from "lucide-react";

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
  return (
    <>
      <PageHeader
        title="DRL / IRL Generator"
        description="Technical Security assessment. Configure systems and applicability — guide questions, DRL, and IRL are auto-generated."
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

      <Tabs defaultValue="guide">
        <TabsList>
          <TabsTrigger value="guide">Guide Questions</TabsTrigger>
          <TabsTrigger value="drl">Document Request List</TabsTrigger>
          <TabsTrigger value="irl">Inquiry Request List</TabsTrigger>
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
      </Tabs>
    </>
  );
}

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ropaRows } from "@/lib/mockData";
import { Download, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";

export default function RopaPreview() {
  return (
    <>
      <PageHeader
        title="RoPA & NPC-RS Preview"
        description="Auto-generated Records of Processing Activities and NPC Registration System dataset from the compilation."
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export NPC-RS (.xlsx)</Button>
            <Button><FileSpreadsheet className="mr-2 h-4 w-4" />Export RoPA (.xlsx)</Button>
          </>
        }
      />

      <Tabs defaultValue="ropa">
        <TabsList>
          <TabsTrigger value="ropa">RoPA</TabsTrigger>
          <TabsTrigger value="npc">NPC-RS</TabsTrigger>
        </TabsList>

        <TabsContent value="ropa">
          <Card><CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  {["DPS Type","DPS Name","Purpose","Data Subjects","PI Categories","Lawful Basis","PIC / PIP","Sharing","Retention","Cross-Border"].map(h =>
                    <th key={h} className="text-left font-medium px-3 py-2.5 whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {ropaRows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 align-top">
                    <td className="px-3 py-2.5">{r.dpsType}</td>
                    <td className="px-3 py-2.5 font-medium">{r.dpsName}</td>
                    <td className="px-3 py-2.5">{r.purpose}</td>
                    <td className="px-3 py-2.5">{r.subjects}</td>
                    <td className="px-3 py-2.5">{r.categories}</td>
                    <td className="px-3 py-2.5">{r.basis}</td>
                    <td className="px-3 py-2.5">{r.picPip}</td>
                    <td className="px-3 py-2.5">{r.sharing}</td>
                    <td className="px-3 py-2.5">{r.retention}</td>
                    <td className="px-3 py-2.5">{r.crossBorder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="npc">
          <Card><CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  {["DPS Name","System Type","Purpose","Data Subjects","Lawful Basis","Retention","Disposal Method","NPC Status"].map(h =>
                    <th key={h} className="text-left font-medium px-3 py-2.5 whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {ropaRows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 align-top">
                    <td className="px-3 py-2.5 font-medium">{r.dpsName}</td>
                    <td className="px-3 py-2.5">{r.dpsType}</td>
                    <td className="px-3 py-2.5">{r.purpose}</td>
                    <td className="px-3 py-2.5">{r.subjects}</td>
                    <td className="px-3 py-2.5">{r.basis}</td>
                    <td className="px-3 py-2.5">{r.retention}</td>
                    <td className="px-3 py-2.5">Cryptographic erasure</td>
                    <td className="px-3 py-2.5"><span className="status-chip bg-success/10 text-success border-success/30">Ready</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button asChild variant="outline"><Link to="/summary">Continue to Executive Summary →</Link></Button>
      </div>
    </>
  );
}

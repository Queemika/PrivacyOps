import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { defaultCctvNotice, CctvNotice } from "@/lib/templates/cctvNotice";
import { Camera, ShieldCheck, MapPin } from "lucide-react";
import { toast } from "sonner";

const KEY = "pa_cctv_notice";
function load(): CctvNotice {
  try { return JSON.parse(localStorage.getItem(KEY) || "null") || defaultCctvNotice; } catch { return defaultCctvNotice; }
}

export default function PhysicalInspection() {
  const [n, setN] = useState<CctvNotice>(load());
  const save = () => { localStorage.setItem(KEY, JSON.stringify(n)); toast.success("CCTV notice saved"); };

  return (
    <PageShell title="Physical Inspection" subtitle="CCTV inventory and on-site walkthrough notice.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="CCTV locations" value={n.location.split(",").length} icon={Camera} accent="blue" />
        <StatTile label="Retention (days)" value={n.retentionDays} icon={ShieldCheck} accent="green" />
        <StatTile label="Signage" value={n.signageInstalled ? "Installed" : "Missing"} icon={MapPin} accent={n.signageInstalled ? "green" : "rose"} />
        <StatTile label="Notice version" value="v1.0" icon={ShieldCheck} accent="violet" />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">CCTV Notice (template)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Locations (comma-separated)</Label>
              <Textarea value={n.location} onChange={(e) => setN({ ...n, location: e.target.value })} />
            </div>
            <div>
              <Label>Purpose</Label>
              <Textarea value={n.purpose} onChange={(e) => setN({ ...n, purpose: e.target.value })} />
            </div>
            <div>
              <Label>Retention period (days)</Label>
              <Input type="number" value={n.retentionDays} onChange={(e) => setN({ ...n, retentionDays: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Personal Information Controller</Label>
              <Input value={n.pic} onChange={(e) => setN({ ...n, pic: e.target.value })} />
            </div>
            <div>
              <Label>DPO email</Label>
              <Input value={n.dpoEmail} onChange={(e) => setN({ ...n, dpoEmail: e.target.value })} />
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label>Signage installed</Label>
              <Switch checked={n.signageInstalled} onCheckedChange={(c) => setN({ ...n, signageInstalled: c })} />
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={save}>Save</Button></div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

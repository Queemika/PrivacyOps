import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const KEYS = {
  pia: ["pa_pias"],
  engagement: ["pa_engagements", "pa_active_engagement"],
  module: ["pa_uploads", "pa_action_items", "pa_tooltip_overrides"],
  all: ["pa_pias", "pa_engagements", "pa_active_engagement", "pa_uploads", "pa_action_items", "pa_tooltip_overrides", "pa_role"],
};

function clearKeys(keys: string[], label: string) {
  keys.forEach((k) => localStorage.removeItem(k));
  toast.success(`Cleared: ${label}`);
  setTimeout(() => window.location.reload(), 500);
}

export default function ResetData() {
  const isAdmin = (localStorage.getItem("pa_role") || "user") === "admin";
  if (!isAdmin) {
    return (
      <PageShell title="Reset Data">
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Admin role required. Update your role in Settings.</CardContent></Card>
      </PageShell>
    );
  }

  const scopes = [
    { id: "module", label: "Modules only", desc: "Uploads, action items, tooltip overrides", keys: KEYS.module },
    { id: "pia", label: "All PIAs", desc: "All saved PIA records", keys: KEYS.pia },
    { id: "engagement", label: "Engagement data", desc: "Engagements and active selection", keys: KEYS.engagement },
    { id: "all", label: "Entire system", desc: "Everything including your role", keys: KEYS.all },
  ];

  return (
    <PageShell title="Reset Data" subtitle="Wipe stored data at module, engagement, or system level.">
      <div className="grid md:grid-cols-2 gap-4">
        {scopes.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-6 space-y-3">
              <div>
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5 mr-1" />Clear</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear {s.label.toLowerCase()}?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently remove data from this device. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => clearKeys(s.keys, s.label)}>Clear</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

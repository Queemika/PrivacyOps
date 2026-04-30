import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  "For Finalization": "bg-warning/10 text-warning border-warning/30",
  Final: "bg-success/10 text-success border-success/30",
  Open: "bg-destructive/10 text-destructive border-destructive/30",
  Closed: "bg-success/10 text-success border-success/30",
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Medium: "bg-warning/10 text-warning border-warning/30",
  Low: "bg-success/10 text-success border-success/30",
  Validated: "bg-info/10 text-info border-info/30",
};

export function StatusChip({ status }: { status: string }) {
  return <span className={cn("status-chip", styles[status] ?? "bg-muted text-muted-foreground border-border")}>{status}</span>;
}

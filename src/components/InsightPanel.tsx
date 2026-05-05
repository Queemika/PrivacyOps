import { useCompliance, COMPLIANCE_TIPS } from "@/context/ComplianceContext";
import { Lightbulb, X, Globe, MapPin, Shield } from "lucide-react";

export default function InsightPanel() {
  const { mode, guidanceEnabled, insightOpen, setInsightOpen } = useCompliance();
  if (!guidanceEnabled || !insightOpen) return null;

  const data = COMPLIANCE_TIPS[mode];
  const Icon = mode === "gdpr" ? Globe : mode === "ph" ? MapPin : Shield;

  return (
    <aside className="hidden xl:flex w-72 shrink-0 border-l bg-card flex-col sticky top-14 self-start" style={{ height: "calc(100vh - 3.5rem)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" />
          <span className="text-sm font-semibold">Insight Panel</span>
        </div>
        <button onClick={() => setInsightOpen(false)} className="h-7 w-7 rounded hover:bg-muted flex items-center justify-center" aria-label="Close insight panel">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium">{data.title}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {data.tips.map((t, i) => (
          <div key={i} className="text-xs">
            <div className="font-semibold text-foreground mb-0.5">{t.label}</div>
            <p className="text-muted-foreground leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t text-[10px] text-muted-foreground">
        Compliance guidance is informational. Always confirm with your DPO.
      </div>
    </aside>
  );
}

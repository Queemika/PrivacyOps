import { useCompliance, ComplianceMode } from "@/context/ComplianceContext";
import { Globe, MapPin, Shield, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ComplianceModeSelect() {
  const { mode, setMode, guidanceEnabled, setGuidanceEnabled, insightOpen, setInsightOpen } = useCompliance();
  const Icon = mode === "gdpr" ? Globe : mode === "ph" ? MapPin : Shield;

  return (
    <div className="flex items-center gap-2">
      <Select value={mode} onValueChange={(v) => setMode(v as ComplianceMode)}>
        <SelectTrigger className="h-8 w-[170px] text-xs gap-2">
          <Icon className="h-3.5 w-3.5 text-accent" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default"><span className="text-xs">Default Mode</span></SelectItem>
          <SelectItem value="gdpr"><span className="text-xs">GDPR Mode (EU)</span></SelectItem>
          <SelectItem value="ph"><span className="text-xs">Philippines Mode (DPA)</span></SelectItem>
        </SelectContent>
      </Select>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => { if (!guidanceEnabled) setGuidanceEnabled(true); setInsightOpen(!insightOpen); }}
            className={`h-8 w-8 rounded-md flex items-center justify-center border ${insightOpen && guidanceEnabled ? "bg-warning/10 border-warning/40 text-warning" : "hover:bg-muted text-muted-foreground"}`}
            aria-label="Toggle insight panel"
          >
            <Lightbulb className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{guidanceEnabled ? (insightOpen ? "Hide" : "Show") + " Insight Panel" : "Enable Compliance Guidance"}</TooltipContent>
      </Tooltip>
    </div>
  );
}

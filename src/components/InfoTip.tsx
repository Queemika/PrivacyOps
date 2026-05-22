import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { getTooltip, globalEnabled } from "@/lib/admin/tooltipRegistry";

interface Props { tooltipKey: string; className?: string }

export function InfoTip({ tooltipKey, className }: Props) {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    window.addEventListener("pa:tooltips-change", fn);
    return () => window.removeEventListener("pa:tooltips-change", fn);
  }, []);
  if (!globalEnabled()) return null;
  const t = getTooltip(tooltipKey);
  if (!t.enabled || !t.text) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={`text-muted-foreground hover:text-foreground inline-flex ${className || ""}`} aria-label="More info">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{t.text}</TooltipContent>
    </Tooltip>
  );
}

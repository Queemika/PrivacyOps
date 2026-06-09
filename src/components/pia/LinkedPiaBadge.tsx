import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export function LinkedPiaBadge() {
  const [params] = useSearchParams();
  const piaId = params.get("piaId");
  if (!piaId) return null;
  return (
    <div className="mb-3 rounded-md border border-info/30 bg-info/5 px-3 py-2 text-xs flex items-center justify-between">
      <span className="flex items-center gap-2 text-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-info" />
        Linked to PIA <span className="font-mono">{piaId}</span>
      </span>
      <Link
        to={`/pia/${piaId}`}
        className="inline-flex items-center gap-1 text-info hover:underline"
      >
        <ArrowLeft className="h-3 w-3" /> Back to PIA
      </Link>
    </div>
  );
}

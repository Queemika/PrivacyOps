import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { ModuleProgress } from "@/lib/progress/calc";

export function ModuleProgressCard({ m }: { m: ModuleProgress }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</div>
            <div className="mt-1 text-3xl font-semibold">{m.percent}%</div>
          </div>
          <Link to={m.href} className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
            Open <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Progress value={m.percent} />
        <div className="text-xs text-muted-foreground">{m.detail}</div>
      </CardContent>
    </Card>
  );
}

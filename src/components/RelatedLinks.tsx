import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RelatedLink {
  to: string;
  label: string;
  icon?: LucideIcon;
  hint?: string;
  external?: boolean;
}

export function RelatedLinks({
  title = "Related",
  links,
  className,
}: {
  title?: string;
  links: RelatedLink[];
  className?: string;
}) {
  if (!links.length) return null;
  return (
    <Card className={cn("mt-6 border-accent/20 bg-accent/5", className)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Link2 className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => {
            const Icon = l.icon;
            const inner = (
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors text-xs font-medium">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {l.label}
                {l.hint && <span className="text-[10px] text-muted-foreground ml-1">{l.hint}</span>}
              </span>
            );
            return l.external ? (
              <a key={l.to} href={l.to} target="_blank" rel="noreferrer">{inner}</a>
            ) : (
              <Link key={l.to + l.label} to={l.to}>{inner}</Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

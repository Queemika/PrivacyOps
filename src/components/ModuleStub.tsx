import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function ModuleStub({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Badge variant="outline" className="text-[10px]">
            <Sparkles className="mr-1 h-3 w-3" /> MVP scaffolding
          </Badge>
        }
      />
      <Card>
        <CardContent className="p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
            Core features (MVP)
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 rounded-md border p-3 text-sm"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            This module is scaffolded. Functionality will be wired up next — the
            screen, sidebar slot, and routing are already in place so we can
            iterate without churn.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

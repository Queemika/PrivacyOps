import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageShell({ title, subtitle, actions, children, className }: Props) {
  const showHeader = title || subtitle || actions;
  return (
    <div className={cn("space-y-6", className)}>
      {showHeader && (
        <header className="flex items-end justify-between gap-4 flex-wrap pt-2">
          <div>
            {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
}

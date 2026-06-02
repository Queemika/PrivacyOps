import { cn } from "@/lib/utils";

/**
 * PrivacyOps brand mark — shield with lock keyhole + circuit nodes,
 * suggesting privacy (shield) + operations (network).
 */
export function PrivacyOpsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-8 w-8", className)} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="poGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path
        d="M24 3.5 7 9v13.2c0 9.6 6.8 18.4 17 22.3 10.2-3.9 17-12.7 17-22.3V9L24 3.5Z"
        fill="url(#poGrad)"
      />
      {/* Inner ring */}
      <circle cx="24" cy="22" r="7.5" stroke="hsl(var(--accent-foreground))" strokeWidth="1.6" opacity="0.95" />
      {/* Keyhole */}
      <circle cx="24" cy="20" r="2.2" fill="hsl(var(--accent-foreground))" />
      <rect x="22.9" y="21.4" width="2.2" height="4.4" rx="0.6" fill="hsl(var(--accent-foreground))" />
      {/* Circuit nodes */}
      <circle cx="13.5" cy="22" r="1.6" fill="hsl(var(--accent-foreground))" opacity="0.9" />
      <circle cx="34.5" cy="22" r="1.6" fill="hsl(var(--accent-foreground))" opacity="0.9" />
      <circle cx="24" cy="36" r="1.6" fill="hsl(var(--accent-foreground))" opacity="0.9" />
      <path d="M15 22h2M31 22h2M24 31.5v2" stroke="hsl(var(--accent-foreground))" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function PrivacyOpsLogo({
  className,
  variant = "full",
  size = "md",
}: {
  className?: string;
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const markSize = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12", xl: "h-14 w-14" }[size];
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl", xl: "text-3xl" }[size];
  const subSize = { sm: "text-[9px]", md: "text-[10px]", lg: "text-[11px]", xl: "text-xs" }[size];
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <PrivacyOpsMark className={markSize} />
      {variant === "full" && (
        <div className="leading-tight">
          <div className={cn("font-semibold tracking-tight", textSize)}>
            Privacy<span className="text-accent">Ops</span>
          </div>
          <div className={cn("uppercase tracking-[0.18em] opacity-60", subSize)}>Compliance Suite</div>
        </div>
      )}
    </div>
  );
}

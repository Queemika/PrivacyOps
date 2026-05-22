import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackButton({ className }: { className?: string }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(-1)}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors",
        className,
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </button>
  );
}

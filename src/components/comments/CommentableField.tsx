import { ReactNode, useState } from "react";
import { useComments } from "@/lib/comments/store";
import { CommentsPanel } from "./CommentsPanel";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  module: string;
  field: string;
  record_id?: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a field with a comment indicator. Click to open the comments panel scoped to this field.
 */
export function CommentableField({ module, field, record_id, children, className }: Props) {
  const { items } = useComments(module, record_id);
  const fieldComments = items.filter(c => c.anchor?.field === field && c.status === "open");
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`group relative ${className ?? ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      {(fieldComments.length > 0 || hover) && (
        <div className="absolute -right-7 top-0">
          <CommentsPanel
            module={module}
            record_id={record_id}
            trigger={
              <Button size="icon" variant="ghost" className="h-6 w-6 relative">
                <MessageSquare className={`h-3.5 w-3.5 ${fieldComments.length > 0 ? "text-accent fill-accent/20" : "text-muted-foreground"}`} />
                {fieldComments.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center">
                    {fieldComments.length}
                  </span>
                )}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

import { ReactNode } from "react";
import { PresenceUser } from "@/lib/realtime/usePresence";

export function FieldFocusRing({
  field, others, onFocus, onBlur, children,
}: {
  field: string;
  others: PresenceUser[];
  onFocus?: () => void;
  onBlur?: () => void;
  children: ReactNode;
}) {
  const focusedBy = others.find((u) => u.focusedField === field);
  return (
    <div
      className="relative"
      onFocus={onFocus}
      onBlur={onBlur}
      style={focusedBy ? { boxShadow: `0 0 0 2px ${focusedBy.color}`, borderRadius: 6 } : undefined}
    >
      {children}
      {focusedBy && (
        <span
          className="absolute -top-2 -right-2 h-4 px-1.5 rounded-full text-[9px] font-semibold text-white flex items-center"
          style={{ background: focusedBy.color }}
          title={focusedBy.name}
        >
          {focusedBy.name.split(" ")[0]}
        </span>
      )}
    </div>
  );
}

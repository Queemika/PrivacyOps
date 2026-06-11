import { PresenceUser } from "@/lib/realtime/usePresence";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function PresenceAvatars({ users }: { users: PresenceUser[] }) {
  if (!users.length) return null;
  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {users.slice(0, 5).map((u) => (
          <Tooltip key={u.user_id}>
            <TooltipTrigger asChild>
              <div
                className="h-7 w-7 rounded-full ring-2 ring-background flex items-center justify-center text-[10px] font-semibold text-white"
                style={{ background: u.color }}
              >
                {initials(u.name)}
              </div>
            </TooltipTrigger>
            <TooltipContent>{u.name}{u.focusedField ? ` · editing ${u.focusedField}` : " · viewing"}</TooltipContent>
          </Tooltip>
        ))}
        {users.length > 5 && (
          <div className="h-7 w-7 rounded-full ring-2 ring-background bg-muted text-[10px] flex items-center justify-center">
            +{users.length - 5}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

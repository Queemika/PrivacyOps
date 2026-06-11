import { usePresence } from "@/lib/realtime/usePresence";
import { PresenceAvatars } from "@/components/cowork/PresenceAvatars";

export function PresenceStrip({ channelKey }: { channelKey: string }) {
  const { others } = usePresence(channelKey);
  if (!others.length) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground">Co-editing:</span>
      <PresenceAvatars users={others} />
    </div>
  );
}

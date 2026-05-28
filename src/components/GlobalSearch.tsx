import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic, MicOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Minimal Web Speech API typing
interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  readonly results: { length: number; [index: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: Event) => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export default function GlobalSearch({ className }: { className?: string }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);

  const w = typeof window !== "undefined" ? (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }) : undefined;
  const SR = w?.SpeechRecognition || w?.webkitSpeechRecognition;
  const supported = !!SR;

  useEffect(() => () => { try { recogRef.current?.stop(); } catch { /* noop */ } }, []);

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    nav(`/search?q=${encodeURIComponent(t)}`);
  };

  const toggleMic = () => {
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }
    if (listening) { try { recogRef.current?.stop(); } catch { /* noop */ } return; }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (ev: SpeechRecognitionEvent) => {
      let text = "";
      for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript;
      setQ(text);
      if (ev.results[ev.results.length - 1].isFinal) submit(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); toast.error("Voice input error"); };
    recogRef.current = r;
    setListening(true);
    try { r.start(); } catch { setListening(false); }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(q); }}
      className={cn("relative flex items-center w-[280px] lg:w-[360px]", className)}
    >
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={listening ? "Listening…" : "Search PIAs, engagements, DRL, tasks…"}
        className="h-9 pl-8 pr-9 text-sm bg-background/80"
        aria-label="Global search"
      />
      <button
        type="button"
        onClick={toggleMic}
        title={supported ? (listening ? "Stop voice input" : "Voice search") : "Voice not supported"}
        className={cn(
          "absolute right-1.5 h-7 w-7 rounded-md flex items-center justify-center transition-colors",
          listening ? "bg-destructive/15 text-destructive animate-pulse" : "text-muted-foreground hover:bg-muted",
          !supported && "opacity-40 cursor-not-allowed"
        )}
      >
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>
    </form>
  );
}

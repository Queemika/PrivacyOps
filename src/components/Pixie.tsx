import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pixie() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    {
      role: "bot",
      text: "Hi! I'm Pixie, your data privacy guide. I can help with PIAs, RoPA, NPC-RS and Philippine DPA / GDPR questions. What would you like to know?",
    },
  ]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: q },
      { role: "bot", text: "(Prototype) I'll look that up for you. Try uploading a transcript to see auto-extraction in action." },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all",
          "bg-gradient-to-br from-accent to-accent/80 hover:scale-105",
        )}
        aria-label="Open Pixie assistant"
        title="Pixie · Data Privacy Guide"
      >
        <Sparkles className="h-5 w-5 text-accent-foreground" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-xl border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(0_0%_10%)] text-white">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-accent/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Pixie</div>
                <div className="text-[10px] text-white/60">Data Privacy Guide</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="h-7 w-7 rounded hover:bg-white/10 flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 max-h-[380px] overflow-y-auto p-3 space-y-2 bg-muted/20">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "text-[13px] leading-relaxed rounded-lg px-3 py-2 max-w-[85%]",
                  m.role === "bot" ? "bg-card border" : "bg-accent text-accent-foreground ml-auto",
                )}
              >
                {m.role === "bot" && <span className="mr-1">👋</span>}
                {m.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t bg-card">
            <div className="flex items-center gap-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Pixie anything…"
                className="flex-1 h-9 px-3 rounded-md border bg-background text-[13px] outline-none focus:border-accent"
              />
              <button onClick={send} className="h-9 w-9 rounded-md bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5 px-1">PH Philippines DPA 2012 · NPC Issuances</div>
          </div>
        </div>
      )}
    </>
  );
}

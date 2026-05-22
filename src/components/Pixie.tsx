import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, X, Send, Globe, BookMarked, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hintForPath } from "@/lib/pixieHints";

type Lang = "EN" | "FIL" | "Taglish";
type Source = "PH" | "GDPR" | "CCPA";
type Msg = { role: "bot" | "user"; text: string };

export default function Pixie() {
  const [open, setOpen] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Lang>("EN");
  const [source, setSource] = useState<Source>("PH");
  const [loading, setLoading] = useState(false);
  const { pathname } = useLocation();
  const hint = hintForPath(pathname);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm Pixie. Ask me about PIAs, Compilation, NPC-RS, or how to navigate the app." },
  ]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", text: q }];
    setMessages([...next, { role: "bot", text: "" }]);
    setLoading(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pixie-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
          language: lang,
          source,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Pixie is offline." }));
        setMessages([...next, { role: "bot", text: err.error || "Pixie is offline." }]);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "bot", text: acc };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      setMessages([...next, { role: "bot", text: "Connection issue. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && !hintDismissed && (
        <div className="fixed bottom-20 right-6 z-50 max-w-[280px] bg-[hsl(var(--sidebar-background))] text-white rounded-2xl rounded-br-sm px-4 py-3 text-[13px] leading-relaxed shadow-xl">
          <button
            onClick={() => setHintDismissed(true)}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white text-foreground border shadow flex items-center justify-center hover:scale-110 transition"
            aria-label="Dismiss hint"
          >
            <X className="h-3 w-3" />
          </button>
          {hint}
        </div>
      )}
      <button
        onClick={() => { setOpen((o) => !o); setHintDismissed(true); }}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-accent to-accent/80 hover:scale-105 transition-transform"
        aria-label="Open Pixie assistant"
        title="Pixie · Data Privacy Guide"
      >
        <Sparkles className="h-5 w-5 text-accent-foreground" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] rounded-xl border bg-card shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--sidebar-background))] text-white">
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

          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 text-[11px]">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="bg-transparent outline-none">
              <option value="EN">English</option>
              <option value="FIL">Filipino</option>
              <option value="Taglish">Taglish</option>
            </select>
            <span className="text-muted-foreground">·</span>
            <BookMarked className="h-3.5 w-3.5 text-muted-foreground" />
            <select value={source} onChange={(e) => setSource(e.target.value as Source)} className="bg-transparent outline-none">
              <option value="PH">PH DPA</option>
              <option value="GDPR">GDPR</option>
              <option value="CCPA">CCPA</option>
            </select>
          </div>

          <div className="flex-1 max-h-[400px] overflow-y-auto p-3 space-y-2 bg-muted/10">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "text-[13px] leading-relaxed rounded-lg px-3 py-2 max-w-[88%] whitespace-pre-wrap",
                  m.role === "bot" ? "bg-card border" : "bg-accent text-accent-foreground ml-auto",
                )}
              >
                {m.text || (loading && i === messages.length - 1 && <Loader2 className="h-3.5 w-3.5 animate-spin inline" />)}
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
                disabled={loading}
                className="flex-1 h-9 px-3 rounded-md border bg-background text-[13px] outline-none focus:border-accent disabled:opacity-50"
              />
              <button onClick={send} disabled={loading} className="h-9 w-9 rounded-md bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5 px-1">Powered by Lovable AI · {source === "PH" ? "PH DPA 2012 · NPC Issuances" : source === "GDPR" ? "EU GDPR" : "CCPA"}</div>
          </div>
        </div>
      )}
    </>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Download, Minus, Maximize2, PanelRight, X, FileText, Image as ImageIcon, File as FileIcon, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AttachmentItem {
  name: string;
  mime: string;
  dataUrl: string;
}

type Mode = "modal" | "side" | "minimized";

interface PreviewState {
  item: AttachmentItem;
  mode: Mode;
}

interface Ctx {
  open: (item: AttachmentItem) => void;
}

const AttachmentPreviewContext = createContext<Ctx | null>(null);

export function useAttachmentPreview() {
  const ctx = useContext(AttachmentPreviewContext);
  if (!ctx) throw new Error("useAttachmentPreview must be used inside <AttachmentPreviewProvider>");
  return ctx;
}

export function AttachmentPreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState | null>(null);

  const open = useCallback((item: AttachmentItem) => {
    setState({ item, mode: "modal" });
  }, []);

  const close = () => setState(null);
  const setMode = (mode: Mode) => setState((s) => (s ? { ...s, mode } : s));

  // ESC to close in modal mode
  useEffect(() => {
    if (!state || state.mode !== "modal") return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  const value = useMemo<Ctx>(() => ({ open }), [open]);

  return (
    <AttachmentPreviewContext.Provider value={value}>
      {children}
      {state && (
        <PreviewSurface
          state={state}
          onClose={close}
          onMode={setMode}
        />
      )}
    </AttachmentPreviewContext.Provider>
  );
}

function PreviewSurface({ state, onClose, onMode }: { state: PreviewState; onClose: () => void; onMode: (m: Mode) => void }) {
  const { item, mode } = state;

  const header = (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
      <KindIcon mime={item.mime} />
      <div className="flex-1 min-w-0 text-xs font-medium truncate" title={item.name}>{item.name}</div>
      <a href={item.dataUrl} download={item.name} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Download">
        <Download className="h-3.5 w-3.5" />
      </a>
      {mode !== "minimized" && (
        <button onClick={() => onMode("minimized")} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Minimize">
          <Minus className="h-3.5 w-3.5" />
        </button>
      )}
      {mode !== "side" && (
        <button onClick={() => onMode("side")} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Dock as side panel">
          <PanelRight className="h-3.5 w-3.5" />
        </button>
      )}
      {mode !== "modal" && (
        <button onClick={() => onMode("modal")} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Expand">
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}
      <button onClick={onClose} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Close">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const body = <PreviewBody item={item} />;

  if (mode === "minimized") {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-72 bg-background border rounded-lg shadow-lg overflow-hidden">
        {header}
      </div>
    );
  }

  if (mode === "side") {
    return (
      <div className="fixed top-0 right-0 z-40 h-screen w-[420px] bg-background border-l shadow-xl flex flex-col">
        {header}
        <div className="flex-1 overflow-auto">{body}</div>
      </div>
    );
  }

  // modal
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-background border rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {header}
        <div className="flex-1 overflow-auto">{body}</div>
      </div>
    </div>
  );
}

function KindIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
  if (mime === "application/pdf") return <FileText className="h-4 w-4 text-muted-foreground" />;
  if (mime.startsWith("text/")) return <FileText className="h-4 w-4 text-muted-foreground" />;
  return <FileIcon className="h-4 w-4 text-muted-foreground" />;
}

function PreviewBody({ item }: { item: AttachmentItem }) {
  if (item.mime.startsWith("image/")) {
    return (
      <div className="flex items-center justify-center bg-muted/20 h-full p-4">
        <img src={item.dataUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
      </div>
    );
  }
  if (item.mime === "application/pdf") {
    return <iframe src={item.dataUrl} title={item.name} className="w-full h-full border-0" />;
  }
  if (item.mime.startsWith("text/") || item.mime === "application/json") {
    return <TextPreview dataUrl={item.dataUrl} />;
  }
  return (
    <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground gap-3 p-8 text-center">
      <Paperclip className="h-10 w-10 opacity-50" />
      <div>Preview not available for this file type.</div>
      <Button asChild size="sm" variant="outline">
        <a href={item.dataUrl} download={item.name}><Download className="h-3.5 w-3.5 mr-1" />Download {item.name}</a>
      </Button>
    </div>
  );
}

function TextPreview({ dataUrl }: { dataUrl: string }) {
  const [text, setText] = useState<string>("");
  useEffect(() => {
    fetch(dataUrl).then((r) => r.text()).then(setText).catch(() => setText("Could not load preview."));
  }, [dataUrl]);
  return <pre className="text-xs p-4 whitespace-pre-wrap break-words font-mono">{text}</pre>;
}

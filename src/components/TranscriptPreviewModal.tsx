import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, FileText, Eye, Save, X } from "lucide-react";
import { toast } from "sonner";

export interface PreviewTranscript {
  id: string;
  fileName: string;
  content?: string; // plain text content if available
  dataUrl?: string;  // base64 for binary (PDF) preview
  tags?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  transcript: PreviewTranscript | null;
  onSave?: (next: PreviewTranscript) => void;
  onDelete?: (id: string) => void;
}

export function TranscriptPreviewModal({ open, onClose, transcript, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const [fullView, setFullView] = useState(false);

  useEffect(() => {
    if (transcript) {
      setFileName(transcript.fileName);
      setContent(transcript.content || "");
      setEditing(false);
      setFullView(false);
    }
  }, [transcript]);

  if (!transcript) return null;

  const isPdf = /\.pdf$/i.test(transcript.fileName);

  const download = () => {
    const blob = transcript.dataUrl
      ? null
      : new Blob([content || ""], { type: "text/plain" });
    const url = transcript.dataUrl || URL.createObjectURL(blob!);
    const a = document.createElement("a");
    a.href = url; a.download = transcript.fileName; a.click();
  };

  const save = () => {
    if (!onSave) return;
    onSave({ ...transcript, fileName, content });
    toast.success("Transcript updated");
    setEditing(false);
  };

  const del = () => {
    if (!onDelete) return;
    if (confirm(`Delete ${transcript.fileName}?`)) {
      onDelete(transcript.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={fullView ? "max-w-[95vw] h-[90vh]" : "max-w-3xl"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {editing ? (
              <Input value={fileName} onChange={(e) => setFileName(e.target.value)} className="h-7 text-sm" />
            ) : (
              <span className="truncate">{transcript.fileName}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className={`overflow-auto border rounded-md bg-muted/20 ${fullView ? "flex-1" : "max-h-[60vh]"}`}>
          {isPdf && transcript.dataUrl ? (
            <iframe title="Transcript PDF" src={transcript.dataUrl} className="w-full h-[60vh]" />
          ) : editing ? (
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-xs min-h-[50vh] border-0 bg-transparent" />
          ) : (
            <pre className="text-xs leading-relaxed p-4 whitespace-pre-wrap font-mono">{content || "(no preview content)"}</pre>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex gap-1">
            {transcript.tags?.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{t}</span>)}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setFullView(v => !v)}><Eye className="h-3.5 w-3.5 mr-1" />{fullView ? "Compact" : "Full"}</Button>
            {!editing ? (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
                <Button size="sm" onClick={save}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={download}><Download className="h-3.5 w-3.5 mr-1" />Download</Button>
            {onDelete && <Button size="sm" variant="ghost" onClick={del}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

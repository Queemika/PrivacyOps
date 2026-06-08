import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { loadTeamUploads } from "@/lib/teamUploadsStore";
import { generateMomFromTranscript } from "@/lib/mom/generate";
import { newMom, upsertMom, loadMoms, deleteMom, MomRecord } from "@/lib/mom/store";
import { toast } from "sonner";
import { Trash2, Sparkles, Plus, Save, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Textarea bound to a string[] that keeps its own raw text state so users can
 * freely type newlines/blank lines without the parent stripping them on every
 * keystroke. Splits to an array only on blur.
 */
function ListTextarea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [text, setText] = useState(value.join("\n"));
  // Re-sync when the parent record changes (e.g. after Generate or selecting a saved MOM).
  useEffect(() => {
    setText(value.join("\n"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join("\u0001")]);

  return (
    <Textarea
      placeholder={placeholder}
      value={text}
      rows={rows}
      onChange={e => setText(e.target.value)}
      onBlur={() =>
        onChange(text.split("\n").map(s => s.trimEnd()).filter(s => s.length > 0))
      }
    />
  );
}

export function MomEditor() {
  const [moms, setMoms] = useState<MomRecord[]>(loadMoms());
  const [current, setCurrent] = useState<MomRecord>(newMom());
  const [transcriptText, setTranscriptText] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const uploads = loadTeamUploads();
  const editRef = useRef<HTMLDivElement>(null);

  const refresh = () => setMoms(loadMoms());

  const selectedUpload = uploads.find(u => u.id === current.transcriptId);

  const handleGenerate = () => {
    if (!transcriptText.trim()) {
      toast.error(
        selectedUpload
          ? `Paste the transcript text for "${selectedUpload.fileName}" below, then click Generate.`
          : "Paste transcript text first.",
      );
      return;
    }
    const m = generateMomFromTranscript(transcriptText, {
      title:
        current.title && current.title !== "Untitled meeting"
          ? current.title
          : selectedUpload?.fileName?.replace(/\.[^.]+$/, "") || undefined,
      transcriptId: current.transcriptId,
    });
    setCurrent(m);
    setDraftReady(true);
    setHighlight(true);
    toast.success("Draft MOM generated — review & edit below");
    // Scroll the edit card into view and pulse the highlight ring.
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    setTimeout(() => setHighlight(false), 2200);
  };

  const handleSave = () => {
    upsertMom(current);
    refresh();
    toast.success("MOM saved");
  };

  const handleTranscriptPick = (id: string) => {
    const upload = uploads.find(u => u.id === id);
    setCurrent({
      ...current,
      transcriptId: id || undefined,
      title:
        upload && (!current.title || current.title === "Untitled meeting")
          ? upload.fileName.replace(/\.[^.]+$/, "")
          : current.title,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Auto-generate from transcript</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrent(newMom());
                  setTranscriptText("");
                  setDraftReady(false);
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={!transcriptText.trim()}>
                <Sparkles className="h-3 w-3 mr-1" />
                Generate
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Source transcript (optional reference)</label>
              <select
                className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={current.transcriptId || ""}
                onChange={e => handleTranscriptPick(e.target.value)}
              >
                <option value="">— None —</option>
                {uploads.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fileName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Meeting date</label>
              <Input
                type="date"
                value={current.date}
                onChange={e => setCurrent({ ...current, date: e.target.value })}
              />
            </div>
          </div>
          <Textarea
            placeholder="Paste raw transcript text here…"
            value={transcriptText}
            onChange={e => setTranscriptText(e.target.value)}
            rows={5}
          />
        </CardContent>
      </Card>

      {draftReady && (
        <div className="rounded-md border border-primary/40 bg-primary/5 px-4 py-3 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <div className="font-medium">Draft ready — review & edit below</div>
            <div className="text-muted-foreground mt-0.5">
              Extracted {current.attendees.length} attendees · {current.agenda.length} agenda items ·{" "}
              {current.decisions.length} decisions · {current.actionItems.length} action items.
            </div>
          </div>
        </div>
      )}

      <div ref={editRef}>
        <Card
          className={cn(
            "transition-shadow",
            highlight && "ring-2 ring-primary shadow-lg",
          )}
        >
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit minutes</h3>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={current.title} onChange={e => setCurrent({ ...current, title: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Attendees (one per line)</label>
                <ListTextarea
                  value={current.attendees}
                  onChange={v => setCurrent({ ...current, attendees: v })}
                  placeholder="Speaker 1&#10;Speaker 2"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Agenda</label>
                <ListTextarea
                  value={current.agenda}
                  onChange={v => setCurrent({ ...current, agenda: v })}
                  placeholder="Agenda item"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Decisions</label>
                <ListTextarea
                  value={current.decisions}
                  onChange={v => setCurrent({ ...current, decisions: v })}
                  placeholder="Decision"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Action items</label>
                <ListTextarea
                  value={current.actionItems}
                  onChange={v => setCurrent({ ...current, actionItems: v })}
                  placeholder="Action item"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <Textarea
                value={current.notes}
                onChange={e => setCurrent({ ...current, notes: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold">Saved minutes</h3>
          {moms.length === 0 && <p className="text-sm text-muted-foreground">No minutes saved yet.</p>}
          <div className="space-y-2">
            {moms.map(m => (
              <div key={m.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                <button
                  className="text-left flex-1"
                  onClick={() => {
                    setCurrent(m);
                    setDraftReady(false);
                  }}
                >
                  <div className="text-sm font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.date} · {m.attendees.length} attendees · {m.actionItems.length} actions
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteMom(m.id);
                    refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

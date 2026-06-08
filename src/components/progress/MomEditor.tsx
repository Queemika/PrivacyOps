import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { loadTeamUploads } from "@/lib/teamUploadsStore";
import { generateMomFromTranscript } from "@/lib/mom/generate";
import { newMom, upsertMom, loadMoms, deleteMom, MomRecord } from "@/lib/mom/store";
import { toast } from "sonner";
import { Trash2, Sparkles, Plus, Save } from "lucide-react";

function listField(value: string[], onChange: (v: string[]) => void, placeholder: string) {
  return (
    <Textarea
      placeholder={placeholder}
      value={value.join("\n")}
      onChange={e => onChange(e.target.value.split("\n").map(s => s.trimEnd()).filter(s => s.length > 0))}
      rows={5}
    />
  );
}

export function MomEditor() {
  const [moms, setMoms] = useState<MomRecord[]>(loadMoms());
  const [current, setCurrent] = useState<MomRecord>(newMom());
  const [transcriptText, setTranscriptText] = useState("");
  const uploads = loadTeamUploads();

  const refresh = () => setMoms(loadMoms());

  const handleGenerate = () => {
    if (!transcriptText.trim()) { toast.error("Paste transcript text first"); return; }
    const m = generateMomFromTranscript(transcriptText, { title: current.title });
    setCurrent(m);
    toast.success("Draft MOM generated");
  };

  const handleSave = () => {
    upsertMom(current);
    refresh();
    toast.success("MOM saved");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Auto-generate from transcript</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrent(newMom())}><Plus className="h-3 w-3 mr-1" />New</Button>
              <Button size="sm" onClick={handleGenerate}><Sparkles className="h-3 w-3 mr-1" />Generate</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Source transcript (optional reference)</label>
              <select
                className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={current.transcriptId || ""}
                onChange={e => setCurrent({ ...current, transcriptId: e.target.value || undefined })}
              >
                <option value="">— None —</option>
                {uploads.map(u => <option key={u.id} value={u.id}>{u.fileName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Meeting date</label>
              <Input type="date" value={current.date} onChange={e => setCurrent({ ...current, date: e.target.value })} />
            </div>
          </div>
          <Textarea
            placeholder="Paste raw transcript text here…"
            value={transcriptText}
            onChange={e => setTranscriptText(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Edit minutes</h3>
            <Button size="sm" onClick={handleSave}><Save className="h-3 w-3 mr-1" />Save</Button>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={current.title} onChange={e => setCurrent({ ...current, title: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Attendees (one per line)</label>
              {listField(current.attendees, v => setCurrent({ ...current, attendees: v }), "Speaker 1\nSpeaker 2")}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Agenda</label>
              {listField(current.agenda, v => setCurrent({ ...current, agenda: v }), "Agenda item")}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Decisions</label>
              {listField(current.decisions, v => setCurrent({ ...current, decisions: v }), "Decision")}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Action items</label>
              {listField(current.actionItems, v => setCurrent({ ...current, actionItems: v }), "Action item")}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <Textarea value={current.notes} onChange={e => setCurrent({ ...current, notes: e.target.value })} rows={4} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold">Saved minutes</h3>
          {moms.length === 0 && <p className="text-sm text-muted-foreground">No minutes saved yet.</p>}
          <div className="space-y-2">
            {moms.map(m => (
              <div key={m.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                <button className="text-left flex-1" onClick={() => setCurrent(m)}>
                  <div className="text-sm font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.date} · {m.attendees.length} attendees · {m.actionItems.length} actions</div>
                </button>
                <Button variant="ghost" size="icon" onClick={() => { deleteMom(m.id); refresh(); }}>
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

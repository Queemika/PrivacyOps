import { newMom, MomRecord } from "./store";

export function generateMomFromTranscript(text: string, opts: { title?: string; transcriptId?: string } = {}): MomRecord {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const title = opts.title || lines[0]?.slice(0, 80) || "Meeting Minutes";

  const speakerSet = new Set<string>();
  const speakerRe = /^(Speaker\s+\d+|[A-Z][a-zA-Z.\-]+(?:\s+[A-Z][a-zA-Z.\-]+)?)\s*[:\-–]/;
  for (const l of lines) {
    const m = l.match(speakerRe);
    if (m) speakerSet.add(m[1]);
  }

  const decisions: string[] = [];
  const actions: string[] = [];
  const agenda: string[] = [];

  const decisionRe = /\b(agreed|decided|approved|resolved|concluded)\b/i;
  const actionRe   = /\b(action|todo|to-do|will|shall|assign|owner|by\s+\w+day|deadline|due)\b/i;
  const agendaRe   = /\b(agenda|topic|next item|moving on)\b/i;

  for (const l of lines) {
    const clean = l.replace(speakerRe, "").trim();
    if (!clean || clean.length < 8) continue;
    if (decisionRe.test(clean)) decisions.push(clean.slice(0, 220));
    else if (actionRe.test(clean)) actions.push(clean.slice(0, 220));
    else if (agendaRe.test(clean)) agenda.push(clean.slice(0, 160));
  }

  return newMom({
    title,
    transcriptId: opts.transcriptId,
    attendees: Array.from(speakerSet).slice(0, 20),
    agenda: agenda.slice(0, 8),
    decisions: decisions.slice(0, 12),
    actionItems: actions.slice(0, 15),
    notes: "",
  });
}

// Route-aware Pixie hints (mirrors prototype DPBOT_HINTS).
export const PIXIE_HINTS: Record<string, string> = {
  "/": "👋 Hi! I'm Pixie, your data privacy guide. Pick an engagement to begin — under PH DPA, a PIA is required before any new DPS goes live.",
  "/engagements": "👋 Pick an engagement to open its dashboard. Each engagement keeps its own PIAs, DRL, PRADAR, and outputs.",
  "/dashboard": "📊 This dashboard summarizes your engagement. Watch the open DRL items and PRADAR score for early warning signs.",
  "/upload": "🎙️ Upload a meeting transcript — I'll preview it before processing, anonymize PII (stored locally as `pa_uploads`), label speakers, and extract PIA / TSA / DRL / Email outputs. Transcripts must be reviewed and validated by a supervisor before they're used downstream.",
  "/library": "📋 NPC Circular 2022-01 requires a PIA for any new or significantly changed DPS. Use Threshold Analysis in Phase 1 to decide if a full PIA is needed.",
  "/drl": "📂 DRL items open > 7 days deserve a follow-up. Use the Email Generator to send a polite nudge in one click.",
  "/pradar": "📊 PRADAR rates maturity across 10 domains. Scores below 2.5 are gaps that need immediate attention.",
  "/tsa": "🔐 A SIEM / Enterprise Log Repository is a key DPA requirement for audit logging. Flag missing controls as OFI.",
  "/inspection": "🏢 Photo evidence in the Album tab forms part of the audit trail — tag each photo to the related checklist row.",
  "/notice": "📄 A layered notice on the website plus a full notice in T&Cs is the NPC's recommended pattern.",
  "/manuals": "📚 Manuals & Outputs aggregates every signed deliverable. Use version numbers (v1.0, v1.1) to track revisions.",
  "/summary": "📈 The Executive Summary follows the NPC's recommended PIA report structure — sections 01–09.",
  "/ropa": "📄 Under DPA IRR §52, PICs must maintain a Compilation. This module compiles Phase 2 fields from every PIA you've selected.",
  "/email": "✉️ Generated emails pre-fill assigned action items per recipient. Review before sending — Pixie drafts, you sign off.",
  "/audit-log": "🗂️ Audit log is admin-only. Use it to verify who changed what when an approver questions a deliverable.",
  "/settings": "⚙️ Configure tooltip visibility, role views, and table locks here. Locked tables prevent edits below the Lead role.",
};

export function hintForPath(pathname: string): string {
  // exact match, then prefix match
  if (PIXIE_HINTS[pathname]) return PIXIE_HINTS[pathname];
  const key = Object.keys(PIXIE_HINTS)
    .filter(k => k !== "/" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return key ? PIXIE_HINTS[key] : "✨ Ask me anything about PH DPA, NPC issuances, or how to use this screen.";
}

// Mock team-wide transcripts uploaded across the organization.
// In a real backend this would query a shared table. Tags track which
// downstream processes were run from the transcript.

export interface TeamUpload {
  id: string;
  fileName: string;
  uploader: string;
  uploadedAt: string;
  tags: string[]; // e.g. "PIA", "TSA", "DRL", "Email"
}

const KEY = "pa_team_uploads";

const seed: TeamUpload[] = [
  { id: "UPL-1009", fileName: "vendor_onboarding_kickoff.txt", uploader: "M. Cruz",   uploadedAt: "2026-05-21", tags: ["PIA", "DRL"] },
  { id: "UPL-1008", fileName: "hr_payroll_review.docx",        uploader: "J. Reyes",  uploadedAt: "2026-05-20", tags: ["PIA", "TSA", "Email"] },
  { id: "UPL-1007", fileName: "cctv_assessment_meeting.txt",   uploader: "A. Santos", uploadedAt: "2026-05-18", tags: ["TSA"] },
  { id: "UPL-1006", fileName: "marketing_consent_workshop.pdf",uploader: "L. Tan",    uploadedAt: "2026-05-16", tags: ["PIA"] },
  { id: "UPL-1005", fileName: "drl_followups_legal.txt",       uploader: "M. Cruz",   uploadedAt: "2026-05-15", tags: ["DRL", "Email"] },
];

export function loadTeamUploads(): TeamUpload[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

export function addTeamUpload(rec: Omit<TeamUpload, "uploadedAt"> & { uploadedAt?: string }) {
  const all = loadTeamUploads();
  const item: TeamUpload = { uploadedAt: new Date().toISOString().slice(0,10), ...rec };
  const next = [item, ...all].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(next));
  return item;
}

export function tagTeamUpload(id: string, tag: string) {
  const all = loadTeamUploads();
  const i = all.findIndex(u => u.id === id);
  if (i < 0) return;
  if (!all[i].tags.includes(tag)) all[i].tags.push(tag);
  localStorage.setItem(KEY, JSON.stringify(all));
}

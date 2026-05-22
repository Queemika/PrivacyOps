// Admin-editable references store. Per-module blocks of varying kinds.
export type RefBlockType = "link" | "paragraph" | "table" | "blog";

export interface RefBlock {
  id: string;
  type: RefBlockType;
  title?: string;
  body?: string;          // paragraph / blog
  url?: string;           // link
  headers?: string[];     // table
  rows?: string[][];      // table
  updatedAt: string;
}

export type ModuleId =
  | "pia" | "pradar" | "tsa" | "physical" | "privacyNotice" | "manuals";

const KEY = "pa_references_v1";

type Store = Record<ModuleId, RefBlock[]>;

function seedDefaults(): Store {
  const now = new Date().toISOString();
  const mk = (type: RefBlockType, partial: Partial<RefBlock>): RefBlock =>
    ({ id: `R-${Math.random().toString(36).slice(2, 9)}`, type, updatedAt: now, ...partial });
  return {
    pia: [
      mk("link", { title: "NPC Circular 2022-01 — Privacy Impact Assessment", url: "https://privacy.gov.ph/circulars/" }),
      mk("link", { title: "Data Privacy Act of 2012 (RA 10173)", url: "https://privacy.gov.ph/data-privacy-act/" }),
      mk("link", { title: "NPC Advisory 2017-01 — Designation of DPO", url: "https://privacy.gov.ph/advisories/" }),
      mk("link", { title: "ISO/IEC 29134:2017 — PIA Guidelines", url: "https://www.iso.org/standard/62289.html" }),
    ],
    pradar: [
      mk("link", { title: "NPC Circular 2022-01 — PIA", url: "https://privacy.gov.ph/circulars/" }),
      mk("link", { title: "ISO/IEC 27701 — Privacy Information Management", url: "https://www.iso.org/standard/71670.html" }),
      mk("link", { title: "ISO/IEC 29100 — Privacy framework", url: "https://www.iso.org/standard/45123.html" }),
      mk("link", { title: "NIST Privacy Framework v1.0", url: "https://www.nist.gov/privacy-framework" }),
    ],
    tsa: [
      mk("link", { title: "ISO/IEC 27001:2022 — Information Security Controls", url: "https://www.iso.org/standard/27001" }),
      mk("link", { title: "NPC Circular 16-01 — Security of Personal Data", url: "https://privacy.gov.ph/circulars/" }),
      mk("link", { title: "NIST SP 800-53 — Security and Privacy Controls", url: "https://csrc.nist.gov/publications/sp800" }),
    ],
    physical: [
      mk("link", { title: "NPC Circular 16-01 — Security of Personal Data (Physical Safeguards)", url: "https://privacy.gov.ph/circulars/" }),
      mk("paragraph", { title: "Inspection methodology", body: "Walk through each department/area with the local representative. Photograph evidence where possible. Mark Compliance Status as Yes / No / N-A and record remarks, actual observation, and recommendations." }),
    ],
    privacyNotice: [
      mk("link", { title: "RA 10173 § 16 — Rights of the Data Subject", url: "https://privacy.gov.ph/data-privacy-act/" }),
      mk("link", { title: "NPC Privacy Notice Toolkit", url: "https://privacy.gov.ph/" }),
      mk("link", { title: "NPC Advisory 2017-01 — DPO designation", url: "https://privacy.gov.ph/advisories/" }),
    ],
    manuals: [
      mk("link", { title: "NPC Circular 16-01 — Required Privacy Manual contents", url: "https://privacy.gov.ph/circulars/" }),
      mk("paragraph", { title: "Manual cadence", body: "Privacy Manuals should be reviewed annually and after any material change to processing activities, the regulatory landscape, or organizational structure." }),
    ],
  };
}

export function loadReferences(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw) { const d = seedDefaults(); localStorage.setItem(KEY, JSON.stringify(d)); return d; }
    // Backfill missing modules
    const d = seedDefaults();
    const merged = { ...d, ...raw } as Store;
    return merged;
  } catch { return seedDefaults(); }
}

export function saveReferences(s: Store) { localStorage.setItem(KEY, JSON.stringify(s)); }

export function getModuleRefs(m: ModuleId): RefBlock[] { return loadReferences()[m] || []; }

export function setModuleRefs(m: ModuleId, blocks: RefBlock[]) {
  const all = loadReferences();
  all[m] = blocks;
  saveReferences(all);
}

export function isAdmin(): boolean {
  return (localStorage.getItem("pa_role") || "user") === "admin";
}

// Light "format & clean" helper — no AI, just whitespace normalization.
export function tidyText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .split("\n").map(l => l.replace(/[ \t]+$/g, "")).join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

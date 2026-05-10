import {
  Engagement, Pia, Phase1, Phase2, Phase3, ChecklistAnswer, PiaType, DpsStatus, PiaScope,
} from "./schema";
import {
  THRESHOLD_QUESTIONS, PRINCIPLES_SEED, RIGHTS_SEED, ORG_SECURITY_SEED, PHY_SECURITY_SEED,
  TECH_SECURITY_SEED, CROSS_BORDER_SEED, ChecklistSeed,
} from "./templates";
import { computeRating } from "./risk";

const ENGAGEMENTS_KEY = "pa_engagements";
const PIAS_KEY = "pa_pias";
const ACTIVE_KEY = "pa_active_engagement";

// ---------- Engagements ----------

export function loadEngagements(): Engagement[] {
  try { return JSON.parse(localStorage.getItem(ENGAGEMENTS_KEY) || "[]"); } catch { return []; }
}

export function saveEngagements(list: Engagement[]) {
  localStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(list));
}

export function getActiveEngagementId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}
export function setActiveEngagementId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function ensureSeedEngagement(): Engagement {
  const all = loadEngagements();
  if (all.length) {
    const active = getActiveEngagementId();
    return all.find(e => e.id === active) || all[0];
  }
  const seed: Engagement = {
    id: `ENG-${Date.now()}`,
    clientName: "Acme Corp",
    status: "Active",
    createdAt: new Date().toISOString(),
    transcripts: [],
    drlItems: [],
    piaIds: [],
  };
  saveEngagements([seed]);
  setActiveEngagementId(seed.id);
  return seed;
}

export function createEngagement(clientName: string): Engagement {
  const all = loadEngagements();
  const e: Engagement = {
    id: `ENG-${Date.now()}`,
    clientName,
    status: "Active",
    createdAt: new Date().toISOString(),
    transcripts: [],
    drlItems: [],
    piaIds: [],
  };
  all.unshift(e);
  saveEngagements(all);
  setActiveEngagementId(e.id);
  return e;
}

export function updateEngagement(id: string, patch: Partial<Engagement>) {
  const all = loadEngagements();
  const i = all.findIndex(e => e.id === id);
  if (i < 0) return;
  all[i] = { ...all[i], ...patch };
  saveEngagements(all);
}

// ---------- PIAs ----------

export function loadPias(): Pia[] {
  try { return JSON.parse(localStorage.getItem(PIAS_KEY) || "[]"); } catch { return []; }
}
export function savePias(list: Pia[]) {
  localStorage.setItem(PIAS_KEY, JSON.stringify(list));
}
export function getPia(id: string): Pia | undefined {
  return loadPias().find(p => p.id === id);
}
export function upsertPia(pia: Pia) {
  const all = loadPias();
  const i = all.findIndex(p => p.id === pia.id);
  pia.updatedAt = new Date().toISOString();
  if (i >= 0) all[i] = pia; else all.unshift(pia);
  savePias(all);
}

function blankAnswerFromSeed(s: ChecklistSeed): ChecklistAnswer {
  const checks: Record<string, boolean> = {};
  s.subItems?.forEach(si => (checks[si.key] = false));
  const impact = s.defaultImpact ?? null;
  const probability = s.defaultProbability ?? null;
  return {
    yn: "",
    response: "",
    threats: s.threats || "",
    risk: s.risk || "",
    legalBasis: s.legalBasis || "",
    impact,
    probability,
    rating: computeRating(impact, probability),
    checks,
  };
}

function seedAnswers(seeds: ChecklistSeed[]): Record<string, ChecklistAnswer> {
  const out: Record<string, ChecklistAnswer> = {};
  for (const s of seeds) out[s.id] = blankAnswerFromSeed(s);
  return out;
}

export function blankPia(engagementId: string, opts: { title: string; type: PiaType; dpsStatus: DpsStatus; scope: PiaScope; }): Pia {
  const phase1: Phase1 = {
    desc: {
      systemIs: "", designedToManage: "", ofPersonalDataWithin: "",
      dataCollection: "", dataUsage: "", dataStorage: "", dataDisposal: "",
      integratesWith: "", supportingDocs: "",
      purpose: "", scopeArea: "", relatedTo: "", estimatedRecords: 0, examines: "",
    },
    threshold: Object.fromEntries(THRESHOLD_QUESTIONS.map(q => [q.id, { yn: "", response: "" }])),
    stakeholders: [],
  };
  const phase2: Phase2 = {
    dpsType: "", dpsName: opts.title, basisPI: "", basisSPI: "",
    purposeProcessing: "", futurePurpose: "", dataSubjectsDesc: "",
    categories: [],
    picOrPip: "", outsourced: "",
    pipName: "", pipEmail: "", pipContact: "",
    picName: "", dpoName: "", dpoEmail: "", dpoContact: "",
    publicFacing: "", externalInternal: "",
    automatedDecisionNotice: "No",
    lawfulBasis: "", otherBasisInfo: "",
    consentUsed: "", consentProof: "",
    retention: "", automatedMethods: "N/A", automatedDecisions: "N/A",
    securityOrg: "", securityPhysical: "", securityTechnical: "",
    collection: [], use: [], disclosure: [], repositories: [],
  };
  const phase3: Phase3 = {
    principles: seedAnswers(PRINCIPLES_SEED),
    rights: seedAnswers(RIGHTS_SEED),
    organizational: seedAnswers(ORG_SECURITY_SEED),
    physical: seedAnswers(PHY_SECURITY_SEED),
    technical: seedAnswers(TECH_SECURITY_SEED),
    crossBorderEnabled: false,
    crossBorder: seedAnswers(CROSS_BORDER_SEED),
    mitigation: [],
  };
  const now = new Date().toISOString();
  return {
    id: `PIA-${Date.now()}`, engagementId, title: opts.title,
    type: opts.type, dpsStatus: opts.dpsStatus, scope: opts.scope,
    createdAt: now, updatedAt: now, phase1, phase2, phase3, drlLinks: [],
  };
}

export function createPia(engagementId: string, opts: { title: string; type: PiaType; dpsStatus: DpsStatus; scope: PiaScope; }): Pia {
  const pia = blankPia(engagementId, opts);
  upsertPia(pia);
  // attach to engagement
  const engs = loadEngagements();
  const e = engs.find(x => x.id === engagementId);
  if (e) {
    e.piaIds = [pia.id, ...e.piaIds];
    saveEngagements(engs);
  }
  return pia;
}

// Threshold logic: if any Yes -> PIA required.
export function isPiaRequired(p: Phase1): "Yes" | "No" | "Pending" {
  const vals = Object.values(p.threshold);
  if (vals.some(v => v.yn === "Yes")) return "Yes";
  if (vals.every(v => v.yn === "No" || v.yn === "N/A")) return "No";
  return "Pending";
}

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

export const DEFAULT_STAKEHOLDERS = (): import("./schema").Stakeholder[] => ([
  { id: "S-DPO", name: "DPO", role: "Data Protection Officer", involvement: "Oversight & sign-off", inputs: "", locked: true },
  { id: "S-MIS", name: "MIS", role: "Management Information Systems", involvement: "System owner (if hybrid/system-based)", inputs: "", locked: true },
  { id: "S-CLI", name: "Client / Customer", role: "Data Subject", involvement: "Provides personal data", inputs: "", locked: true },
]);

export function blankPia(engagementId: string, opts: { title: string; type: PiaType; dpsStatus: DpsStatus; scope: PiaScope; }): Pia {
  const phase1: Phase1 = {
    desc: {
      systemType: "", systemFunction: "", organizationScope: "",
      keyProcesses: "",
      dataCollection: [], dataCollectionNote: "",
      dataUsage: "",
      dataStorage: [], dataStorageNote: "",
      dataDisposal: "", dataDisposalNote: "",
      integration: [], integrationNote: "",
      supportingDocs: "",
      purpose: "", piaScope: "", outOfScope: "",
    },
    threshold: Object.fromEntries(THRESHOLD_QUESTIONS.map(q => [q.id, { yn: "", response: "" }])),
    stakeholders: DEFAULT_STAKEHOLDERS(),
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
  const phase4 = {
    prepared: { name: "", designation: "System / Process Owner", date: "", signature: "" },
    reviewed: { name: "", designation: "Data Protection Officer / Compliance Officer for Privacy", date: "", signature: "" },
    approved: { name: "", designation: "Group Head", date: "", signature: "" },
  };
  const now = new Date().toISOString();
  return {
    id: `PIA-${Date.now()}`, engagementId, title: opts.title,
    type: opts.type, dpsStatus: opts.dpsStatus, scope: opts.scope,
    consolidatedComponents: [],
    createdAt: now, updatedAt: now, phase1, phase2, phase3, phase4,
    ropaOverrides: {}, npcOverrides: {}, drlLinks: [],
  };
}

export function createPia(engagementId: string, opts: { title: string; type: PiaType; dpsStatus: DpsStatus; scope: PiaScope; }): Pia {
  const pia = blankPia(engagementId, opts);
  upsertPia(pia);
  const engs = loadEngagements();
  const e = engs.find(x => x.id === engagementId);
  if (e) {
    e.piaIds = [pia.id, ...e.piaIds];
    saveEngagements(engs);
  }
  return pia;
}

// Migrate older PIAs to the current schema. Idempotent.
export function migratePia(p: any): Pia {
  if (!p) return p;
  // Phase 1 desc shape
  const d = p.phase1?.desc || {};
  const newDesc = {
    systemType: d.systemType ?? d.systemIs ?? "",
    systemFunction: d.systemFunction ?? d.designedToManage ?? "",
    organizationScope: d.organizationScope ?? d.ofPersonalDataWithin ?? "",
    keyProcesses: d.keyProcesses ?? "",
    dataCollection: Array.isArray(d.dataCollection) ? d.dataCollection : (d.dataCollection ? [String(d.dataCollection)] : []),
    dataCollectionNote: d.dataCollectionNote ?? "",
    dataUsage: d.dataUsage ?? "",
    dataStorage: Array.isArray(d.dataStorage) ? d.dataStorage : (d.dataStorage ? [String(d.dataStorage)] : []),
    dataStorageNote: d.dataStorageNote ?? "",
    dataDisposal: d.dataDisposal ?? "",
    dataDisposalNote: d.dataDisposalNote ?? "",
    integration: Array.isArray(d.integration) ? d.integration : (d.integratesWith ? [String(d.integratesWith)] : []),
    integrationNote: d.integrationNote ?? "",
    supportingDocs: d.supportingDocs ?? "",
    purpose: d.purpose ?? "",
    piaScope: d.piaScope ?? d.scopeArea ?? "",
    outOfScope: d.outOfScope ?? "",
  };
  p.phase1 = p.phase1 || { threshold: {}, stakeholders: [] };
  p.phase1.desc = newDesc;
  // Threshold: drop N/A
  const thr = p.phase1.threshold || {};
  for (const k of Object.keys(thr)) {
    if (thr[k]?.yn === "N/A") thr[k] = { ...thr[k], yn: "" };
  }
  // Ensure all questions exist
  for (const q of THRESHOLD_QUESTIONS) {
    if (!thr[q.id]) thr[q.id] = { yn: "", response: "" };
  }
  p.phase1.threshold = thr;
  // Stakeholders defaults
  const sh = p.phase1.stakeholders || [];
  const defaults = DEFAULT_STAKEHOLDERS();
  for (const d2 of defaults) {
    if (!sh.find((s: any) => s.id === d2.id)) sh.unshift(d2);
  }
  p.phase1.stakeholders = sh;
  // Phase 4
  if (!p.phase4) {
    p.phase4 = {
      prepared: { name: "", designation: "System / Process Owner", date: "", signature: "" },
      reviewed: { name: "", designation: "Data Protection Officer / Compliance Officer for Privacy", date: "", signature: "" },
      approved: { name: "", designation: "Group Head", date: "", signature: "" },
    };
  }
  if (!p.consolidatedComponents) p.consolidatedComponents = [];
  if (!p.ropaOverrides) p.ropaOverrides = {};
  if (!p.npcOverrides) p.npcOverrides = {};
  return p as Pia;
}

// Threshold logic: if any Yes -> PIA required.
export function isPiaRequired(p: Phase1): "Yes" | "No" | "Pending" {
  const vals = Object.values(p.threshold);
  if (vals.some(v => v.yn === "Yes")) return "Yes";
  if (vals.every(v => v.yn === "No")) return "No";
  return "Pending";
}


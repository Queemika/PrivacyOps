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
  try {
    const raw = JSON.parse(localStorage.getItem(PIAS_KEY) || "[]");
    return raw.map((p: any) => migratePia(p));
  } catch { return []; }
}
export function savePias(list: Pia[]) {
  localStorage.setItem(PIAS_KEY, JSON.stringify(list));
}
export function getPia(id: string): Pia | undefined {
  const p = loadPias().find(p => p.id === id);
  return p ? migratePia(p) : undefined;
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

// Migrate older PIAs to the current schema. Idempotent. Also seeds any
// missing Phase 2 / Phase 3 structures so legacy/linked PIAs reflect the
// latest template (Phase 1 project context, threshold, stakeholders;
// Phase 2 data mapping; Phase 3 principles, rights, security, cross-border).
export function migratePia(p: any): Pia {
  if (!p) return p;
  // ---------- Phase 1 ----------
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
  const thr = p.phase1.threshold || {};
  for (const k of Object.keys(thr)) if (thr[k]?.yn === "N/A") thr[k] = { ...thr[k], yn: "" };
  for (const q of THRESHOLD_QUESTIONS) if (!thr[q.id]) thr[q.id] = { yn: "", response: "" };
  p.phase1.threshold = thr;
  const sh = p.phase1.stakeholders || [];
  const defaults = DEFAULT_STAKEHOLDERS();
  for (const d2 of defaults) if (!sh.find((s: any) => s.id === d2.id)) sh.unshift(d2);
  p.phase1.stakeholders = sh;

  // ---------- Phase 2 ----------
  const p2: any = p.phase2 || {};
  p.phase2 = {
    dpsType: p2.dpsType ?? "",
    dpsName: p2.dpsName ?? p.title ?? "",
    basisPI: p2.basisPI ?? "",
    basisSPI: p2.basisSPI ?? "",
    purposeProcessing: p2.purposeProcessing ?? "",
    futurePurpose: p2.futurePurpose ?? "",
    dataSubjectsDesc: p2.dataSubjectsDesc ?? "",
    categories: Array.isArray(p2.categories) ? p2.categories : [],
    picOrPip: p2.picOrPip ?? "",
    outsourced: p2.outsourced ?? "",
    pipName: p2.pipName ?? "", pipEmail: p2.pipEmail ?? "", pipContact: p2.pipContact ?? "",
    picName: p2.picName ?? "",
    dpoName: p2.dpoName ?? "", dpoEmail: p2.dpoEmail ?? "", dpoContact: p2.dpoContact ?? "",
    publicFacing: p2.publicFacing ?? "",
    externalInternal: p2.externalInternal ?? "",
    automatedDecisionNotice: p2.automatedDecisionNotice ?? "No",
    lawfulBasis: p2.lawfulBasis ?? "",
    otherBasisInfo: p2.otherBasisInfo ?? "",
    consentUsed: p2.consentUsed ?? "",
    consentProof: p2.consentProof ?? "",
    retention: p2.retention ?? "",
    automatedMethods: p2.automatedMethods ?? "N/A",
    automatedDecisions: p2.automatedDecisions ?? "N/A",
    securityOrg: p2.securityOrg ?? "",
    securityPhysical: p2.securityPhysical ?? "",
    securityTechnical: p2.securityTechnical ?? "",
    collection: Array.isArray(p2.collection) ? p2.collection : [],
    use: Array.isArray(p2.use) ? p2.use : [],
    disclosure: Array.isArray(p2.disclosure) ? p2.disclosure : [],
    repositories: Array.isArray(p2.repositories) ? p2.repositories : [],
  };

  // ---------- Phase 3 ----------
  const p3: any = p.phase3 || {};
  const ensureSection = (existing: any, seeds: ChecklistSeed[]) => {
    const out: Record<string, ChecklistAnswer> = { ...(existing || {}) };
    for (const s of seeds) if (!out[s.id]) out[s.id] = blankAnswerFromSeed(s);
    return out;
  };
  p.phase3 = {
    principles:     ensureSection(p3.principles,     PRINCIPLES_SEED),
    rights:         ensureSection(p3.rights,         RIGHTS_SEED),
    organizational: ensureSection(p3.organizational, ORG_SECURITY_SEED),
    physical:       ensureSection(p3.physical,       PHY_SECURITY_SEED),
    technical:      ensureSection(p3.technical,      TECH_SECURITY_SEED),
    crossBorderEnabled: p3.crossBorderEnabled ?? false,
    crossBorder:    ensureSection(p3.crossBorder,    CROSS_BORDER_SEED),
    mitigation: Array.isArray(p3.mitigation) ? p3.mitigation : [],
  };

  // ---------- Phase 4 ----------
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
  if (!Array.isArray(p.drlLinks)) p.drlLinks = [];
  return p as Pia;
}

// Explicit alias for callers that want intent-revealing naming
// (e.g. when linking a transcript to an existing PIA).
export function normalizePiaToLatestTemplate(p: Pia): Pia {
  const migrated = migratePia(p);
  upsertPia(migrated);
  return migrated;
}

// Threshold logic: if any Yes -> PIA required.
export function isPiaRequired(p: Phase1): "Yes" | "No" | "Pending" {
  const vals = Object.values(p.threshold);
  if (vals.some(v => v.yn === "Yes")) return "Yes";
  if (vals.every(v => v.yn === "No")) return "No";
  return "Pending";
}


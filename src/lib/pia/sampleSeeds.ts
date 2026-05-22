// Sample PIAs derived from the 5 uploaded .xlsx files.
// Used to populate the library so RoPA/NPC-RS/Executive Summary have real data.
import { blankPia, upsertPia, loadPias, ensureSeedEngagement } from "./store";
import { Pia, Phase2, RepositoryRow } from "./schema";
import raw from "./sampleSeeds.json";

const SEED_FLAG = "pa_pia_samples_v1";

type Parsed = Record<string, { p1: any; p2: any }>;
const data = raw as unknown as Parsed;

const TITLE: Record<string, string> = {
  pwd: "Dummy Corp PWD Database",
  uis: "University Information System",
  bmd: "Birth, Marriage, and Death Certificates Registration",
  foi: "Feedback, Complaints, and FOI Requests",
  chd: "CHD Electronic Health Records",
};

function mapMedia(m: string): RepositoryRow["mediaType"] {
  const x = (m || "").toLowerCase();
  if (x.includes("paper") || x.includes("physical")) return "Physical";
  if (x.includes("electronic") || x.includes("digital")) return "Electronic";
  return "Unspecified";
}
function mapHosting(h: string): RepositoryRow["hosting"] {
  const x = (h || "").toLowerCase();
  if (x.includes("outsourced")) return "Outsourced";
  if (x.includes("house")) return "In-house";
  return "";
}
function mapDps(t: string): Phase2["dpsType"] {
  const x = (t || "").toLowerCase();
  if (x === "both") return "Both";
  if (x === "manual") return "Manual";
  if (x === "electronic") return "Electronic";
  return "";
}
function yn(v: string): "Yes" | "No" | "" {
  const x = (v || "").trim().toLowerCase();
  if (x === "yes" || x === "y") return "Yes";
  if (x === "no" || x === "n") return "No";
  return "";
}

function buildPia(engagementId: string, key: string): Pia {
  const seed = data[key];
  const title = TITLE[key] || seed?.p2?.dpsName || key;
  const p = blankPia(engagementId, { title, type: "Full", dpsStatus: "Existing", scope: "Individual" });
  const p1s = seed?.p1 || {};
  const p2s = seed?.p2 || {};

  // Phase 1 desc
  p.phase1.desc = {
    ...p.phase1.desc,
    systemType: p1s.systemType || "",
    systemFunction: p1s.systemFunction || "",
    organizationScope: p1s.organizationScope || "",
    dataCollection: p1s.dataCollection ? [p1s.dataCollection] : [],
    dataUsage: p1s.dataUsage || "",
    dataStorage: p1s.dataStorage ? [p1s.dataStorage] : [],
    dataDisposal: p1s.dataDisposal || "",
    integration: p1s.integration && p1s.integration !== "N/A" ? [p1s.integration] : [],
    supportingDocs: p1s.supportingDocs || "",
    purpose: p1s.purpose || "",
    piaScope: p1s.piaScope || "",
  };

  // Phase 2
  p.phase2.dpsType = mapDps(p2s.dpsType);
  p.phase2.dpsName = p2s.dpsName || title;
  p.phase2.basisPI = p2s.basisPI || "";
  p.phase2.basisSPI = p2s.basisSPI || "";
  p.phase2.purposeProcessing = p2s.purposeProcessing || "";
  p.phase2.futurePurpose = p2s.futurePurpose || "";
  p.phase2.dataSubjectsDesc = p2s.dataSubjectsDesc || "";
  p.phase2.picOrPip = (p2s.picOrPip === "PIC" || p2s.picOrPip === "PIP") ? p2s.picOrPip : "";
  p.phase2.outsourced = yn(p2s.outsourced);
  p.phase2.picName = p2s.picName || "";
  p.phase2.dpoName = p2s.dpoName || "";
  p.phase2.dpoEmail = p2s.dpoEmail || "";
  p.phase2.dpoContact = p2s.dpoContact || "";
  p.phase2.publicFacing = yn(p2s.publicFacing);
  p.phase2.externalInternal =
    p2s.externalInternal === "Internal" || p2s.externalInternal === "External" || p2s.externalInternal === "Both"
      ? p2s.externalInternal : "";
  p.phase2.lawfulBasis = p2s.lawfulBasis || "";
  p.phase2.otherBasisInfo = p2s.otherBasisInfo || "";
  p.phase2.retention = p2s.retention || "";
  p.phase2.automatedMethods = p2s.automatedMethods || "N/A";
  p.phase2.automatedDecisions = p2s.automatedDecisions || "N/A";
  p.phase2.automatedDecisionNotice = p2s.automatedDecisionNotice || "No";
  p.phase2.securityOrg = p2s.securityOrg || "";
  p.phase2.securityPhysical = p2s.securityPhysical || "";
  p.phase2.securityTechnical = p2s.securityTechnical || "";

  p.phase2.categories = (p2s.categories || []).map((c: any, i: number) => ({
    id: `cat-${i}`,
    type: c.type?.includes("Sensitive") ? "SPI" : c.type?.includes("Privileged") ? "Privileged" : "PI",
    categories: c.categories || "",
    amount: c.amount || "",
    pipPic: c.pipPic || "PIC",
  }));
  p.phase2.collection = (p2s.collection || []).map((c: any, i: number) => ({
    id: `col-${i}`, when: c.when, who: c.who, from: c.from,
  }));
  p.phase2.use = (p2s.use || []).map((u: any, i: number) => ({
    id: `use-${i}`,
    positionDept: u.positionDept || "",
    scopeModule: u.scopeModule || "",
    fileName: u.fileName || "",
    purpose: u.purpose || "",
  }));
  p.phase2.disclosure = (p2s.disclosure || []).map((d: any, i: number) => ({
    id: `dis-${i}`,
    kind: d.kind === "Internal" ? "Internal" : "External",
    recipients: d.recipients || "",
    purpose: d.purpose || "",
    agreement: d.agreement || "",
    pic: d.pic || "",
    crossBorder: d.crossBorder || "",
  }));
  p.phase2.repositories = (p2s.repositories || []).map((r: any, i: number) => ({
    id: `rep-${i}`,
    name: r.name || "",
    mediaType: mapMedia(r.mediaType),
    location: r.location || "",
    hosting: mapHosting(r.hosting),
    cityCountry: r.cityCountry || "",
    retentionPeriod: r.retentionPeriod || "",
    basis: r.basis || "",
    disposal: r.disposal || "",
  }));

  // Mark as Final so it shows up nicely in stats
  p.phase4.prepared = { name: "Sample Preparer", designation: "Privacy Analyst", date: new Date().toISOString().slice(0,10), signature: "" };
  p.phase4.reviewed = { name: "Sample Reviewer", designation: "DPO", date: new Date().toISOString().slice(0,10), signature: "" };

  return p;
}

export function loadSamplePias(force = false): number {
  if (!force && localStorage.getItem(SEED_FLAG)) return 0;
  const eng = ensureSeedEngagement();
  const existing = loadPias();
  const existingTitles = new Set(existing.map(p => p.title));
  let count = 0;
  for (const key of Object.keys(data)) {
    const title = TITLE[key];
    if (existingTitles.has(title)) continue;
    const pia = buildPia(eng.id, key);
    upsertPia(pia);
    count++;
  }
  localStorage.setItem(SEED_FLAG, "1");
  return count;
}

export function autoSeedSamplesOnce() {
  // Only seed if library is empty
  if (localStorage.getItem(SEED_FLAG)) return;
  const existing = loadPias();
  if (existing.length === 0) loadSamplePias(true);
}

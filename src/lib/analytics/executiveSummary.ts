import { Pia, ChecklistAnswer } from "@/lib/pia/schema";

export interface ExecAggregate {
  totalDps: number;
  fullPia: number;
  phase1Only: number;
  existing: number;
  newDps: number;
  consolidated: number;
  individual: number;
  consolidatedGroups: { groupId: string; components: string[]; count: number }[];

  // Records
  piRecords: number;
  spiRecords: number;
  privRecords: number;

  // Sources
  externalCount: number;
  internalCount: number;
  bothCount: number;

  // Legal basis counts
  basisPI: Record<string, number>;
  basisSPI: Record<string, number>;

  // Repositories / retention
  totalInfo: number;
  withRepository: number;
  withoutRepository: number;
  withRetention: number;
  withoutRetention: number;
  retentionNA: number;
  electronicCount: number;
  physicalCount: number;
  unspecifiedCount: number;

  // Sharing
  withSharing: number;
  withoutSharing: number;
  withDSA: number;
  withoutDSA: number;
  withCrossBorder: number;
  withoutCrossBorder: number;

  // Disposal
  withDisposal: number;
  withoutDisposal: number;
  disposalNA: number;
  disposalTBD: number;

  // Retention days
  avgRetentionDays: number;
  avgRetentionYears: number;

  // Phase 3 risk matrix
  riskMatrix: {
    principles: RiskBuckets;
    rights: RiskBuckets;
    security: RiskBuckets;
    crossBorder: RiskBuckets;
  };
  topRisks: {
    principles: RiskItem[];
    rights: RiskItem[];
    security: RiskItem[];
    crossBorder: RiskItem[];
  };
  topMitigation: { measure: string; count: number }[];
  overallRiskBand: "Low" | "Medium" | "High" | "Critical";
}

export interface RiskBuckets { yes: number; no: number; na: number; blank: number; }
export interface RiskItem { id: string; piaId: string; piaTitle: string; risk: string; rating: string; }

const empty = (): RiskBuckets => ({ yes: 0, no: 0, na: 0, blank: 0 });

function bucket(b: RiskBuckets, yn: string) {
  if (yn === "Yes") b.yes++;
  else if (yn === "No") b.no++;
  else if (yn === "N/A") b.na++;
  else b.blank++;
}

function parseRetentionDays(s: string): number | null {
  if (!s) return null;
  const m = s.match(/(\d+(?:\.\d+)?)\s*(day|month|year|yr)/i);
  if (!m) {
    const n = parseFloat(s);
    return isFinite(n) ? n : null;
  }
  const n = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith("year") || unit === "yr") return n * 365;
  if (unit.startsWith("month")) return n * 30;
  return n;
}

export function aggregate(pias: Pia[]): ExecAggregate {
  const a: ExecAggregate = {
    totalDps: pias.length,
    fullPia: 0, phase1Only: 0,
    existing: 0, newDps: 0,
    consolidated: 0, individual: 0,
    consolidatedGroups: [],
    piRecords: 0, spiRecords: 0, privRecords: 0,
    externalCount: 0, internalCount: 0, bothCount: 0,
    basisPI: {}, basisSPI: {},
    totalInfo: 0, withRepository: 0, withoutRepository: 0,
    withRetention: 0, withoutRetention: 0, retentionNA: 0,
    electronicCount: 0, physicalCount: 0, unspecifiedCount: 0,
    withSharing: 0, withoutSharing: 0,
    withDSA: 0, withoutDSA: 0,
    withCrossBorder: 0, withoutCrossBorder: 0,
    withDisposal: 0, withoutDisposal: 0, disposalNA: 0, disposalTBD: 0,
    avgRetentionDays: 0, avgRetentionYears: 0,
    riskMatrix: { principles: empty(), rights: empty(), security: empty(), crossBorder: empty() },
    topRisks: { principles: [], rights: [], security: [], crossBorder: [] },
    topMitigation: [],
    overallRiskBand: "Low",
  };

  const groups = new Map<string, string[]>();
  const retentionDays: number[] = [];
  const allRisks = { principles: [] as RiskItem[], rights: [] as RiskItem[], security: [] as RiskItem[], crossBorder: [] as RiskItem[] };
  const mitigationMap = new Map<string, number>();

  for (const p of pias) {
    if (p.type === "Full") a.fullPia++; else a.phase1Only++;
    if (p.dpsStatus === "Existing") a.existing++; else a.newDps++;
    if (p.scope === "Consolidated") a.consolidated++; else a.individual++;
    if (p.scope === "Consolidated" && p.consolidatedGroupId) {
      groups.set(p.consolidatedGroupId, p.consolidatedComponents || []);
    }

    const p2 = p.phase2;
    // Records
    for (const c of p2.categories) {
      const n = parseInt(c.amount?.replace(/\D/g, "") || "0", 10) || 0;
      if (c.type === "PI") a.piRecords += n;
      else if (c.type === "SPI") a.spiRecords += n;
      else a.privRecords += n;
    }
    // Source
    if (p2.externalInternal === "External") a.externalCount++;
    else if (p2.externalInternal === "Internal") a.internalCount++;
    else if (p2.externalInternal === "Both") a.bothCount++;

    // Basis
    if (p2.basisPI) a.basisPI[p2.basisPI] = (a.basisPI[p2.basisPI] || 0) + 1;
    if (p2.basisSPI) a.basisSPI[p2.basisSPI] = (a.basisSPI[p2.basisSPI] || 0) + 1;

    // Repositories
    for (const r of p2.repositories) {
      a.totalInfo++;
      if (r.location || r.name) a.withRepository++; else a.withoutRepository++;
      if (r.retentionPeriod) {
        a.withRetention++;
        const d = parseRetentionDays(r.retentionPeriod);
        if (d != null) retentionDays.push(d);
      } else a.withoutRetention++;
      if (r.mediaType === "Electronic") a.electronicCount++;
      else if (r.mediaType === "Physical") a.physicalCount++;
      else a.unspecifiedCount++;
      if (r.disposal && r.disposal.toLowerCase().includes("n/a")) a.disposalNA++;
      else if (r.disposal && r.disposal.toLowerCase().includes("tbd")) a.disposalTBD++;
      else if (r.disposal) a.withDisposal++;
      else a.withoutDisposal++;
    }

    // Sharing
    if (p2.disclosure.length > 0) {
      a.withSharing++;
      if (p2.disclosure.some(d => d.agreement)) a.withDSA++; else a.withoutDSA++;
      if (p2.disclosure.some(d => d.crossBorder && !/^no/i.test(d.crossBorder))) a.withCrossBorder++; else a.withoutCrossBorder++;
    } else a.withoutSharing++;

    // Phase 3 risk matrix
    const sweep = (rec: Record<string, ChecklistAnswer>, bucketName: keyof typeof a.riskMatrix, listName: keyof typeof allRisks) => {
      for (const [k, v] of Object.entries(rec || {})) {
        bucket(a.riskMatrix[bucketName], v.yn);
        if (v.yn === "No" && (v.rating === "High" || v.rating === "Critical" || v.rating === "Medium")) {
          allRisks[listName].push({ id: k, piaId: p.id, piaTitle: p.title, risk: v.risk || v.threats || k, rating: v.rating });
        }
      }
    };
    sweep(p.phase3.principles, "principles", "principles");
    sweep(p.phase3.rights, "rights", "rights");
    sweep({ ...p.phase3.organizational, ...p.phase3.physical, ...p.phase3.technical }, "security", "security");
    if (p.phase3.crossBorderEnabled) sweep(p.phase3.crossBorder, "crossBorder", "crossBorder");

    for (const m of p.phase3.mitigation || []) {
      if (m.measure) mitigationMap.set(m.measure, (mitigationMap.get(m.measure) || 0) + 1);
    }
  }

  for (const [groupId, components] of groups) {
    a.consolidatedGroups.push({ groupId, components, count: components.length });
  }

  if (retentionDays.length) {
    a.avgRetentionDays = Math.round(retentionDays.reduce((s, n) => s + n, 0) / retentionDays.length);
    a.avgRetentionYears = +(a.avgRetentionDays / 365).toFixed(1);
  }

  const rank = (rs: RiskItem[]) => {
    const order = { Critical: 4, High: 3, Medium: 2, Low: 1, "": 0 } as Record<string, number>;
    return [...rs].sort((x, y) => (order[y.rating] || 0) - (order[x.rating] || 0)).slice(0, 5);
  };
  a.topRisks = {
    principles: rank(allRisks.principles),
    rights: rank(allRisks.rights),
    security: rank(allRisks.security),
    crossBorder: rank(allRisks.crossBorder),
  };
  a.topMitigation = [...mitigationMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([measure, count]) => ({ measure, count }));

  const totalCriticalHigh =
    allRisks.principles.filter(r => r.rating === "Critical" || r.rating === "High").length +
    allRisks.rights.filter(r => r.rating === "Critical" || r.rating === "High").length +
    allRisks.security.filter(r => r.rating === "Critical" || r.rating === "High").length +
    allRisks.crossBorder.filter(r => r.rating === "Critical" || r.rating === "High").length;
  a.overallRiskBand = totalCriticalHigh > 10 ? "Critical" : totalCriticalHigh > 5 ? "High" : totalCriticalHigh > 0 ? "Medium" : "Low";

  return a;
}

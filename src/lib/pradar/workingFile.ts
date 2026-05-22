// Helpers for the PRADAR Working File view: parse basis text into discrete
// checklist items, and auto-compute a 1–4 maturity rating from coverage.

export interface BasisItem {
  index: number;
  text: string;
}

const BULLET_RE = /^\s*(?:[-•*]|\d+[.)]|[A-Za-z][.)])\s+/;

/** Split a PRADAR `basis` blob into atomic checklist items. */
export function parseBasis(basis: string | null | undefined): BasisItem[] {
  if (!basis) return [];
  const lines = basis
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    // skip the "Basis: ..." header line(s)
    .filter(l => !/^basis\s*[:\-]/i.test(l));

  const items: string[] = [];
  for (const line of lines) {
    if (BULLET_RE.test(line)) {
      items.push(line.replace(BULLET_RE, "").trim());
    } else if (items.length && line.length < 80 && !/[.;]$/.test(items[items.length - 1])) {
      // continuation of previous bullet
      items[items.length - 1] += " " + line;
    } else if (line.length > 24) {
      items.push(line);
    }
  }
  return items.map((text, index) => ({ index, text }));
}

/** Map fraction of satisfied basis items to a 1–4 PRADAR rating. */
export function scoreFromChecks(checks: Record<number, boolean> | undefined, total: number): number | null {
  if (!total) return null;
  const satisfied = Object.values(checks || {}).filter(Boolean).length;
  const pct = satisfied / total;
  if (pct === 0) return 1;
  if (pct < 0.5) return 2;
  if (pct < 1) return 3;
  return 4;
}

export const SCORE_FORMULA_HELP =
  "Score is auto-computed from the basis checklist: 0% checked = 1 (Not Compliant), <50% = 2 (Partially), <100% = 3 (Substantially), 100% = 4 (Fully Compliant). Override manually if needed.";

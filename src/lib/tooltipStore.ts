// Admin-configurable tooltip overrides (Phase 1/2/3 PIA fields)

const KEY = "pa_tooltip_overrides";

export const defaultTooltips: Record<string, string> = {
  "p1.systemType": "High-level nature of the system (e.g. HRIS, CRM, CCTV).",
  "p1.systemFunction": "What the system does in business terms.",
  "p1.organization": "Department or business unit owning the system.",
  "p1.keyProcesses": "Lifecycle activities the system performs.",
  "p1.dataCollection": "Sources and methods used to collect personal data.",
  "p1.dataUsage": "Operational use of the data once collected.",
  "p1.dataStorage": "Where data is stored — cloud, on-prem, or physical.",
  "p1.dataDisposal": "How data is disposed of when no longer needed.",
  "p1.integration": "Other systems this one shares data with.",
  "p1.purpose": "Why the data is being processed.",
  "p1.scope": "What is in scope for this PIA.",
  "p1.outOfScope": "What is excluded from this PIA.",
  "p2.dpsName": "Official name of the Data Processing System.",
  "p2.purposeOfProcessing": "Auto-populated from Phase 1 Data Collection.",
  "p2.categories": "Personal data categories collected and processed.",
  "p3.impact": "Negligible / Limited / Significant / Maximum.",
  "p3.probability": "Unlikely / Possible / Likely / Almost Certain.",
};

export function loadTooltipOverrides(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function saveTooltipOverrides(map: Record<string, string>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}
export function getTooltip(key: string): string {
  const overrides = loadTooltipOverrides();
  return overrides[key] ?? defaultTooltips[key] ?? "";
}

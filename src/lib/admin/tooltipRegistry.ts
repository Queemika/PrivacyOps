// System-wide configurable tooltip registry.
// Admin can enable/disable an (i) icon on any registered field and set its short description.

export interface TooltipKey {
  key: string;
  module: string;
  screen: string;
  field: string;
  defaultText: string;
}

export const TOOLTIP_REGISTRY: TooltipKey[] = [
  // PIA Phase 1
  { key: "pia.p1.systemType",     module: "PIA",   screen: "Phase 1", field: "System Type",          defaultText: "High-level nature of the system (e.g. HRIS, CRM, CCTV)." },
  { key: "pia.p1.systemFunction", module: "PIA",   screen: "Phase 1", field: "System Function",      defaultText: "What the system does in business terms." },
  { key: "pia.p1.organization",   module: "PIA",   screen: "Phase 1", field: "Organization",         defaultText: "Department or business unit owning the system." },
  { key: "pia.p1.keyProcesses",   module: "PIA",   screen: "Phase 1", field: "Key Processes",        defaultText: "Lifecycle activities the system performs." },
  { key: "pia.p1.dataCollection", module: "PIA",   screen: "Phase 1", field: "Data Collection",      defaultText: "Sources and methods used to collect personal data." },
  { key: "pia.p1.dataUsage",      module: "PIA",   screen: "Phase 1", field: "Data Usage",           defaultText: "Operational use of the data once collected." },
  { key: "pia.p1.dataStorage",    module: "PIA",   screen: "Phase 1", field: "Data Storage",         defaultText: "Where data is stored — cloud, on-prem, or physical." },
  { key: "pia.p1.dataDisposal",   module: "PIA",   screen: "Phase 1", field: "Data Disposal",        defaultText: "How data is disposed of when no longer needed." },
  { key: "pia.p1.integration",    module: "PIA",   screen: "Phase 1", field: "Integration",          defaultText: "Other systems this one shares data with." },
  { key: "pia.p1.purpose",        module: "PIA",   screen: "Phase 1", field: "Purpose",              defaultText: "Why the data is being processed." },
  { key: "pia.p1.scope",          module: "PIA",   screen: "Phase 1", field: "Scope",                defaultText: "What is in scope for this PIA." },
  { key: "pia.p1.outOfScope",     module: "PIA",   screen: "Phase 1", field: "Out of Scope",         defaultText: "What is excluded from this PIA." },
  // PIA Phase 2
  { key: "pia.p2.dpsName",         module: "PIA", screen: "Phase 2", field: "DPS Name",                defaultText: "Official name of the Data Processing System." },
  { key: "pia.p2.purposeProc",     module: "PIA", screen: "Phase 2", field: "Purpose of Processing",   defaultText: "Auto-populated from Phase 1 Data Collection." },
  { key: "pia.p2.categories",      module: "PIA", screen: "Phase 2", field: "Categories",              defaultText: "Personal data categories collected and processed." },
  // PIA Phase 3
  { key: "pia.p3.impact",      module: "PIA", screen: "Phase 3", field: "Impact",      defaultText: "Negligible / Limited / Significant / Maximum." },
  { key: "pia.p3.probability", module: "PIA", screen: "Phase 3", field: "Probability", defaultText: "Unlikely / Possible / Likely / Almost Certain." },
  // PRADAR
  { key: "pradar.rating",      module: "PRADAR", screen: "Working File", field: "Rating",      defaultText: "1 (Non-Compliant) → 4 (Fully Compliant)" },
  { key: "pradar.basis",       module: "PRADAR", screen: "Working File", field: "Basis",       defaultText: "Minimum-requirements checklist drives auto-score." },
  { key: "pradar.gap",         module: "PRADAR", screen: "Working File", field: "Gap",         defaultText: "Concise (1–2 lines) description of the compliance gap." },
  { key: "pradar.actionPlan",  module: "PRADAR", screen: "Working File", field: "Action Plan", defaultText: "What needs to be done to close the gap." },
  // DRL
  { key: "drl.attachment",     module: "DRL", screen: "All", field: "Attachment", defaultText: "Files supporting this DRL item." },
  { key: "drl.status",         module: "DRL", screen: "All", field: "Status",     defaultText: "Open / Partially Received / Closed / Completed / N/A" },
  // TSA
  { key: "tsa.status",         module: "TSA", screen: "Working File", field: "Status",   defaultText: "Implemented / Partial / Not Implemented / N/A" },
  { key: "tsa.applicability",  module: "TSA", screen: "Working File", field: "Applicability", defaultText: "Per system, or enterprise-wide?" },
  // Privacy Notice
  { key: "notice.compliant",   module: "Privacy Notice", screen: "Assessment", field: "Compliant", defaultText: "Does the section meet the legal/internal standard?" },
];

const KEY = "pa_tooltips_v2";

export interface TooltipState { enabled: boolean; text: string }

export function loadAll(): Record<string, TooltipState> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function saveAll(map: Record<string, TooltipState>) {
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("pa:tooltips-change"));
}

export function getTooltip(key: string): TooltipState {
  const all = loadAll();
  const def = TOOLTIP_REGISTRY.find(t => t.key === key);
  return all[key] ?? { enabled: true, text: def?.defaultText ?? "" };
}

export function globalEnabled(): boolean {
  return localStorage.getItem("pa_tooltips_enabled") !== "false";
}

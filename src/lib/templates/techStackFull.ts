// Full DPA-aligned tech stack inventory (24 items).
export interface TechStackRow {
  id: string;
  domain: string;
  system: string;
  requirement: string;
  status: "Implemented" | "Partial" | "Not Implemented" | "N/A" | "";
  tool: string;
  version: string;
  managedBy: string;
  directAccess: string;
  adIntegrated: string;
  remarks: string;
}

const ROWS: Omit<TechStackRow, "id" | "status" | "tool" | "version" | "managedBy" | "directAccess" | "adIntegrated" | "remarks">[] = [
  { domain: "Access Control & Authentication", system: "Remote Access Security Technology", requirement: "Multi-Factor Authentication" },
  { domain: "Access Control & Authentication", system: "Identity Access Management", requirement: "Centralized/decentralized access mechanism for system components (e.g., AD, RADIUS, TACACS, IGA)" },
  { domain: "Endpoint Security & System Hardening", system: "Privileged Access Management", requirement: "Secure privileged account access" },
  { domain: "Data Protection & Encryption", system: "Data Leakage Protection", requirement: "Prevent unauthorized data transfer & leakage" },
  { domain: "Data Protection & Encryption", system: "Endpoint-Level Encryption", requirement: "Encrypt storage on laptops/desktops" },
  { domain: "Data Protection & Encryption", system: "Data-at-Rest Encryption", requirement: "Hardware-based encryption & secure key storage (e.g., HSM)" },
  { domain: "Data Protection & Encryption", system: "Data Backup", requirement: "Secure backup, retention, and restoration" },
  { domain: "Data Protection & Encryption", system: "Data Wiping Tool", requirement: "Secure erasure of endpoint or storage devices" },
  { domain: "Network Security", system: "Network Access Control", requirement: "Device authentication & network access enforcement" },
  { domain: "Network Security", system: "Web & Email Gateway", requirement: "Web filtering, email security, anti-phishing" },
  { domain: "Network Security", system: "Firewall / VPN", requirement: "Secure perimeter defense & remote access" },
  { domain: "Network Security", system: "IPS & IDS", requirement: "Detect and prevent network intrusions" },
  { domain: "Network Security", system: "VAPT Tool", requirement: "Vulnerability assessment & penetration testing" },
  { domain: "Network Security", system: "Access Point Controller", requirement: "Wireless access point management & security" },
  { domain: "Endpoint Security & System Hardening", system: "Anti-Malware Solution", requirement: "Protect endpoints from viruses, malware, and advanced threats (AV, EDR, behavior analytics)" },
  { domain: "Endpoint Security & System Hardening", system: "Host IDS/IPS", requirement: "Detect and prevent host-level intrusions" },
  { domain: "Endpoint Security & System Hardening", system: "Patch Management Tool", requirement: "Automate OS/application patching" },
  { domain: "Application & API Security", system: "DDoS Protection", requirement: "Protect applications from distributed denial-of-service attacks" },
  { domain: "Application & API Security", system: "Web Application Firewall", requirement: "Protect web applications from attacks" },
  { domain: "Application & API Security", system: "File Integrity Monitoring", requirement: "Detect unauthorized changes to critical files" },
  { domain: "Logging & Monitoring", system: "Security Orchestration, Automation, and Response", requirement: "Automate incident response and workflow" },
  { domain: "Logging & Monitoring", system: "Enterprise Log Repository", requirement: "Centralized log collection, storage, and analysis (SIEM)" },
  { domain: "Logging & Monitoring", system: "Phishing Simulation", requirement: "Promote employee training and awareness" },
  { domain: "Logging & Monitoring", system: "Mobile Device Management", requirement: "Prevent data leakage through personal apps or unsecured channels" },
];

export const defaultTechStackFull: TechStackRow[] = ROWS.map((r, i) => ({
  id: `TS-${String(i + 1).padStart(3, "0")}`,
  ...r,
  status: "", tool: "", version: "", managedBy: "", directAccess: "", adIntegrated: "", remarks: "",
}));

const KEY = "pa_tech_stack_full";
export function loadTechStackFull(): TechStackRow[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v?.length ? v : defaultTechStackFull; } catch { return defaultTechStackFull; }
}
export function saveTechStackFull(list: TechStackRow[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

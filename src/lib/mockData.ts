export type PIAStatus = "Draft" | "For Finalization" | "Final";

export interface PIA {
  id: string;
  dpsName: string;
  owner: string;
  status: PIAStatus;
  updatedAt: string;
  phase: 1 | 2 | 3;
  confidence: number;
  category: string;
}

export const mockPIAs: PIA[] = [
  { id: "PIA-001", dpsName: "HR Onboarding Portal", owner: "People Ops", status: "Final", updatedAt: "2026-04-12", phase: 3, confidence: 96, category: "HR" },
  { id: "PIA-002", dpsName: "Customer CRM (Anonymized)", owner: "Sales Ops", status: "For Finalization", updatedAt: "2026-04-21", phase: 2, confidence: 88, category: "CRM" },
  { id: "PIA-003", dpsName: "Payroll Disbursement System", owner: "Finance", status: "Draft", updatedAt: "2026-04-26", phase: 1, confidence: 74, category: "Finance" },
  { id: "PIA-004", dpsName: "Vendor Management Tool", owner: "Procurement", status: "Final", updatedAt: "2026-03-30", phase: 3, confidence: 93, category: "Vendor" },
  { id: "PIA-005", dpsName: "Marketing Newsletter Platform", owner: "Marketing", status: "For Finalization", updatedAt: "2026-04-25", phase: 2, confidence: 81, category: "Marketing" },
  { id: "PIA-006", dpsName: "Visitor Logbook System", owner: "Admin", status: "Draft", updatedAt: "2026-04-28", phase: 1, confidence: 69, category: "Facilities" },
];

export const transcriptSample = `[09:02] Maria S. (DPO): Let's walk through the new HR onboarding portal.
[09:03] John D. (HR Lead): Sure. The system collects full name, government IDs, contact info, and bank details for payroll.
[09:05] John D.: We also store medical certificates for pre-employment, which is sensitive personal info.
[09:07] Maria S.: Legal basis?
[09:07] John D.: Contractual necessity for the employment, and consent for medical data.
[09:10] John D.: Data is stored on AWS Singapore, encrypted at rest. Retention is 5 years post-separation, then secure deletion.
[09:14] Maria S.: Any third-party sharing?
[09:15] John D.: Yes — payroll vendor (local), and background check provider in Hong Kong (cross-border).
[09:18] Maria S.: Got it. We'll generate the PIA and flag the cross-border transfer as a key risk.`;

export const extractedFields = [
  { field: "Data Processing System", value: "HR Onboarding Portal", confidence: 98 },
  { field: "Purpose and Scope", value: "Employee onboarding, payroll setup, and pre-employment screening.", confidence: 94 },
  { field: "Data Collection", value: "Direct from candidate via web form; HR-uploaded documents.", confidence: 91 },
  { field: "Personal Data", value: "Full name, contact info, government IDs, bank account", confidence: 96 },
  { field: "Sensitive Personal Info", value: "Medical certificates (pre-employment)", confidence: 92 },
  { field: "Legal Basis", value: "Contractual necessity; Consent (for SPI)", confidence: 89 },
  { field: "Storage", value: "AWS Singapore, encrypted at rest (AES-256)", confidence: 87 },
  { field: "Retention", value: "5 years post-separation, then secure deletion", confidence: 90 },
  { field: "Sharing / Cross-Border", value: "Payroll vendor (local); Background check provider — Hong Kong", confidence: 85 },
  { field: "Security Measures", value: "RBAC, MFA, encryption in transit & at rest, audit logs", confidence: 78 },
  { field: "Privacy Risks", value: "Cross-border transfer of SPI; vendor access scope", confidence: 72 },
];

export const ropaRows = [
  { dpsType: "Electronic", dpsName: "HR Onboarding Portal", purpose: "Employment onboarding", subjects: "Candidates, Employees", categories: "Identifiers, Financial, Health (SPI)", basis: "Contract; Consent", picPip: "PIC: Acme Corp / PIP: AWS, Payroll Vendor", sharing: "Payroll Vendor; BG Check (HK)", retention: "5 yrs post-separation", crossBorder: "Yes — Hong Kong" },
  { dpsType: "Both", dpsName: "Customer CRM", purpose: "Sales engagement", subjects: "Customers, Leads", categories: "Identifiers, Contact", basis: "Legitimate Interest", picPip: "PIC: Acme Corp", sharing: "None", retention: "3 yrs post-inactive", crossBorder: "No" },
  { dpsType: "Electronic", dpsName: "Payroll Disbursement", purpose: "Salary processing", subjects: "Employees", categories: "Identifiers, Financial", basis: "Contract; Legal Obligation", picPip: "PIC: Acme / PIP: BankCo", sharing: "Banking partner", retention: "10 yrs (BIR)", crossBorder: "No" },
  { dpsType: "Electronic", dpsName: "Vendor Management", purpose: "Procurement, due diligence", subjects: "Vendor reps", categories: "Identifiers, Contact", basis: "Legitimate Interest", picPip: "PIC: Acme Corp", sharing: "None", retention: "5 yrs post-contract", crossBorder: "No" },
];

export const pradarItems = [
  { id: "P1", area: "Governance", item: "Designated DPO and contact details published", level: 4, checked: true },
  { id: "P2", area: "Governance", item: "Privacy Management Program documented", level: 3, checked: true },
  { id: "P3", area: "Risk Assessment", item: "PIA conducted for all DPS", level: 3, checked: false },
  { id: "P4", area: "Organizational", item: "Privacy training rolled out (annual)", level: 2, checked: true },
  { id: "P5", area: "Physical", item: "Access controls to records areas", level: 4, checked: true },
  { id: "P6", area: "Technical", item: "Encryption at rest and in transit", level: 4, checked: true },
  { id: "P7", area: "Technical", item: "Vulnerability assessment / pen test", level: 2, checked: false },
  { id: "P8", area: "Breach Mgmt", item: "Incident response plan with NPC notification", level: 3, checked: true },
  { id: "P9", area: "Data Subject Rights", item: "Process to handle access/correction requests", level: 3, checked: true },
  { id: "P10", area: "Third Parties", item: "DSA / DPA executed with all PIPs", level: 2, checked: false },
];

export const drlSystems = [
  { domain: "Endpoint", system: "Windows Workstations", requirement: "Disk encryption", status: "Open", tool: "BitLocker", version: "Win11 23H2", managedBy: "IT Ops", direct: "Yes", ad: "Yes", scope: "Enterprise-wide" },
  { domain: "Network", system: "Firewall", requirement: "Egress filtering", status: "Closed", tool: "Fortinet", version: "7.4", managedBy: "Network Team", direct: "No", ad: "No", scope: "Enterprise-wide" },
  { domain: "Application", system: "HR Portal", requirement: "MFA enforcement", status: "Open", tool: "Okta", version: "—", managedBy: "IT Sec", direct: "Yes", ad: "Yes", scope: "Per System" },
  { domain: "Database", system: "Payroll DB", requirement: "TDE enabled", status: "Closed", tool: "MS SQL", version: "2022", managedBy: "DBA", direct: "No", ad: "Yes", scope: "Per System" },
];

export const auditTrail = [
  { ts: "2026-04-30 09:14", user: "maria.santos@acme.ph", action: "Generated PIA from transcript", target: "PIA-007 (draft)" },
  { ts: "2026-04-30 09:02", user: "maria.santos@acme.ph", action: "Uploaded transcript", target: "fireflies_hr_onboarding.txt" },
  { ts: "2026-04-29 16:40", user: "ana.cruz@acme.ph", action: "Validated PIA (Supervisor)", target: "PIA-004" },
  { ts: "2026-04-29 11:12", user: "rico.tan@acme.ph", action: "Forwarded to AM/Manager", target: "PIA-004" },
  { ts: "2026-04-28 14:05", user: "system", action: "Anonymized client identifiers", target: "transcript_upload_0428" },
];

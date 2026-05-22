// Tech Security baseline checklist (seed)

export interface TechItem {
  id: string;
  category: "Network" | "Endpoint" | "Application" | "Data" | "Identity" | "Operations";
  control: string;
  reference: string;
  status: "Implemented" | "Partial" | "Not Implemented" | "N/A";
  remarks: string;
}

export const defaultTechStack: TechItem[] = [
  { id: "T-001", category: "Network",     control: "Firewall with default-deny ingress",    reference: "NPC Adv. 2017-01", status: "Implemented",   remarks: "" },
  { id: "T-002", category: "Network",     control: "IDS/IPS on perimeter",                  reference: "ISO 27001 A.13",   status: "Partial",        remarks: "Pending tuning" },
  { id: "T-003", category: "Endpoint",    control: "Disk encryption (FDE)",                 reference: "DPA Sec. 20",      status: "Implemented",   remarks: "" },
  { id: "T-004", category: "Endpoint",    control: "EDR / Anti-malware",                    reference: "ISO 27001 A.12",   status: "Implemented",   remarks: "" },
  { id: "T-005", category: "Application", control: "Secure SDLC reviews",                   reference: "OWASP ASVS",       status: "Not Implemented", remarks: "" },
  { id: "T-006", category: "Application", control: "Vulnerability scanning quarterly",      reference: "NIST SP 800-53",   status: "Partial",        remarks: "Annual only" },
  { id: "T-007", category: "Data",        control: "Encryption at rest (AES-256)",          reference: "DPA Sec. 20",      status: "Implemented",   remarks: "" },
  { id: "T-008", category: "Data",        control: "Encryption in transit (TLS 1.2+)",      reference: "DPA Sec. 20",      status: "Implemented",   remarks: "" },
  { id: "T-009", category: "Identity",    control: "MFA for privileged accounts",           reference: "NPC Circular 16-01", status: "Partial",      remarks: "Admins only" },
  { id: "T-010", category: "Identity",    control: "Quarterly access review",               reference: "ISO 27001 A.9",    status: "Not Implemented", remarks: "" },
  { id: "T-011", category: "Operations",  control: "Backup & tested restoration",           reference: "ISO 27001 A.12.3", status: "Implemented",   remarks: "Monthly" },
  { id: "T-012", category: "Operations",  control: "Security incident response plan",       reference: "NPC Circular 16-03", status: "Implemented",  remarks: "" },
];

// Section templates for every manual. Keyed by manual name.

export interface ManualSec { id: string; title: string; body: string }

export const MANUAL_SECTIONS: Record<string, ManualSec[]> = {
  "Privacy Manual": [
    { id: "intro",   title: "Introduction",                 body: "Purpose and scope of this Privacy Manual." },
    { id: "scope",   title: "Scope and Application",        body: "Applies to all personnel, contractors, and third parties." },
    { id: "roles",   title: "Roles and Responsibilities",   body: "DPO, Compliance Officer, Asset Owners, Data Stewards." },
    { id: "rights",  title: "Data Subject Rights",          body: "Access, correction, deletion, objection, portability." },
    { id: "breach",  title: "Breach Management",            body: "Detection, containment, notification within 72 hours." },
    { id: "retent",  title: "Retention",                    body: "Retention periods by data category, secure disposal." },
  ],
  "Data Security Policy": [
    { id: "control",  title: "Access Control",        body: "Least-privilege, RBAC, MFA on all production systems." },
    { id: "encrypt",  title: "Encryption",            body: "AES-256 at rest, TLS 1.2+ in transit." },
    { id: "backup",   title: "Backup & Restore",      body: "Daily incremental, weekly full; quarterly restore drills." },
    { id: "logging",  title: "Logging & Monitoring",  body: "Centralized SIEM, 12-month retention, daily review of alerts." },
    { id: "incident", title: "Incident Response",     body: "Detect-Contain-Eradicate-Recover-Lessons Learned." },
  ],
  "Acceptable Use Policy": [
    { id: "use",     title: "Authorized Use",      body: "Company resources are for business use; limited personal use permitted." },
    { id: "prohib",  title: "Prohibited Activities", body: "No illegal content, no sharing of credentials, no unapproved software." },
    { id: "device",  title: "Personal Devices (BYOD)", body: "MDM enrollment, encryption, remote wipe capability required." },
    { id: "comms",   title: "Communications",      body: "Email, IM, and video tools usage standards." },
    { id: "enforce", title: "Enforcement",         body: "Violations may result in suspension, termination, or legal action." },
  ],
  "Retention and Disposal Policy": [
    { id: "sched",   title: "Retention Schedule",    body: "By data class — see Appendix A for full table." },
    { id: "triggers",title: "Disposal Triggers",     body: "End of legal hold, contract expiry, employee separation." },
    { id: "method",  title: "Disposal Methods",      body: "Cryptographic erasure, NIST 800-88 wiping, physical destruction." },
    { id: "vendor",  title: "Vendor Obligations",    body: "Processors must certify destruction within 30 days." },
    { id: "audit",   title: "Audit Trail",           body: "Maintain disposal certificates for 3 years." },
  ],
  "Business Continuity Plan": [
    { id: "bia",     title: "Business Impact Analysis", body: "Identify critical functions, RTO/RPO per system." },
    { id: "strat",   title: "Recovery Strategies",      body: "Failover sites, cloud DR, manual workarounds." },
    { id: "roles",   title: "BCP Team Roles",           body: "Incident Commander, Comms Lead, IT Recovery Lead, HR Lead." },
    { id: "comms",   title: "Communications",           body: "Internal cascade tree, customer notification templates." },
    { id: "test",    title: "Testing & Maintenance",    body: "Annual tabletop, biennial full failover, quarterly review." },
  ],
  "Access Control Policy": [
    { id: "prov",    title: "Provisioning",          body: "Joiner-Mover-Leaver workflow with manager approval." },
    { id: "rbac",    title: "Role-Based Access",     body: "Predefined roles map to entitlements; quarterly recertification." },
    { id: "priv",    title: "Privileged Access",     body: "PAM vault, just-in-time elevation, session recording." },
    { id: "mfa",     title: "Authentication",        body: "MFA mandatory for VPN, admin consoles, and external apps." },
    { id: "review",  title: "Access Review",         body: "Quarterly entitlement review owned by data owners." },
  ],
  "CCTV Policy": [
    { id: "purpose", title: "Purpose & Legal Basis", body: "Security, deterrence, incident investigation; legitimate interest." },
    { id: "coverage",title: "Coverage & Signage",    body: "Public-facing notices at every monitored zone; no restrooms or changing rooms." },
    { id: "retain",  title: "Retention",             body: "30 days standard; up to 90 days for active investigation." },
    { id: "access",  title: "Access Control",        body: "Footage accessible only to Security and DPO; access logged." },
    { id: "rights",  title: "Data Subject Rights",   body: "Subjects may request footage of themselves via DPO within 30 days." },
  ],
};

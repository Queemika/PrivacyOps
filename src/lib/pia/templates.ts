// Seed questions and dropdown enums from the firm's PIA Excel template.

export const LAWFUL_BASIS_PI = [
  "Consent",
  "Fulfillment of a contract",
  "Compliance with a legal obligation",
  "Protect vitally important interests of the data subject",
  "National emergency or public order and safety",
  "Constitutional/statutory mandate of a public authority",
  "Legitimate interests",
  "N/A",
];

export const LAWFUL_BASIS_SPI = [
  "Consent",
  "Existing laws and regulations",
  "Protect the life and health of the data subject",
  "Lawful and noncommercial objectives",
  "Medical treatment",
  "Protection of lawful rights",
  "N/A",
];

export const MEDIA_TYPES = ["Electronic", "Physical", "Unspecified"] as const;

export const DATA_COLLECTION_OPTIONS = ["Online Form", "Manual / Paper Form", "API / System Integration", "Email", "Phone / Verbal", "Third Party", "CCTV / Sensor"];
export const DATA_STORAGE_OPTIONS = ["Cloud", "On-prem Server", "Physical Cabinet", "Local Workstation", "Third-party Vendor"];
export const DATA_DISPOSAL_OPTIONS = ["Shredding", "Secure Erase / Wipe", "Vendor-managed Disposal", "Anonymization", "Archival then Destruction", "Other"];
export const INTEGRATION_OPTIONS = ["Email Service", "Identity Provider (SSO)", "Payment Gateway", "Analytics", "CRM", "ERP / HRIS", "External API"];
export const RECORD_VOLUME_OPTIONS = ["Low (<250)", "Medium (<1000)", "High (1000+)"];

export const PHASE1_TOOLTIPS: Record<string, string> = {
  systemType: "Purely System-Based, Filing System, or Hybrid System. Keep it high-level but specific.",
  systemFunction: "What the system is designed to manage — insert all that's applicable: collection, use, storage, sharing, and/or disposal of personal data.",
  organizationScope: "Input the Organization Name / business unit / department owning the system.",
  keyProcesses: "List how personal data is handled across the lifecycle.",
  dataCollection: "Gathering data through — e.g., online forms, surveys, direct submissions.",
  dataUsage: "Using data for — e.g., service delivery, research, compliance.",
  dataStorage: "Secure storage in — e.g., centralized database with access controls.",
  dataDisposal: "Secure disposal in line with — e.g., retention policy and legal requirements.",
  integration: "Specify the programs this system integrates with (e.g., HRIS, payroll, SSO).",
  supportingDocs: "Reference documents like the Requirements & Design Specifications.",
  purpose: "e.g., streamline data management, protect personal data, and support organizational goals while ensuring the rights of data subjects.",
  piaScope: "Input the System/Project name and the activities reviewed (collection, use, storage, sharing, disposal). It examines data types, legal basis, security, consent management, and data sharing.",
  outOfScope: "Identify areas not covered in this PIA (e.g., non-personal data, out-of-system processes).",
};

// Phase 2 tooltips sourced from Drop_and_Tooltips.xlsx
export const PHASE2_TOOLTIPS: Record<string, string> = {
  dpsType: "Manual = physical documents collected. Electronic/Automated = electronic data being processed. Both = if a physical form is eventually processed electronically.",
  dpsName: "Title of the system being registered (e.g., HRIS, Registration System).",
  purposeProcessing: 'Why the information is being processed (e.g., "This DPS is used for processing of the salaries of employees, etc.").',
  dataSubjectsDesc: "e.g., Employees, customers, clients, suppliers, etc.",
  categories: "e.g., name, contact details (home address, phone no., personal email), IP address, online/offline identifier, voice/voice pattern, professional/employment details.",
  amount: "Please enter a whole number only (no decimals or text).",
  picOrPip: "Are you processing personal data as a PIC or a PIP? If both, you must register each use separately in the NPC-RS.",
  pipName: 'Applicable only if outsourced or subcontracted. If not, enter "N/A" or leave blank.',
  retention: "Conditional question — only applicable if there has been a notification regarding any automated decision-making operation and/or profiling.",
  securityOrg: "e.g., designation of DPO, data protection policies, RoPA, HR management, personal data processing, third-party contracts.",
  securityPhysical: "e.g., access control, workspace privacy, personnel access management, media handling, security & protection.",
  securityTechnical: "e.g., network protection, system testing, resilience & monitoring, data encryption & recovery.",
  collectionWhen: "Manner when the data is collected (e.g., upon submission of form and other requirements).",
  collectionFrom: "e.g., Data Subjects, Authorized Representatives of the Data Subject, Third Parties, Internal Departments, Public Sources.",
  repositoryLocation: "e.g., filing cabinet, storage room, local network drive, on-premise data center, remote data center, external backup, cloud provider infrastructure, on-premise server.",
  retentionBasis: "Indicate the reason for retention (e.g., legal requirement — cite specific law or regulation, industry standard — ISO/NIST, company policy).",
  disposal: "e.g., shredding (cross-cut), data wiping, degaussing, physical destruction of storage devices, cryptographic erasure.",
};

// Phase 3 default-response hints (drop-downs and "if No" boilerplate)
export const PHASE3_TOOLTIPS: Record<string, string> = {
  ynNA: 'Choose the applicable option from the dropdown (Yes / No / N/A). Enter "N/A" if not applicable; leave the response blank otherwise.',
  impact: "1 = Negligible, 2 = Limited, 3 = Significant, 4 = Maximum.",
  probability: "1 = Unlikely, 2 = Possible, 3 = Likely, 4 = Almost Certain.",
  riskRating: "Negligible / Low Risk / Medium Risk / High Risk — auto-derived from Impact × Probability.",
};

// Threshold-question response hints — appears under each Yes/No
export const THRESHOLD_HINTS: Record<string, string> = {
  T1: "e.g. name, contact details (home/office address, phone, email), IP address, online identifier (username, social media, password, photo, signature), voice/voice pattern, professional/employment details.",
  T2: "e.g., race, ethnicity, marital status, age, color, religion, politics, health, education, genetics, sexual life, legal matters, government-issued numbers, classified by law.",
  T4: "e.g., children, employees, elderly, patients, PWD, asylum seekers.",
  T5: "Low (<250), Medium (<1000), High (1000+).",
  T6: "e.g., Microsoft Excel, Google Sheets, Microsoft Word, Zoom, Adobe Acrobat, etc.",
  T10: "e.g., biometrics, facial recognition or Internet of Things.",
  T11: "e.g., processing leads to discrimination against individuals, work performance evaluation.",
  T12: "e.g., disqualifies someone for a benefit, loan disapproval.",
};

export const THRESHOLD_QUESTIONS: { id: string; q: string }[] = [
  { id: "T1", q: "Does the project or system collect, use, keep, share, or dispose of personal information?" },
  { id: "T2", q: "Does the project or system collect, use, keep, share, or dispose of sensitive personal information or privileged information?" },
  { id: "T3", q: "Is processing regular and not just a one-time thing?" },
  { id: "T4", q: "Does the project or system include information about vulnerable individuals?" },
  { id: "T5", q: "Does the processing involve records of 250 or more individuals?" },
  { id: "T6", q: "Does the processing use off-the-shelf software?" },
  { id: "T7", q: "Are you using individuals' information for a purpose other than originally intended?" },
  { id: "T8", q: "Will individuals' information be used for marketing, online services, systematic monitoring, tracking or observing their location or behavior?" },
  { id: "T9", q: "Will individuals' information be shared with organizations or people who have not previously had regular access to it?" },
  { id: "T10", q: "Does the project or system use new technology that may be seen as privacy-intrusive?" },
  { id: "T11", q: "Will the processing use automated decision making, AI or profiling with legal or similar significant effect?" },
  { id: "T12", q: "Will the processing prevent individuals from exercising a right or using a service or a contract?" },
];

export interface ChecklistSeed {
  id: string;
  section: string;
  question: string;
  subItems?: { key: string; label: string }[];
  threats?: string;
  risk?: string;
  legalBasis?: string;
  defaultImpact?: number;
  defaultProbability?: number;
}

export const PRINCIPLES_SEED: ChecklistSeed[] = [
  {
    id: "GP-T1", section: "Transparency",
    question: "Are data subjects informed of the following details before or shortly after their personal data is collected (Privacy Notice)? Check all present",
    subItems: [
      { key: "a", label: "Description of the personal data to be processed" },
      { key: "b", label: "Purposes of processing, including direct marketing, profiling or historical, statistical or scientific purpose if applicable" },
      { key: "c", label: "Basis of processing, when not based on consent" },
      { key: "d", label: "Scope and method of processing" },
      { key: "e", label: "Recipients or categories of recipients who may receive the personal data" },
      { key: "f", label: "Methods used for automated access (cookie notification), if allowed by the data subject" },
      { key: "g", label: "Risks and safeguards involved in the processing" },
      { key: "h", label: "Identity and contact details of the PIC (your organization) or its representative (DPO)" },
      { key: "i", label: "Retention period" },
      { key: "j", label: "Data subject rights and the process for exercising them" },
    ],
    threats: "Absence of a comprehensive and timely privacy notice creates a transparency gap, weakening data subjects' ability to make informed decisions and exercise their rights.",
    risk: "Violation of general privacy principles – Transparency\nViolation of data subject rights - Rights to be informed",
    legalBasis: "SEC. 11, DPA; SEC. 16(a)(b), DPA",
    defaultImpact: 4, defaultProbability: 4,
  },
  {
    id: "GP-T2", section: "Transparency",
    question: "Is information and communication about personal data processing easy to access and understand, using clear and plain language (Privacy Notice)?",
    threats: "Use of complex or technical language in privacy notices makes it difficult for data subjects to understand how their personal data is processed.",
    risk: "Violation of general privacy principles – Transparency",
    legalBasis: "SEC. 11, DPA",
    defaultImpact: 4, defaultProbability: 4,
  },
  {
    id: "GP-LP1", section: "Legitimate Purpose / Lawfulness",
    question: "Is the processing of personal data compatible with a declared and specified purpose which are not contrary to law, morals, or public policy?",
    threats: "Processing personal data for purposes that are incompatible with the declared purpose may lead to regulatory sanctions.",
    risk: "Violation of general privacy principles – Legitimate Purpose",
    legalBasis: "SEC. 11, DPA",
  },
  {
    id: "GP-LP2", section: "Legitimate Purpose / Lawfulness",
    question: "Is the processing based on Section 4 (special cases), Section 12 (personal information), or Section 13 (sensitive and privileged information) of the DPA?",
    threats: "Processing personal data without a valid legal basis exposes the organization to legal liabilities.",
    risk: "Violation of general privacy principles – Legitimate Purpose",
    legalBasis: "SEC. 11, DPA",
  },
  {
    id: "GP-F1", section: "Fairness",
    question: "Is the Privacy Notice / Consent Form presented objectively and neutrally, without deceptive or manipulative language or design?",
  },
  {
    id: "GP-A1", section: "Data Quality / Accuracy",
    question: "Is personal data accurate, and kept up to date? Check all present",
    subItems: [
      { key: "a", label: "Verify data at collection" },
      { key: "b", label: "Review and update personal data regularly" },
      { key: "c", label: "Allow users to update their personal data securely" },
      { key: "d", label: "Use reliable sources when updating records" },
    ],
    threats: "Inaccurate or outdated personal data can lead to incorrect decisions, harm to data subjects, and non-compliance.",
    risk: "Violation of general privacy principles – Accuracy",
    legalBasis: "SEC. 11, DPA",
  },
  {
    id: "GP-A2", section: "Data Quality / Accuracy",
    question: "Is inaccurate or incomplete data rectified, supplemented, destroyed or their further processing restricted? Check all present",
    subItems: [
      { key: "a", label: "People can request corrections and erasure easily" },
      { key: "b", label: "Data processing restrictions of inaccurate or incomplete data until rectified" },
      { key: "c", label: "Secure disposal methods" },
    ],
    threats: "Failure to rectify or restrict processing of inaccurate or incomplete data compromises data quality.",
    risk: "Violation of general privacy principles – Accuracy",
    legalBasis: "SEC. 11, DPA",
  },
  {
    id: "GP-PL1", section: "Purpose Limitation",
    question: "Is personal data collected for specified purpose not further processed in a manner that is incompatible with that purpose?",
    threats: "Processing personal data for unspecified or incompatible purposes increases the risk of unauthorized use.",
    risk: "Violation of general privacy principles – Purpose Limitation\nUnlawful Processing - Processing for Unauthorized Purposes",
    legalBasis: "SEC. 11, DPA; SEC. 28, DPA",
  },
  {
    id: "GP-SL1", section: "Storage Limitation",
    question: "Is personal data retained only for as long as necessary? Check all applicable",
    subItems: [
      { key: "a", label: "To fulfill the declared, specified, and legitimate purpose" },
      { key: "b", label: "For the establishment, exercise or defense of legal claims" },
      { key: "c", label: "For legitimate business purposes aligned with industry standards" },
      { key: "d", label: "Retention is allowed/required by law/appropriate government agency" },
      { key: "e", label: "Aggregated or anonymized personal data may be kept beyond the necessary period" },
    ],
    threats: "Retaining personal data longer than necessary increases the risk of data breaches.",
    risk: "Violation of general privacy principles – Storage Limitation",
    legalBasis: "SEC. 11, DPA",
  },
];

export const RIGHTS_SEED: ChecklistSeed[] = [
  { id: "DSR-1", section: "Right to object",
    question: "(For consent) Do you obtain the data subject's consent, evidenced by written, electronic, or recorded means, before processing their personal data?",
    risk: "Unlawful Processing - Unauthorized Processing of Personal Data", legalBasis: "SEC. 25, DPA" },
  { id: "DSR-2", section: "Right to object",
    question: "(For consent) Before obtaining consent, do you provide the following information clearly and concisely in the consent form or Privacy Notice? Check all present",
    subItems: [
      { key: "a", label: "Description of the personal data to be processed" },
      { key: "b", label: "Purpose, nature, extent, duration and scope of processing" },
      { key: "c", label: "Identity of the PIC" },
      { key: "d", label: "Data subject rights and the process for exercising them" },
    ],
    risk: "Unlawful Processing - Unauthorized Processing\nViolation of general privacy principles – Transparency",
    legalBasis: "SEC. 25, DPA; SEC. 11, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "DSR-3", section: "Right to object",
    question: "(For consent) Does the data subject give specific consent for each declared purpose of data processing?",
    risk: "Unlawful Processing - Unauthorized Processing", legalBasis: "SEC. 25, DPA; SEC. 11, DPA" },
  { id: "DSR-4", section: "Right to object",
    question: "Do you inform the data subject of their right to object or withdraw consent to the processing of their personal data?",
    risk: "Violation of data subject rights - Rights to object", legalBasis: "SEC. 11, DPA; SEC. 34(b), IRR" },
  { id: "DSR-5", section: "Right to object",
    question: "Do you inform the data subject of the scope and consequences of withdrawing consent or objecting?",
    risk: "Violation of data subject rights - Rights to object", legalBasis: "SEC. 11, DPA; SEC. 34(b), IRR" },
  { id: "DSR-6", section: "Right to object",
    question: "When a data subject objects, do you stop processing their personal data and comply with the objection?",
    risk: "Violation of data subject rights - Rights to object", legalBasis: "SEC. 34(b), IRR" },
  { id: "DSR-7", section: "Right to object",
    question: "Do data subjects have the right to object to processing for direct marketing, profiling, or automated processing?",
    risk: "Violation of data subject rights - Rights to object", legalBasis: "SEC. 34(b), IRR; SEC. 25, DPA" },
  { id: "DSR-AC1", section: "Right to access",
    question: "Does the data subject have the right to confirm if their personal data is being processed and access details about its processing?",
    subItems: [
      { key: "a", label: "Content and categories of his or her personal data" },
      { key: "b", label: "Sources from which personal data was obtained" },
      { key: "c", label: "Purposes of processing" },
      { key: "d", label: "Manner by which personal data were processed" },
      { key: "e", label: "Automated processes using personal data as the sole basis for decisions" },
      { key: "f", label: "Names and addresses of recipients of the personal data" },
      { key: "g", label: "Date when his or her personal data were last accessed and modified" },
      { key: "h", label: "Retention period" },
      { key: "i", label: "Designation, name or identity, and address of the DPO" },
    ],
    risk: "Violation of data subject rights - Right to access", legalBasis: "SEC. 16(c), DPA" },
  { id: "DSR-RT1", section: "Right to rectify",
    question: "Does the data subject have the right to dispute inaccuracies and have the PIC correct them within a reasonable time?",
    risk: "Violation of data subject rights - Right to rectification", legalBasis: "SEC. 16(d), DPA; SEC. 11, DPA" },
  { id: "DSR-RT2a", section: "Right to rectify",
    question: "If personal data has been corrected, does the PIC ensure both the new and retracted information are accessible and received simultaneously by recipients?",
    risk: "Violation of data subject rights - Right to rectification", legalBasis: "SEC. 16(d), DPA" },
  { id: "DSR-RT2b", section: "Right to rectify",
    question: "Does the PIC inform recipients or third parties who previously received the inaccurate personal data about its inaccuracy and subsequent correction?",
    risk: "Violation of data subject rights - Right to rectification", legalBasis: "SEC. 16(d), DPA" },
  { id: "DSR-ER1", section: "Right to erasure or blocking",
    question: "Does the data subject have the right to request suspension, withdrawal, blocking, removal, or destruction of their personal data?",
    risk: "Violation of data subject rights - Right to erasure or blocking", legalBasis: "SEC. 16(e), DPA" },
  { id: "DSR-DP1", section: "Right to data portability",
    question: "Does the data subject have the right to obtain a copy of their personal data in a commonly used, structured, electronic format?",
    risk: "Violation of data subject rights - Right to data portability", legalBasis: "SEC. 18, DPA" },
  { id: "DSR-CO1", section: "Right to file a complaint / damages",
    question: "Do you inform the data subject that they have the right to file a complaint with the NPC or be indemnified for damages?",
    risk: "Violation of data subject rights - Right to damages", legalBasis: "SEC. 16(f), DPA" },
];

export const ORG_SECURITY_SEED: ChecklistSeed[] = [
  { id: "OS-1", section: "Organizational Security",
    question: "Have you appointed and registered a Data Protection Officer (DPO) with the NPC?",
    risk: "Failure to implement reasonable and appropriate security measures - Organizational", legalBasis: "SEC. 20, DPA" },
  { id: "OS-2", section: "Organizational Security",
    question: "Have you registered this project or system with the NPC?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational; Failure to register the data processing system",
    legalBasis: "SEC. 20, DPA; SEC. 24, DPA" },
  { id: "OS-3", section: "Organizational Security",
    question: "Do you have an inventory of this project or system? Check all present",
    subItems: [
      { key: "a", label: "Purpose of processing of personal data, including future processing or data sharing" },
      { key: "b", label: "Categories of data subjects, personal data, and recipients involved" },
      { key: "c", label: "Data flow from collection to disposal, including retention periods" },
      { key: "d", label: "Security measures (organizational, physical, and technical)" },
      { key: "e", label: "Contact details of the PIC, joint controller, representative, and DPO" },
    ],
    risk: "Failure to implement reasonable and appropriate security measures – Organizational; Personal Data Breach - Availability",
    legalBasis: "SEC. 20, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "OS-4", section: "Organizational Security",
    question: "Do you conduct a PIA for this project or system annually and update when necessary?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational",
    legalBasis: "SEC. 20, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "OS-5", section: "Organizational Security",
    question: "Are personnel who process personal data under strict confidentiality (signed NDAs)?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational; Personal Data Breach - Confidentiality",
    legalBasis: "SEC. 20, DPA" },
  { id: "OS-6", section: "Organizational Security",
    question: "Do you periodically train employees, agents, personnel, or representatives on privacy and data protection policies?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational", legalBasis: "SEC. 20, DPA" },
  { id: "OS-7", section: "Organizational Security",
    question: "Do you have a Privacy Management Program (PMP) in place?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational",
    legalBasis: "SEC. 20, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "OS-8", section: "Organizational Security",
    question: "Are there data protection and security measure policies in place (Privacy Manual, etc.)?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational",
    legalBasis: "SEC. 20, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "OS-9", section: "Organizational Security",
    question: "(Optional) If processing is delegated to a PIP, is there a Data Outsourcing/Subcontracting Agreement?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational; Failure to ensure that PIP implements security measures",
    legalBasis: "SEC. 20, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "OS-10", section: "Organizational Security",
    question: "(Optional) If there is data sharing with another organization or person outside your organization, do you observe the general principles?",
    risk: "Failure to implement reasonable and appropriate security measures – Organizational",
    legalBasis: "SEC. 20, DPA; SEC. 32, DPA", defaultImpact: 4, defaultProbability: 4 },
];

export const PHY_SECURITY_SEED: ChecklistSeed[] = [
  { id: "PS-1", section: "Physical Security",
    question: "Do you monitor and limit access and activities to places where the process or system is undertaken?",
    risk: "Failure to implement reasonable and appropriate security measures – Physical; Personal Data Breach - Availability, Integrity, Confidentiality",
    legalBasis: "SEC. 20, DPA; SEC. 29, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "PS-2", section: "Physical Security",
    question: "Are duties, responsibilities, and schedules clearly defined to ensure only authorized individuals are present during data processing?",
    risk: "Failure to implement reasonable and appropriate security measures – Physical", legalBasis: "SEC. 20, DPA; SEC. 26, DPA" },
  { id: "PS-3", section: "Physical Security",
    question: "Are there procedures for the secure transfer, removal, disposal, and re-use of physical files and media?",
    risk: "Failure to implement reasonable and appropriate security measures – Physical; Unlawful Processing - Improper Disposal",
    legalBasis: "SEC. 20, DPA; SEC. 27, DPA" },
  { id: "PS-4", section: "Physical Security",
    question: "Are there measures to prevent destruction of physical files and equipment while protecting workspaces from disaster, power disturbances, and security threats?",
    risk: "Failure to implement reasonable and appropriate security measures – Physical",
    legalBasis: "SEC. 20, DPA; SEC. 27, DPA", defaultImpact: 3, defaultProbability: 3 },
];

export const TECH_SECURITY_SEED: ChecklistSeed[] = [
  { id: "TS-1", section: "Technical Security",
    question: "Has the program taken reasonable steps to protect personal data from misuse, loss, unauthorized access, modification, or disclosure?",
    risk: "Failure to implement reasonable and appropriate security measures – Technical; Personal Data Breach - Availability, Integrity, Confidentiality",
    legalBasis: "SEC. 20, DPA; SEC. 29, DPA", defaultImpact: 4, defaultProbability: 4 },
  { id: "TS-2", section: "Technical Security",
    question: "Do you regularly monitor security breaches and address vulnerabilities in your computer network?",
    risk: "Failure to implement reasonable and appropriate security measures – Technical; Personal Data Breach",
    legalBasis: "SEC. 20, DPA; SEC. 30, DPA" },
  { id: "TS-3", section: "Technical Security",
    question: "Can you restore access to personal data promptly after a physical or technical incident (Business Continuity Plan)?",
    risk: "Failure to implement reasonable and appropriate security measures – Technical; Personal Data Breach - Availability",
    legalBasis: "SEC. 20, DPA" },
  { id: "TS-4", section: "Technical Security",
    question: "Do you have a process for regularly testing and evaluating the effectiveness of security measures?",
    risk: "Failure to implement reasonable and appropriate security measures – Technical",
    legalBasis: "SEC. 20, DPA" },
];

export const CROSS_BORDER_SEED: ChecklistSeed[] = [
  { id: "CB-1", section: "Cross-border Data Flows",
    question: "Does the project or system transfer personal data outside the Philippines (including cloud storage or data centers)?",
    subItems: [
      { key: "a", label: "The individual consents to the transfer" },
      { key: "b", label: "The recipient is subject to laws or contract enforcing principles similar to the DPA of 2012" },
      { key: "c", label: "The transfer is necessary to fulfill a contract between the individual and the organization" },
      { key: "d", label: "The transfer is required for a contract in the individual's interest between the organization and a third party" },
      { key: "e", label: "The transfer benefits the individual" },
    ],
    risk: "Unlawful Processing - Unauthorized Processing; Unlawful Processing - Unauthorized Disclosure",
    legalBasis: "SEC. 25, DPA; SEC. 32, DPA" },
  { id: "CB-2", section: "Cross-border Data Flows",
    question: "Has the organization taken reasonable steps to ensure transferred data is stored, used, disclosed, and processed in compliance with the DPA of 2012?",
    subItems: [
      { key: "a", label: "Data Transfer Security (lawful basis, agreements, secure transmission, data minimization)" },
      { key: "b", label: "Data Storage & Protection (encryption at rest, RBAC, secure storage, retention & disposal)" },
      { key: "c", label: "Data Usage & Processing Compliance (purpose limitation, audits, anonymization, consent mgmt)" },
      { key: "d", label: "Data Disclosure Controls (third-party rules, NDAs, access & correction, breach notification)" },
      { key: "e", label: "Compliance, Monitoring & Awareness (PIA, DPO, training, IR Plan)" },
    ],
    risk: "Failure to implement reasonable and appropriate security measures – Organizational; Personal Data Breach",
    legalBasis: "SEC. 20, DPA", defaultImpact: 4, defaultProbability: 4 },
];

import { Pia } from "./schema";

export interface FieldDef { key: string; label: string; }

export const ROPA_FIELDS: FieldDef[] = [
  { key: "piaName", label: "PIA Name" },
  { key: "dpsName", label: "Data Processing System" },
  { key: "purposeProcessing", label: "Purpose of Processing" },
  { key: "futurePurpose", label: "Intended Future Purpose (if any)" },
  { key: "sharingPurpose", label: "Data Sharing Purpose" },
  { key: "sharingAgreements", label: "Is there any Data Sharing Agreements with other parties?" },
  { key: "dataSubjectsDesc", label: "Description of the category or categories of data subject" },
  { key: "personalInfo", label: "Personal Information" },
  { key: "sensitiveInfo", label: "Sensitive Personal Information" },
  { key: "privilegedInfo", label: "Privileged Information" },
  { key: "whenCollected", label: "When is data collected?" },
  { key: "retention", label: "Retention Period with Reckoning date/time" },
  { key: "disposal", label: "Disposal / Destruction / Deletion Procedure" },
  { key: "securityOrg", label: "Organizational Security Measures" },
  { key: "securityPhysical", label: "Physical Security Measures" },
  { key: "securityTechnical", label: "Technical Security Measures" },
  { key: "picName", label: "Name of PIC" },
  { key: "dpoName", label: "Name of DPO" },
  { key: "dpoEmail", label: "Email" },
  { key: "dpoContact", label: "Contact No." },
  { key: "timestamps", label: "Timestamps (created / updated)" },
];

export const NPC_FIELDS: FieldDef[] = [
  { key: "piaName", label: "PIA Name" },
  { key: "dpsName", label: "Data Processing Name" },
  { key: "dpsType", label: "Is DPS Manual, Electronic, or Both?" },
  { key: "basisPI", label: "Basis for Processing Personal Information" },
  { key: "basisSPI", label: "Basis for Processing Sensitive Personal Information (If applicable)" },
  { key: "purposeProcessing", label: "Purpose of Processing" },
  { key: "dataSubjectsDesc", label: "Description of the category or categories of data subject" },
  { key: "dataCategories", label: "Description of data or categories of data relating to Data Subjects" },
  { key: "recipients", label: "Recipients or categories of recipients to whom the data might be disclosed" },
  { key: "picOrPip", label: "Is processing done as PIC or PIP?" },
  { key: "outsourced", label: "Is the system outsourced or subcontracted?" },
  { key: "pipName", label: "Name of PIP" },
  { key: "pipEmail", label: "Email" },
  { key: "pipContact", label: "Contact No." },
  { key: "whenCollected", label: "When is data collected?" },
  { key: "retention", label: "Retention Period with Reckoning date/time" },
  { key: "disposal", label: "Disposal / Destruction / Deletion Procedure" },
  { key: "securityOrg", label: "Organizational Security Measures" },
  { key: "securityPhysical", label: "Physical Security Measures" },
  { key: "securityTechnical", label: "Technical Security Measures" },
  { key: "crossBorder", label: "Is personal data transferred outside of the Philippines?" },
  { key: "sharingAgreements", label: "Is there any Data Sharing Agreements with other parties?" },
  { key: "picName", label: "Name of PIC" },
  { key: "publicFacing", label: "Is the system a publicly facing online mobile or web-based application?" },
  { key: "externalInternal", label: "Is the system External and/or Internal facing?" },
  { key: "automatedDecisionNotice", label: "Is there any notification regarding any automated decision-making operation?" },
  { key: "lawfulBasis", label: "Lawful basis of processing personal data" },
  { key: "otherBasisInfo", label: "Other relevant information pertaining to specified lawful basis" },
  { key: "consentUsed", label: "Is consent used as the basis for processing?" },
  { key: "consentProof", label: "Consent form or any other proof of obtaining consent?" },
  { key: "retentionDataProcessed", label: "Retention period for the data processed" },
  { key: "automatedMethods", label: "Methods and logic utilized for automated processing" },
  { key: "automatedDecisions", label: "Possible decisions relating to the data subject" },
  { key: "consolidatedStatus", label: "Consolidated DPS: Status" },
  { key: "consolidatedDate", label: "Consolidated DPS: Date of registration" },
];

const join = (xs: (string | undefined | null)[]) => xs.filter(Boolean).join("\n");

export function deriveFieldValue(pia: Pia, key: string): string {
  const p2 = pia.phase2;
  const cats = (type: "PI" | "SPI" | "Privileged") =>
    join(p2.categories.filter(c => c.type === type).map(c => `${c.categories}${c.amount ? ` (~${c.amount})` : ""}`));
  switch (key) {
    case "piaName": return pia.title;
    case "dpsName": return p2.dpsName;
    case "dpsType": return p2.dpsType;
    case "basisPI": return p2.basisPI;
    case "basisSPI": return p2.basisSPI;
    case "purposeProcessing": return p2.purposeProcessing;
    case "futurePurpose": return p2.futurePurpose;
    case "sharingPurpose": return join(p2.disclosure.map(d => d.purpose));
    case "sharingAgreements": return join(p2.disclosure.map(d => d.agreement));
    case "dataSubjectsDesc": return p2.dataSubjectsDesc;
    case "dataCategories": return join(p2.categories.map(c => `[${c.type}] ${c.categories}`));
    case "personalInfo": return cats("PI");
    case "sensitiveInfo": return cats("SPI");
    case "privilegedInfo": return cats("Privileged");
    case "recipients": return join(p2.disclosure.map(d => `${d.kind}: ${d.recipients}`));
    case "picOrPip": return p2.picOrPip;
    case "outsourced": return p2.outsourced;
    case "pipName": return p2.pipName;
    case "pipEmail": return p2.pipEmail;
    case "pipContact": return p2.pipContact;
    case "whenCollected": return join(p2.collection.map(c => c.when));
    case "retention": return join(p2.repositories.map(r => `${r.name || r.location}: ${r.retentionPeriod}`)) || p2.retention;
    case "retentionDataProcessed": return p2.retention;
    case "disposal": return join(p2.repositories.map(r => r.disposal));
    case "securityOrg": return p2.securityOrg;
    case "securityPhysical": return p2.securityPhysical;
    case "securityTechnical": return p2.securityTechnical;
    case "crossBorder": return join(p2.disclosure.map(d => d.crossBorder));
    case "picName": return p2.picName;
    case "dpoName": return p2.dpoName;
    case "dpoEmail": return p2.dpoEmail;
    case "dpoContact": return p2.dpoContact;
    case "publicFacing": return p2.publicFacing;
    case "externalInternal": return p2.externalInternal;
    case "automatedDecisionNotice": return p2.automatedDecisionNotice;
    case "lawfulBasis": return p2.lawfulBasis;
    case "otherBasisInfo": return p2.otherBasisInfo;
    case "consentUsed": return p2.consentUsed;
    case "consentProof": return p2.consentProof;
    case "automatedMethods": return p2.automatedMethods;
    case "automatedDecisions": return p2.automatedDecisions;
    case "consolidatedStatus": return pia.scope === "Consolidated" ? "Consolidated" : "Individual";
    case "consolidatedDate": return new Date(pia.updatedAt).toISOString().split("T")[0];
    case "timestamps": return `Created: ${new Date(pia.createdAt).toLocaleString()}\nUpdated: ${new Date(pia.updatedAt).toLocaleString()}`;
    default: return "";
  }
}

export function resolveValue(pia: Pia, key: string, kind: "ropa" | "npc"): string {
  const overrides = kind === "ropa" ? pia.ropaOverrides : pia.npcOverrides;
  if (overrides && overrides[key] != null) return overrides[key];
  return deriveFieldValue(pia, key);
}

export function toCSV(rows: { label: string; value: string }[]): string {
  const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
  return rows.map(r => `${esc(r.label)},${esc(r.value)}`).join("\n");
}

// Privacy Manual template — seed sections (editable)

export interface ManualSection {
  id: string;
  title: string;
  body: string;
}

export const defaultPrivacyManual: ManualSection[] = [
  { id: "introduction", title: "Introduction", body: "This Privacy Manual sets out the organization's policies and procedures for the protection of personal data, in accordance with the Data Privacy Act of 2012 (RA 10173), its Implementing Rules and Regulations, and the issuances of the National Privacy Commission (NPC)." },
  { id: "scope", title: "Scope and Application", body: "This Manual applies to all personnel, contractors, and third parties involved in the processing of personal data on behalf of the organization." },
  { id: "principles", title: "Data Privacy Principles", body: "The organization adheres to the principles of transparency, legitimate purpose, and proportionality in all processing activities." },
  { id: "rights", title: "Rights of Data Subjects", body: "Data subjects have the right to be informed, to object, to access, to rectification, to erasure or blocking, to damages, and to data portability." },
  { id: "lawful-basis", title: "Lawful Basis for Processing", body: "Processing is based on consent, contract, legal obligation, vital interests, public task, or legitimate interest." },
  { id: "security", title: "Organizational, Physical, and Technical Security Measures", body: "The organization implements appropriate measures including access control, encryption, secure disposal, and regular training." },
  { id: "breach", title: "Breach Management", body: "The organization maintains a Data Breach Response Team and notification procedures consistent with NPC Circular 16-03." },
  { id: "inquiries", title: "Inquiries and Complaints", body: "Inquiries may be addressed to the Data Protection Officer at dpo@organization.example." },
];

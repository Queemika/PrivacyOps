// PIA aggregate schema. Field IDs mirror Excel template anchors so we can
// round-trip cleanly during export.

export type PiaType = "Phase1" | "Full";
export type DpsStatus = "New" | "Existing";
export type PiaScope = "Individual" | "Consolidated";
export type AnonMode = "off" | "standard" | "strict";

export interface ThresholdAnswer { yn: "Yes" | "No" | ""; response: string; }
export interface Stakeholder { id: string; name: string; role: string; involvement: string; inputs: string; locked?: boolean; }

export interface Phase1Desc {
  systemType: string;
  systemFunction: string;
  organizationScope: string;
  keyProcesses: string;
  dataCollection: string[];
  dataCollectionNote: string;
  dataUsage: string;
  dataStorage: string[];
  dataStorageNote: string;
  dataDisposal: string;
  dataDisposalNote: string;
  integration: string[];
  integrationNote: string;
  supportingDocs: string;
  purpose: string;
  piaScope: string;
  outOfScope: string;
}

export interface Phase1 {
  desc: Phase1Desc;
  threshold: Record<string, ThresholdAnswer>;
  stakeholders: Stakeholder[];
}

export interface SignOffBlock { name: string; designation: string; date: string; signature: string; }
export interface Phase4 {
  prepared: SignOffBlock;
  reviewed: SignOffBlock;
  approved: SignOffBlock;
}

export interface DataCategoryRow { id: string; type: "PI" | "SPI" | "Privileged"; categories: string; amount: string; pipPic: string; }
export interface CollectionRow { id: string; when: string; who: string; from: string; }
export interface UseRow { id: string; positionDept: string; scopeModule: string; fileName: string; purpose: string; }
export interface DisclosureRow { id: string; kind: "Internal" | "External"; recipients: string; purpose: string; agreement: string; pic: string; crossBorder: string; }
export interface RepositoryRow { id: string; name: string; mediaType: "Electronic" | "Physical" | "Unspecified"; location: string; hosting?: "In-house" | "Outsourced" | ""; cityCountry: string; retentionPeriod: string; basis: string; disposal: string; }

export interface Phase2 {
  dpsType: "Manual" | "Electronic" | "Both" | "";
  dpsName: string;
  basisPI: string;
  basisSPI: string;
  purposeProcessing: string;
  futurePurpose: string;
  dataSubjectsDesc: string;
  categories: DataCategoryRow[];
  picOrPip: "PIC" | "PIP" | "";
  outsourced: "Yes" | "No" | "";
  pipName: string; pipEmail: string; pipContact: string;
  picName: string;
  dpoName: string; dpoEmail: string; dpoContact: string;
  publicFacing: "Yes" | "No" | "";
  externalInternal: "External" | "Internal" | "Both" | "";
  automatedDecisionNotice: string;
  lawfulBasis: string;
  otherBasisInfo: string;
  consentUsed: "Yes" | "No" | "";
  consentProof: string;
  retention: string;
  automatedMethods: string;
  automatedDecisions: string;
  securityOrg: string;
  securityPhysical: string;
  securityTechnical: string;
  collection: CollectionRow[];
  use: UseRow[];
  disclosure: DisclosureRow[];
  repositories: RepositoryRow[];
}

export type RiskRating = "Low" | "Medium" | "High" | "Critical" | "";

export interface ChecklistAnswer {
  yn: "Yes" | "No" | "N/A" | "";
  response: string;
  threats: string;
  risk: string;
  legalBasis: string;
  impact: number | null;
  probability: number | null;
  rating: RiskRating;
  checks?: Record<string, boolean>; // sub-bullet checkboxes (a, b, c, …)
}

export interface MitigationRow {
  id: string;
  observation: string;
  risk: string;
  inherentRisk: RiskRating;
  treatment: string;
  measure: string;
  status: string;
  residual: RiskRating;
  controlRef: string;
  startDate: string;
  completionDate: string;
  reviewFreq: string;
  owner: string;
}

export interface Phase3 {
  principles: Record<string, ChecklistAnswer>;     // GP-* keys
  rights: Record<string, ChecklistAnswer>;         // DSR-* keys
  organizational: Record<string, ChecklistAnswer>; // OS-*
  physical: Record<string, ChecklistAnswer>;       // PS-*
  technical: Record<string, ChecklistAnswer>;      // TS-*
  crossBorderEnabled: boolean;
  crossBorder: Record<string, ChecklistAnswer>;    // CB-*
  mitigation: MitigationRow[];
}

export interface Pia {
  id: string;
  engagementId: string;
  title: string;
  type: PiaType;
  dpsStatus: DpsStatus;
  scope: PiaScope;
  consolidatedGroupId?: string;
  consolidatedComponents?: string[];
  createdAt: string;
  updatedAt: string;
  phase1: Phase1;
  phase2: Phase2;
  phase3: Phase3;
  phase4: Phase4;
  ropaOverrides?: Record<string, string>;
  npcOverrides?: Record<string, string>;
  drlLinks: { drlItemId: string; fieldRef: string }[];
}

export interface DrlItem {
  id: string;
  kind: "SystemDesignDoc" | "ConsentForm" | "PrivacyNoticeFull" | "PrivacyNoticeJIT" | "PrivacyNoticeCCTV" | "DPOContact" | "Custom";
  title: string;
  fileName?: string;
  status: "Requested" | "Received" | "N/A";
}

export interface TranscriptRecord {
  id: string;
  fileName: string;
  anonMode: AnonMode;
  anonymized: string;
  actions: string[];
  keyPoints: string[];
  dpsMentions: string[];
  createdAt: string;
}

export interface Engagement {
  id: string;
  clientName: string;
  status: "Active" | "On Hold" | "Closed";
  createdAt: string;
  transcripts: TranscriptRecord[];
  drlItems: DrlItem[];
  piaIds: string[];
}

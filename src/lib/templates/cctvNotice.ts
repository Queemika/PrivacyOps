export interface CctvNotice {
  location: string;
  purpose: string;
  retentionDays: number;
  pic: string;
  dpoEmail: string;
  signageInstalled: boolean;
}

export const defaultCctvNotice: CctvNotice = {
  location: "Main Lobby, Parking Area, Server Room",
  purpose: "Security monitoring, incident investigation, and protection of property and personnel.",
  retentionDays: 30,
  pic: "City Government of Marikina",
  dpoEmail: "dpo@marikina.gov.ph",
  signageInstalled: true,
};

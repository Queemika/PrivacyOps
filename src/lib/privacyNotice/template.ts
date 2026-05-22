// Checklist template for Privacy Notice Review (per uploaded screenshot).
export type NoticeType = "Layered" | "Full" | "CCTV" | "JustInTime";

export interface NoticeItem { id: string; description: string; }
export interface NoticeSection { id: string; title: string; intro?: string; items: NoticeItem[]; }

export const SECTIONS: Record<string, NoticeSection> = {
  layered: {
    id: "layered",
    title: "Layered / Short Privacy Notice",
    intro: "At a minimum, the following information must be clearly stated:",
    items: [
      { id: "L-a", description: "(a) a description of the personal data to be processed" },
      { id: "L-b", description: "(b) the purpose, nature, extent, duration, and scope of processing based on consent" },
      { id: "L-c", description: "(c) the identity of the PIC" },
      { id: "L-d", description: "(d) the data subject's rights and how these rights can be exercised" },
    ],
  },
  full: {
    id: "full",
    title: "Full Privacy Notice",
    intro: "The data subject must be informed about how their personal data is collected and processed, including its purpose, scope, risks, safeguards, and their rights. All information must be easy to access and written in clear, plain language. The Privacy Notice must include:",
    items: [
      { id: "F-a", description: "(a) Description of the personal data collected" },
      { id: "F-b", description: "(b) Purpose of processing, including for marketing, profiling, or research" },
      { id: "F-c", description: "(c) Legal basis for processing, if not based on consent" },
      { id: "F-d", description: "(d) Scope and method of processing" },
      { id: "F-e", description: "(e) Recipients or possible recipients of the data" },
      { id: "F-f", description: "(f) Methods for automated access (if applicable), including the logic, purpose, and effects of such processing" },
      { id: "F-g", description: "(g) Identity and contact details of the personal data controller or representative" },
      { id: "F-h", description: "(h) Retention period of the personal data" },
      { id: "F-i", description: "(i) Risks and safeguards" },
      { id: "F-j", description: "(j) Data subject rights, including access, correction, objection, and the right to file a complaint with the NPC" },
    ],
  },
  cctv: {
    id: "cctv",
    title: "CCTV Notice",
    intro: "The requirements above must apply. In addition, PICs must ensure that CCTV notices comply with the following:",
    items: [
      { id: "C-a", description: "(a) Information about the use of CCTV systems must be provided in the most suitable format and written in clear, plain, and concise language." },
      { id: "C-b", description: "(b) CCTV notices must be clearly visible and prominently displayed in appropriate areas, such as entry points or other conspicuous locations." },
      { id: "C-c", description: "(c) The nature, scope, and extent of surveillance, as well as the purpose, system capabilities, and other relevant details, must be disclosed to data subjects in line with their right to be informed under the DPA." },
    ],
  },
  dpo: {
    id: "dpo",
    title: "DPO's Contact Details",
    intro: "The DPO's contact details should include:",
    items: [
      { id: "D-a", description: "a. Title or designation" },
      { id: "D-b", description: "b. Postal address" },
      { id: "D-c", description: "c. Dedicated telephone number" },
      { id: "D-d", description: "d. Dedicated email address" },
    ],
  },
};

export function sectionsFor(type: NoticeType): string[] {
  if (type === "CCTV") return ["layered", "cctv", "dpo"];
  if (type === "Layered") return ["layered", "dpo"];
  if (type === "JustInTime") return ["layered", "dpo"];
  return ["layered", "full", "dpo"];
}

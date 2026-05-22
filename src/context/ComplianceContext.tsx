import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ComplianceMode = "default" | "gdpr" | "ph";

interface Ctx {
  mode: ComplianceMode;
  setMode: (m: ComplianceMode) => void;
  guidanceEnabled: boolean;
  setGuidanceEnabled: (v: boolean) => void;
  insightOpen: boolean;
  setInsightOpen: (v: boolean) => void;
}

const C = createContext<Ctx | null>(null);

export function ComplianceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ComplianceMode>("default");
  const [guidanceEnabled, setGuidanceEnabledState] = useState(true);
  const [insightOpen, setInsightOpen] = useState(true);

  useEffect(() => {
    const m = localStorage.getItem("pa_mode") as ComplianceMode | null;
    if (m) setModeState(m);
    const g = localStorage.getItem("pa_guidance");
    if (g !== null) setGuidanceEnabledState(g === "1");
  }, []);

  const setMode = (m: ComplianceMode) => { setModeState(m); localStorage.setItem("pa_mode", m); };
  const setGuidanceEnabled = (v: boolean) => { setGuidanceEnabledState(v); localStorage.setItem("pa_guidance", v ? "1" : "0"); };

  return <C.Provider value={{ mode, setMode, guidanceEnabled, setGuidanceEnabled, insightOpen, setInsightOpen }}>{children}</C.Provider>;
}

export function useCompliance() {
  const c = useContext(C);
  if (!c) throw new Error("useCompliance must be used within ComplianceProvider");
  return c;
}

export const COMPLIANCE_TIPS: Record<ComplianceMode, { title: string; tips: { label: string; body: string }[] }> = {
  default: {
    title: "General Privacy Guidance",
    tips: [
      { label: "Mode", body: "Select GDPR or Philippines mode in the top bar to receive jurisdiction-specific guidance." },
      { label: "Best practice", body: "Always anonymize data before AI processing and document your lawful basis." },
    ],
  },
  gdpr: {
    title: "GDPR Mode (EU)",
    tips: [
      { label: "Lawful bases (Art. 6)", body: "Consent · Contract · Legal obligation · Vital interests · Public task · Legitimate interests." },
      { label: "Data subject rights", body: "Access, rectification, erasure, restriction, portability, objection, automated-decision safeguards." },
      { label: "DPIA trigger", body: "Required for high-risk processing — large-scale special categories, systematic monitoring, profiling." },
      { label: "Cross-border", body: "Use SCCs or adequacy decisions. Document Transfer Impact Assessments (TIAs)." },
      { label: "Breach", body: "Notify the supervisory authority within 72 hours of becoming aware." },
    ],
  },
  ph: {
    title: "Philippines Mode (DPA / NPC)",
    tips: [
      { label: "Legal bases (Sec. 12/13)", body: "Consent · Contract · Legal obligation · Vital interests · National emergency · Legitimate interests (non-SPI)." },
      { label: "NPC registration", body: "Register your DPS via NPC-RS if processing involves SPI or ≥1,000 individuals." },
      { label: "PIA & Compilation", body: "Conduct PIA per NPC Advisory 2017-03; maintain a Records of Processing Activities." },
      { label: "Industry reminders", body: "LGUs: align with NPC Circular 2023-04. Private: PMP + DPO designation required." },
      { label: "Breach", body: "Notify NPC and affected subjects within 72 hours when sensitive data is involved." },
    ],
  },
};

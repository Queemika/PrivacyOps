// Centralized rules for auto-creating DRL items from PIA inputs.
// Dedupes by (piaId, kindKey) using the DRL row's `fields` map.

import { loadDrl, addRow, DrlRow } from "@/lib/drl/store";
import { toast } from "sonner";

export type AutoDrlKind =
  | "SystemDesignDoc"
  | "PrivacyNoticeFull"
  | "ConsentForm";

const KIND_LABEL: Record<AutoDrlKind, string> = {
  SystemDesignDoc: "System Design / TOR",
  PrivacyNoticeFull: "Privacy Notice (Full)",
  ConsentForm: "Consent Form",
};

const KIND_PHASE: Record<AutoDrlKind, string> = {
  SystemDesignDoc: "Phase 1",
  PrivacyNoticeFull: "Phase 3",
  ConsentForm: "Phase 3",
};

export function findAutoDrl(piaId: string, kind: AutoDrlKind): DrlRow | undefined {
  return loadDrl().find(
    r => r.category === "pia" && r.fields?.piaId === piaId && r.fields?.kindKey === kind,
  );
}

export function ensureAutoDrl(
  piaId: string,
  kind: AutoDrlKind,
  opts: { dpsName?: string; sourceField?: string; silent?: boolean } = {},
): DrlRow {
  const existing = findAutoDrl(piaId, kind);
  if (existing) return existing;
  const row = addRow("pia", {
    fields: {
      piaId,
      kindKey: kind,
      dpsName: opts.dpsName || "",
      phase: KIND_PHASE[kind],
      field: opts.sourceField || KIND_LABEL[kind],
      request: KIND_LABEL[kind],
    },
    remarks: "Auto-generated from PIA trigger",
  });
  if (!opts.silent) {
    toast.success(`DRL item auto-created — ${KIND_LABEL[kind]}`);
  }
  return row;
}

// Phase 3 question -> DRL kind mapping.
const PHASE3_TRIGGERS: Record<string, AutoDrlKind> = {
  "GP-T1": "PrivacyNoticeFull",
  "GP-T2": "PrivacyNoticeFull",
  "DSR-1": "ConsentForm",
  "DSR-2": "ConsentForm",
  "DSR-3": "ConsentForm",
};

export function triggerForChecklistAnswer(
  seedId: string,
  yn: string,
  ctx: { piaId?: string; dpsName?: string; sectionLabel?: string },
) {
  if (!ctx.piaId || yn !== "No") return;
  const kind = PHASE3_TRIGGERS[seedId];
  if (!kind) return;
  ensureAutoDrl(ctx.piaId, kind, {
    dpsName: ctx.dpsName,
    sourceField: `${ctx.sectionLabel || "Phase 3"} / ${seedId}`,
  });
}

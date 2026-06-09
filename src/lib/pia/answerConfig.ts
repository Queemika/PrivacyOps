// Admin-configurable answer options for PIA checklists.
// Stored entirely in localStorage; no backend changes required.

export interface AnswerOption {
  value: string;
  // Optional validation rule applied to the `response` text field
  // when this option is selected. `pattern` is a JS regex source.
  pattern?: string;
  message?: string;
}

export interface AnswerConfig {
  // Default options used when a section has no override.
  default: AnswerOption[];
  // Per-section overrides keyed by the section label passed to ChecklistRow
  // (e.g. "General Data Privacy Principles", "Data Subject Rights").
  sections?: Record<string, AnswerOption[]>;
}

const KEY = "pia:answerOptions:v1";

export const DEFAULT_ANSWER_CONFIG: AnswerConfig = {
  default: [
    { value: "Yes" },
    { value: "No" },
    { value: "N/A" },
  ],
  sections: {},
};

export function loadAnswerConfig(): AnswerConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_ANSWER_CONFIG;
    const parsed = JSON.parse(raw) as AnswerConfig;
    return {
      default: parsed.default?.length ? parsed.default : DEFAULT_ANSWER_CONFIG.default,
      sections: parsed.sections || {},
    };
  } catch {
    return DEFAULT_ANSWER_CONFIG;
  }
}

export function saveAnswerConfig(cfg: AnswerConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export function resetAnswerConfig() {
  localStorage.removeItem(KEY);
}

export function getAnswerOptions(sectionLabel?: string): AnswerOption[] {
  const cfg = loadAnswerConfig();
  if (sectionLabel && cfg.sections?.[sectionLabel]?.length) return cfg.sections[sectionLabel];
  return cfg.default;
}

export function validateResponse(
  selected: string | undefined,
  response: string,
  sectionLabel?: string,
): { ok: boolean; message?: string } {
  if (!selected) return { ok: true };
  const opts = getAnswerOptions(sectionLabel);
  const opt = opts.find(o => o.value === selected);
  if (!opt?.pattern) return { ok: true };
  try {
    const re = new RegExp(opt.pattern);
    if (re.test(response || "")) return { ok: true };
    return { ok: false, message: opt.message || "Response does not match the required format." };
  } catch {
    return { ok: true };
  }
}

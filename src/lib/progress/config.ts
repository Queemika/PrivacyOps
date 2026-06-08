export type ModuleId = "pia" | "pradar" | "tsa" | "inspection" | "manuals";

export interface ProgressConfig {
  weights: Record<ModuleId, number>;
  rules: Record<ModuleId, "fields" | "status" | "hybrid">;
}

const KEY = "pa_progress_config";

export const DEFAULT_CONFIG: ProgressConfig = {
  weights: { pia: 20, pradar: 20, tsa: 20, inspection: 20, manuals: 20 },
  rules:   { pia: "hybrid", pradar: "status", tsa: "status", inspection: "status", manuals: "fields" },
};

export function loadConfig(): ProgressConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    const p = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...p, weights: { ...DEFAULT_CONFIG.weights, ...(p.weights || {}) }, rules: { ...DEFAULT_CONFIG.rules, ...(p.rules || {}) } };
  } catch { return DEFAULT_CONFIG; }
}

export function saveConfig(cfg: ProgressConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export function normalizedWeights(cfg: ProgressConfig): Record<ModuleId, number> {
  const total = Object.values(cfg.weights).reduce((a, b) => a + b, 0) || 1;
  const out = {} as Record<ModuleId, number>;
  (Object.keys(cfg.weights) as ModuleId[]).forEach(k => out[k] = cfg.weights[k] / total);
  return out;
}

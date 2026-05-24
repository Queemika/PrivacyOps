// Theme palette presets. Values are HSL "H S% L%" strings that drop into CSS vars.
export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  accent: string;       // primary brand
  accentSoft: string;   // tinted surface
  sidebar: string;      // sidebar background
  swatches: string[];   // hex preview chips
}

export const THEMES: ThemePalette[] = [
  {
    id: "iris", name: "Iris (default)",
    description: "PrivacyOps signature — trustworthy, authoritative, tech-native.",
    accent: "228 67% 55%", accentSoft: "228 100% 97%", sidebar: "228 62% 11%",
    swatches: ["#EEF2FF", "#9AB5FB", "#3D5FD9", "#0B132E"],
  },
  {
    id: "arctic", name: "Arctic",
    description: "Icy blue-white. Clean, clinical trust. Healthcare and government.",
    accent: "204 71% 59%", accentSoft: "208 100% 97%", sidebar: "222 78% 23%",
    swatches: ["#F0F8FF", "#BAD8F5", "#4BA8E0", "#0D2B6B"],
  },
  {
    id: "obsidian", name: "Obsidian violet",
    description: "Deep purple-slate, violet accents. Premium, luxury, confidential.",
    accent: "258 90% 66%", accentSoft: "258 88% 97%", sidebar: "263 71% 14%",
    swatches: ["#F3EFFE", "#C4B0F6", "#8B5CF6", "#1E0A3C"],
  },
  {
    id: "sage", name: "Sage",
    description: "Muted green. Calm, grounded. Non-profits and LGUs.",
    accent: "124 32% 45%", accentSoft: "120 21% 95%", sidebar: "127 41% 12%",
    swatches: ["#EEF5EE", "#A8CEAA", "#4D9652", "#122914"],
  },
  {
    id: "copper", name: "Copper",
    description: "Warm amber-brown. Human, approachable. Education and consultancy.",
    accent: "25 70% 51%", accentSoft: "22 100% 96%", sidebar: "22 100% 11%",
    swatches: ["#FFF3EB", "#F5C59A", "#D97A2B", "#3A1600"],
  },
  {
    id: "carbon", name: "Carbon",
    description: "True neutral slate. Maximum readability for data-heavy views.",
    accent: "215 25% 27%", accentSoft: "210 40% 98%", sidebar: "222 47% 11%",
    swatches: ["#F8FAFC", "#CBD5E1", "#334155", "#0F172A"],
  },
  {
    id: "rose", name: "Rose quartz",
    description: "Dusty rose, deep plum. Modern, empowering. Women-focused or HR apps.",
    accent: "333 71% 58%", accentSoft: "340 80% 97%", sidebar: "331 84% 13%",
    swatches: ["#FEF2F6", "#F5A8C8", "#E0478A", "#3D0520"],
  },
];

const STORAGE_KEY = "pa_theme_palette";

export function getActiveThemeId(): string {
  return localStorage.getItem(STORAGE_KEY) || "iris";
}

export function applyTheme(id: string) {
  const t = THEMES.find(x => x.id === id) || THEMES[0];
  const r = document.documentElement;
  r.style.setProperty("--accent", t.accent);
  r.style.setProperty("--ring", t.accent);
  r.style.setProperty("--info", t.accent);
  r.style.setProperty("--accent-soft", t.accentSoft);
  r.style.setProperty("--sidebar-background", t.sidebar);
  r.style.setProperty(
    "--gradient-accent",
    `linear-gradient(135deg, hsl(${t.accent}), hsl(${t.accent} / 0.85))`,
  );
  localStorage.setItem(STORAGE_KEY, t.id);
  window.dispatchEvent(new CustomEvent("pa:theme-change", { detail: t.id }));
}

export function bootstrapTheme() {
  applyTheme(getActiveThemeId());
}

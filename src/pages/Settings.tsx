import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Moon, Sun, ShieldAlert, Settings as SettingsIcon, Trash2, Users, Lock as LockIcon, MessageSquare, Palette, Check } from "lucide-react";
import { toast } from "sonner";
import { loadTooltipOverrides, saveTooltipOverrides, defaultTooltips } from "@/lib/tooltipStore";
import { THEMES, applyTheme as applyPalette, getActiveThemeId } from "@/lib/theme/themes";
import { loadAnswerConfig, saveAnswerConfig, resetAnswerConfig, AnswerOption } from "@/lib/pia/answerConfig";

const ROLES = ["Intern", "Preparer/Associate", "Lead/Supervisor", "Approver/Manager"];
const TABLES = [
  { id: "pradar", label: "PRADAR (5-in-1) — Working File" },
  { id: "drl", label: "DRL / IRL columns" },
  { id: "inspection", label: "Physical Inspection — Checklist" },
  { id: "notice", label: "Privacy Notice — Assessment" },
  { id: "tsa", label: "Tech Security — Tech Stack" },
  { id: "ropa", label: "Compilation / NPC-RS — Columns" },
];

type RoleUx = Record<string, { landing: string; density: string }>;
type TableLocks = Record<string, boolean>;

function loadRoleUx(): RoleUx {
  try { return JSON.parse(localStorage.getItem("pa_role_ux") || "{}"); } catch { return {}; }
}
function loadLocks(): TableLocks {
  try { return JSON.parse(localStorage.getItem("pa_table_locks") || "{}"); } catch { return {}; }
}

export default function Settings() {
  const [tab, setTab] = useState("general");
  const [theme, setTheme] = useState<"light" | "dark">(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [role, setRole] = useState<string>(localStorage.getItem("pa_role") || "user");
  const [roleUx, setRoleUx] = useState<RoleUx>(loadRoleUx());
  const [locks, setLocks] = useState<TableLocks>(loadLocks());
  const [tooltipOverrides, setTooltipOverrides] = useState<Record<string, string>>(loadTooltipOverrides());
  const [tooltipsEnabled, setTooltipsEnabled] = useState(localStorage.getItem("pa_tooltips_enabled") !== "false");
  const [themeId, setThemeId] = useState<string>(getActiveThemeId());
  const [answerCfg, setAnswerCfg] = useState(loadAnswerConfig());
  const pickTheme = (id: string) => { applyPalette(id); setThemeId(id); toast.success(`Theme: ${THEMES.find(t=>t.id===id)?.name}`); };

  const applyTheme = (t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("pa_theme", t);
  };
  const saveRole = (r: string) => { setRole(r); localStorage.setItem("pa_role", r); toast.success(`Role set to ${r}`); };
  const updateRoleUx = (r: string, patch: Partial<{ landing: string; density: string }>) => {
    const next = { ...roleUx, [r]: { landing: "/", density: "comfortable", ...(roleUx[r] || {}), ...patch } };
    setRoleUx(next); localStorage.setItem("pa_role_ux", JSON.stringify(next));
  };
  const toggleLock = (id: string) => {
    const next = { ...locks, [id]: !locks[id] };
    setLocks(next); localStorage.setItem("pa_table_locks", JSON.stringify(next));
  };
  const updateOverride = (k: string, v: string) => {
    const next = { ...tooltipOverrides, [k]: v };
    setTooltipOverrides(next); saveTooltipOverrides(next);
  };
  const removeOverride = (k: string) => {
    const next = { ...tooltipOverrides }; delete next[k];
    setTooltipOverrides(next); saveTooltipOverrides(next);
  };
  const toggleTooltips = (c: boolean) => { setTooltipsEnabled(c); localStorage.setItem("pa_tooltips_enabled", String(c)); };

  const isAdmin = role === "admin";

  return (
    <PageShell title="Settings" subtitle="Personal preferences, role-based UX, tables, and tooltip configuration.">
      <SectionTabs
        tabs={[
          { id: "general", label: "General" },
          ...(isAdmin ? [
            { id: "roles", label: "Roles" },
            { id: "tooltips", label: "Tooltips" },
            { id: "tables", label: "Tables & Fields" },
            { id: "pia-answers", label: "PIA Answers" },
            { id: "admin", label: "Admin Tools" },
          ] : []),
        ]}
        value={tab} onChange={setTab}
      />

      {tab === "general" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card><CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><SettingsIcon className="h-4 w-4" /> Appearance</div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Dark theme</Label>
                <Switch checked={theme === "dark"} onCheckedChange={(c) => applyTheme(c ? "dark" : "light")} />
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                {theme} mode active
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="h-4 w-4" /> Role</div>
              <Select value={role} onValueChange={saveRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Admin unlocks the audit log, tooltip and tables configuration.</p>
            </CardContent></Card>
          </div>

          <Card><CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Palette className="h-4 w-4" /> Color theme</div>
            <p className="text-xs text-muted-foreground">Switch the accent and sidebar palette. Changes apply instantly across the app.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {THEMES.map(t => {
                const active = t.id === themeId;
                return (
                  <button key={t.id} type="button" onClick={() => pickTheme(t.id)}
                    className={`text-left rounded-lg border p-3 transition hover:shadow-sm ${active ? "border-accent ring-2 ring-accent/30" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t.name}</span>
                      {active && <Check className="h-4 w-4 text-accent" />}
                    </div>
                    <div className="flex h-6 rounded overflow-hidden border">
                      {t.swatches.map((c) => (
                        <div key={c} className="flex-1" style={{ background: c }} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-snug">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent></Card>
        </div>
      )}

      {tab === "roles" && isAdmin && (
        <Card><CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4" /> Role-based UX</div>
          <p className="text-xs text-muted-foreground">Choose the default landing screen and density for each role.</p>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr><th className="text-left py-2">Role</th><th className="text-left py-2">Landing</th><th className="text-left py-2">Density</th></tr>
            </thead>
            <tbody>
              {ROLES.map(r => {
                const cur = roleUx[r] || { landing: "/", density: "comfortable" };
                return (
                  <tr key={r} className="border-b">
                    <td className="py-2 font-medium">{r}</td>
                    <td className="py-2">
                      <Select value={cur.landing} onValueChange={(v) => updateRoleUx(r, { landing: v })}>
                        <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/">Dashboard</SelectItem>
                          <SelectItem value="/library">PIA Library</SelectItem>
                          <SelectItem value="/pradar">PRADAR (5-in-1)</SelectItem>
                          <SelectItem value="/drl">DRL / IRL</SelectItem>
                          <SelectItem value="/analytics">Analytics</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      <Select value={cur.density} onValueChange={(v) => updateRoleUx(r, { density: v })}>
                        <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {tab === "tooltips" && isAdmin && (
        <Card><CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="h-4 w-4" /> Tooltips</div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Globally enabled</Label>
              <Switch checked={tooltipsEnabled} onCheckedChange={toggleTooltips} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Override default tooltip text. Empty = use built-in.</p>
          <div className="space-y-1.5 max-h-96 overflow-auto">
            {Object.keys(defaultTooltips).map((k) => (
              <div key={k} className="flex gap-2 items-center">
                <span className="text-[11px] font-mono w-44 truncate text-muted-foreground">{k}</span>
                <Input className="h-8 text-xs flex-1" placeholder={defaultTooltips[k]}
                  value={tooltipOverrides[k] ?? ""} onChange={(e) => updateOverride(k, e.target.value)} />
                {tooltipOverrides[k] !== undefined && (
                  <Button size="sm" variant="ghost" onClick={() => removeOverride(k)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                )}
              </div>
            ))}
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/admin/tooltips">Open full tooltip configurator →</Link></Button>
        </CardContent></Card>
      )}

      {tab === "tables" && isAdmin && (
        <Card><CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><LockIcon className="h-4 w-4" /> Tables & Fields</div>
          <p className="text-xs text-muted-foreground">Lock a table to prevent editing in the workspace. Locked tables become read-only.</p>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr><th className="text-left py-2">Table</th><th className="text-right py-2 w-24">Locked</th></tr>
            </thead>
            <tbody>
              {TABLES.map(t => (
                <tr key={t.id} className="border-b">
                  <td className="py-2">{t.label}</td>
                  <td className="py-2 text-right"><Checkbox checked={!!locks[t.id]} onCheckedChange={() => toggleLock(t.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {tab === "admin" && isAdmin && (
        <Card><CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Trash2 className="h-4 w-4 text-destructive" /> Admin tools</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button asChild variant="outline"><Link to="/admin/view-as">View As — Role visibility</Link></Button>
            <Button asChild variant="outline"><Link to="/admin/tooltips">Tooltip Manager</Link></Button>
            <Button asChild variant="outline"><Link to="/admin/reset">Reset data</Link></Button>
            <Button asChild variant="outline"><Link to="/audit">Audit log</Link></Button>
          </div>
        </CardContent></Card>
      )}
    </PageShell>
  );
}

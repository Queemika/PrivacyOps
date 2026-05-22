import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Moon, Sun, ShieldAlert, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [theme, setTheme] = useState<"light" | "dark">(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [role, setRole] = useState<string>(localStorage.getItem("pa_role") || "user");

  const applyTheme = (t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("pa_theme", t);
  };

  const saveRole = (r: string) => {
    setRole(r);
    localStorage.setItem("pa_role", r);
    toast.success(`Role set to ${r}`);
  };

  return (
    <PageShell title="Settings" subtitle="Theme, role and admin controls">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><SettingsIcon className="h-4 w-4" /> Appearance</div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Dark theme</Label>
              <Switch checked={theme === "dark"} onCheckedChange={(c) => applyTheme(c ? "dark" : "light")} />
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {theme} mode active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="h-4 w-4" /> Role</div>
            <Select value={role} onValueChange={saveRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Admin role unlocks tooltip configuration and data-reset tools.</p>
          </CardContent>
        </Card>
      </div>

      {role === "admin" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Trash2 className="h-4 w-4 text-destructive" /> Admin tools</div>
            <div className="grid md:grid-cols-2 gap-3">
              <Button asChild variant="outline"><Link to="/admin/tooltips">Configure tooltips</Link></Button>
              <Button asChild variant="outline"><Link to="/admin/reset">Reset data</Link></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}

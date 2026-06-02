import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ROLES,
  MODULES,
  loadVisibility,
  saveVisibility,
  getViewAsRole,
  setViewAsRole,
  type Role,
} from "@/lib/admin/roleVisibility";
import { Eye, EyeOff, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useMyRoles } from "@/lib/roles/store";

export default function ViewAsSettings() {
  const { isAdmin, ready } = useMyRoles();
  const [selectedRole, setSelectedRole] = useState<Role>("Intern");
  const [visibility, setVisibility] = useState(loadVisibility());
  const [viewAs, setViewAs] = useState<Role | null>(getViewAsRole());

  useEffect(() => {
    setVisibility(loadVisibility());
    setViewAs(getViewAsRole());
  }, []);

  if (!ready) return null;

  if (!isAdmin) {
    return (
      <PageShell title="View As — Role Visibility">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Admin role required.</CardContent>
        </Card>
      </PageShell>
    );
  }

  const toggle = (path: string) => {
    const next = {
      ...visibility,
      [selectedRole]: { ...visibility[selectedRole], [path]: !visibility[selectedRole]?.[path] },
    };
    setVisibility(next);
  };

  const save = () => {
    saveVisibility(visibility);
    toast.success(`Saved visibility for ${selectedRole}`);
  };

  const preview = () => {
    setViewAsRole(selectedRole);
    setViewAs(selectedRole);
    toast.success(`Now previewing as ${selectedRole}. Sidebar reflects their visible modules.`);
  };
  const clearPreview = () => {
    setViewAsRole(null);
    setViewAs(null);
    toast.success("Preview cleared — viewing as Admin");
  };

  const visibleCount = MODULES.filter((m) => visibility[selectedRole]?.[m.path] !== false).length;

  return (
    <PageShell
      title="View As — Role Visibility"
      subtitle="Control which modules each role can see. Preview the experience without switching accounts."
      actions={
        <>
          {viewAs && (
            <Button variant="outline" onClick={clearPreview}>
              <EyeOff className="h-4 w-4 mr-1.5" />
              Stop previewing ({viewAs})
            </Button>
          )}
          <Button variant="outline" onClick={preview}>
            <Eye className="h-4 w-4 mr-1.5" />
            Preview as {selectedRole}
          </Button>
          <Button onClick={save}>
            <Save className="h-4 w-4 mr-1.5" />
            Save
          </Button>
        </>
      }
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium">Configure role:</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {visibleCount} of {MODULES.length} modules visible
            </span>
          </div>

          <div className="border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Module</th>
                  <th className="text-left px-3 py-2">Path</th>
                  <th className="text-right px-3 py-2 w-32">Visible</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => {
                  const v = visibility[selectedRole]?.[m.path] !== false;
                  return (
                    <tr key={m.path} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium">{m.title}</td>
                      <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{m.path}</td>
                      <td className="px-3 py-2 text-right">
                        <Checkbox checked={v} onCheckedChange={() => toggle(m.path)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3" />
            Admin always sees everything. Preview lets you walk through the app exactly as the chosen role.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}

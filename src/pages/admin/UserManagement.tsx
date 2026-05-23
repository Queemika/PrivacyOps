import { useEffect, useState } from "react";
import { listProfiles, listEngagements, getUserRoles, setUserRole, type AppRole, type ProfileLite } from "@/lib/roles/store";
import { useMyRoles } from "@/lib/roles/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ShieldCheck, Users, Briefcase, Plus, Trash2, UserPlus } from "lucide-react";

const ROLES: AppRole[] = ["Intern", "Preparer", "Lead", "Approver", "Admin"];
const MODULES = ["pia", "pradar", "tsa", "inspection", "notice", "drl", "transcript"];

export default function UserManagement() {
  const { isAdmin, ready } = useMyRoles();
  const [people, setPeople] = useState<ProfileLite[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, AppRole[]>>({});
  type Engagement = { id: string; name: string; client_name: string | null; status: string };
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [newEng, setNewEng] = useState({ name: "", client_name: "" });

  const loadAll = async () => {
    const p = await listProfiles();
    setPeople(p);
    const map: Record<string, AppRole[]> = {};
    for (const u of p) map[u.user_id] = await getUserRoles(u.user_id);
    setRolesByUser(map);
    setEngagements((await listEngagements()) as Engagement[]);
  };
  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  if (!ready) return null;
  if (!isAdmin) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        <ShieldCheck className="h-5 w-5 inline mr-2" />
        Admin access required. Ask an admin to grant you the Admin role.
      </div>
    );
  }

  const toggle = async (user_id: string, role: AppRole) => {
    const has = (rolesByUser[user_id] || []).includes(role);
    const res = await setUserRole(user_id, role, !has);
    if (res.error) { toast.error(res.error.message); return; }
    setRolesByUser(prev => ({
      ...prev,
      [user_id]: has ? prev[user_id].filter(r => r !== role) : [...(prev[user_id] || []), role],
    }));
  };

  const createEngagement = async () => {
    if (!newEng.name.trim()) return;
    const { error } = await supabase.from("engagements").insert({ name: newEng.name, client_name: newEng.client_name || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Engagement created");
    setNewEng({ name: "", client_name: "" });
    loadAll();
  };

  const assignToEngagement = async (engagement_id: string) => {
    const email = prompt("User email to add to this engagement:");
    if (!email) return;
    const p = people.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!p) { toast.error("User not found"); return; }
    const role = (prompt("Role on engagement (Intern/Preparer/Lead/Approver/Admin):", "Preparer") || "Preparer") as AppRole;
    const { error } = await supabase.from("engagement_members").insert({
      engagement_id, user_id: p.user_id, role_on_engagement: role,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`${p.email} added`);
  };

  const assignModule = async (engagement_id: string) => {
    const email = prompt("Assign to (user email):"); if (!email) return;
    const p = people.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!p) { toast.error("User not found"); return; }
    const module = prompt(`Module (${MODULES.join("/")}):`, "pia"); if (!module) return;
    const record_id = prompt("Record / workable ID (optional):") || null;
    const notes = prompt("Notes (optional):") || null;
    const { error } = await supabase.from("module_assignments").insert({
      engagement_id, module, record_id, assignee_id: p.user_id, notes,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Assigned");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-accent" />
        <h1 className="text-2xl font-semibold">User Management</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Assign roles to signed-up users, create engagements, and assign workables.
      </p>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1.5" />Users & Roles</TabsTrigger>
          <TabsTrigger value="engagements"><Briefcase className="h-3.5 w-3.5 mr-1.5" />Engagements & Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle className="text-sm">Signed-up users ({people.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40 border-b">
                  <tr>
                    <th className="p-2 text-left">User</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map(p => (
                    <tr key={p.user_id} className="border-b">
                      <td className="p-2">{`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "—"}</td>
                      <td className="p-2 text-muted-foreground">{p.email}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {ROLES.map(r => {
                            const has = (rolesByUser[p.user_id] || []).includes(r);
                            return (
                              <Badge
                                key={r}
                                variant={has ? "default" : "outline"}
                                className="cursor-pointer text-[10px]"
                                onClick={() => toggle(p.user_id, r)}
                              >
                                {r}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {people.length === 0 && (
                    <tr><td colSpan={3} className="p-6 text-center text-xs text-muted-foreground">No users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagements">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">New engagement</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Input placeholder="Engagement name" value={newEng.name} onChange={e => setNewEng(s => ({ ...s, name: e.target.value }))} />
                <Input placeholder="Client name (optional)" value={newEng.client_name} onChange={e => setNewEng(s => ({ ...s, client_name: e.target.value }))} />
                <Button onClick={createEngagement}><Plus className="h-3.5 w-3.5 mr-1" />Create</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Engagements ({engagements.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40 border-b">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Client</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagements.map(e => (
                      <tr key={e.id} className="border-b">
                        <td className="p-2 font-medium">{e.name}</td>
                        <td className="p-2 text-muted-foreground">{e.client_name || "—"}</td>
                        <td className="p-2"><Badge variant="outline" className="text-[10px]">{e.status}</Badge></td>
                        <td className="p-2 text-right">
                          <Button size="sm" variant="outline" className="h-7 text-xs mr-1" onClick={() => assignToEngagement(e.id)}>
                            <UserPlus className="h-3 w-3 mr-1" />Add member
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => assignModule(e.id)}>
                            <Plus className="h-3 w-3 mr-1" />Assign workable
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {engagements.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-xs text-muted-foreground">No engagements yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

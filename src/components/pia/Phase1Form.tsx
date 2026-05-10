import { Phase1 } from "@/lib/pia/schema";
import { THRESHOLD_QUESTIONS } from "@/lib/pia/templates";
import { isPiaRequired } from "@/lib/pia/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export function Phase1Form({ value, onChange }: { value: Phase1; onChange: (next: Phase1) => void }) {
  const set = <K extends keyof Phase1>(k: K, v: Phase1[K]) => onChange({ ...value, [k]: v });
  const setDesc = (patch: Partial<Phase1["desc"]>) => onChange({ ...value, desc: { ...value.desc, ...patch } });
  const required = isPiaRequired(value);

  return (
    <div className="space-y-6">
      {/* Project-System Description */}
      <SectionCard title="Project-System Description">
        <p className="text-sm leading-relaxed">
          The system is a <Inline value={value.desc.systemIs} onChange={(v) => setDesc({ systemIs: v })} />{" "}
          designed to manage <Inline value={value.desc.designedToManage} onChange={(v) => setDesc({ designedToManage: v })} />{" "}
          of personal data within <Inline value={value.desc.ofPersonalDataWithin} onChange={(v) => setDesc({ ofPersonalDataWithin: v })} />.
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="font-medium">Key Processes include:</div>
          <KVRow label="Data Collection" prefix="Gathering data through" value={value.desc.dataCollection} onChange={(v) => setDesc({ dataCollection: v })} />
          <KVRow label="Data Usage" prefix="Using data for" value={value.desc.dataUsage} onChange={(v) => setDesc({ dataUsage: v })} />
          <KVRow label="Data Storage" prefix="Secure storage in" value={value.desc.dataStorage} onChange={(v) => setDesc({ dataStorage: v })} />
          <KVRow label="Data Disposal" prefix="Secure disposal in line with" value={value.desc.dataDisposal} onChange={(v) => setDesc({ dataDisposal: v })} />
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="italic text-muted-foreground">If applicable:</div>
          <KVRow label="Integrations" prefix="The system integrates with existing programs such as" value={value.desc.integratesWith} onChange={(v) => setDesc({ integratesWith: v })} />
          <KVRow label="Supporting Documents" prefix="Supported by documents like" value={value.desc.supportingDocs} onChange={(v) => setDesc({ supportingDocs: v })} />
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="font-medium">Purpose</div>
          <KVRow label="" prefix="The system aims to" value={value.desc.purpose} onChange={(v) => setDesc({ purpose: v })} />
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="font-medium">Scope of the PIA</div>
          <p className="leading-relaxed">
            This PIA reviews privacy risks in the <Inline value={value.desc.scopeArea} onChange={(v) => setDesc({ scopeArea: v })} />{" "}
            related to the <Inline value={value.desc.relatedTo} onChange={(v) => setDesc({ relatedTo: v })} />{" "}
            <input
              type="number"
              value={value.desc.estimatedRecords}
              onChange={(e) => setDesc({ estimatedRecords: Number(e.target.value) || 0 })}
              className="w-20 mx-1 px-2 py-1 border rounded bg-background text-sm tabular-nums"
            />{" "}
            of personal data. It examines the data types, legal basis, security,{" "}
            <Inline value={value.desc.examines} onChange={(v) => setDesc({ examines: v })} />.
          </p>
          <p className="text-xs italic text-muted-foreground">
            This PIA does not cover non-data protection issues or activities that do not involve personal data.
          </p>
        </div>
      </SectionCard>

      {/* Threshold Analysis */}
      <SectionCard title="Threshold Analysis">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 w-10 text-left">No.</th>
              <th className="px-3 py-2 text-left">Question</th>
              <th className="px-3 py-2 w-32 text-left">Yes/No</th>
              <th className="px-3 py-2 w-1/3 text-left">Response</th>
            </tr>
          </thead>
          <tbody>
            {THRESHOLD_QUESTIONS.map((q, i) => {
              const a = value.threshold[q.id];
              return (
                <tr key={q.id} className="border-b last:border-0">
                  <td className="px-3 py-2 align-top text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2 align-top">{q.q}</td>
                  <td className="px-3 py-2 align-top">
                    <Select
                      value={a?.yn || ""}
                      onValueChange={(v) => set("threshold", { ...value.threshold, [q.id]: { ...a, yn: v as "Yes" | "No" | "N/A" } })}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Textarea
                      value={a?.response || ""}
                      onChange={(e) => set("threshold", { ...value.threshold, [q.id]: { ...a, response: e.target.value } })}
                      className="min-h-[40px] text-xs"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 px-3 py-2 rounded-md border bg-muted/30 text-sm flex items-center justify-between">
          <span className="font-medium">IS PIA REQUIRED?</span>
          <span className={
            "status-chip " + (
              required === "Yes" ? "bg-destructive/10 text-destructive border-destructive/30"
              : required === "No" ? "bg-success/10 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border"
            )
          }>
            {required === "Yes" ? "PIA Required" : required === "No" ? "PIA Not Required - Proceed to Sign-Off" : "Pending answers"}
          </span>
        </div>
      </SectionCard>

      {/* Stakeholders */}
      <SectionCard title="Stakeholder(s) Engagement">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Name / Position</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Involvement</th>
              <th className="px-3 py-2 text-left">Inputs / Recommendations</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {value.stakeholders.map((s, i) => (
              <tr key={s.id} className="border-b last:border-0">
                {(["name", "role", "involvement", "inputs"] as const).map((field) => (
                  <td key={field} className="px-2 py-1.5">
                    <Input
                      value={s[field]}
                      onChange={(e) => {
                        const next = [...value.stakeholders];
                        next[i] = { ...s, [field]: e.target.value };
                        set("stakeholders", next);
                      }}
                      className="h-8 text-xs"
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => set("stakeholders", value.stakeholders.filter(x => x.id !== s.id))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          size="sm" variant="outline" className="mt-3"
          onClick={() => set("stakeholders", [...value.stakeholders, { id: `S-${Date.now()}`, name: "", role: "", involvement: "", inputs: "" }])}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add stakeholder
        </Button>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-2.5 border-b bg-accent/5">
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function Inline({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="inline-block min-w-32 mx-1 px-2 py-0.5 border-b border-dashed border-muted-foreground/40 bg-transparent focus:border-accent focus:outline-none text-sm"
    />
  );
}

function KVRow({ label, prefix, value, onChange }:
  { label: string; prefix: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      {label && <div className="col-span-2 font-medium text-xs">{label}</div>}
      <div className={label ? "col-span-10" : "col-span-12"}>
        <span className="text-muted-foreground">{prefix}</span>
        <Inline value={value} onChange={onChange} />
      </div>
    </div>
  );
}

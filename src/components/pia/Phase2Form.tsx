import { Phase2 } from "@/lib/pia/schema";
import { LAWFUL_BASIS_PI, LAWFUL_BASIS_SPI, MEDIA_TYPES } from "@/lib/pia/templates";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export function Phase2Form({ value, onChange }: { value: Phase2; onChange: (next: Phase2) => void }) {
  const set = <K extends keyof Phase2>(k: K, v: Phase2[K]) => onChange({ ...value, [k]: v });
  const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div className="space-y-6">
      <Section title="Data Processing System Details">
        <Grid>
          <Field label="Is DPS Manual, Electronic, or Both?">
            <Picker value={value.dpsType} onChange={(v) => set("dpsType", v as Phase2["dpsType"])} options={["Manual", "Electronic", "Both"]} />
          </Field>
          <Field label="Data Processing System Name">
            <Input value={value.dpsName} onChange={(e) => set("dpsName", e.target.value)} className="h-9" />
          </Field>
          <Field label="Basis for Processing Personal Information">
            <Picker value={value.basisPI} onChange={(v) => set("basisPI", v)} options={LAWFUL_BASIS_PI} />
          </Field>
          <Field label="Basis for Processing Sensitive PI (if applicable)">
            <Picker value={value.basisSPI} onChange={(v) => set("basisSPI", v)} options={LAWFUL_BASIS_SPI} />
          </Field>
          <Field label="Purpose of Processing">
            <Textarea value={value.purposeProcessing} onChange={(e) => set("purposeProcessing", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
          <Field label="Intended Future Purpose (if any)">
            <Textarea value={value.futurePurpose} onChange={(e) => set("futurePurpose", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
          <Field label="Description of category(ies) of data subject" full>
            <Textarea value={value.dataSubjectsDesc} onChange={(e) => set("dataSubjectsDesc", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
        </Grid>
      </Section>

      <Section title="Personal Data Categories">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Categories</th>
              <th className="px-3 py-2 text-left">Amount (estimate)</th>
              <th className="px-3 py-2 text-left">PIP / PIC</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {value.categories.map((row, i) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-2 py-1.5">
                  <Picker value={row.type} onChange={(v) => {
                    const next = [...value.categories]; next[i] = { ...row, type: v as "PI" | "SPI" | "Privileged" };
                    set("categories", next);
                  }} options={["PI", "SPI", "Privileged"]} />
                </td>
                <td className="px-2 py-1.5">
                  <Input value={row.categories} onChange={(e) => {
                    const next = [...value.categories]; next[i] = { ...row, categories: e.target.value }; set("categories", next);
                  }} className="h-8 text-xs" />
                </td>
                <td className="px-2 py-1.5">
                  <Input value={row.amount} onChange={(e) => {
                    const next = [...value.categories]; next[i] = { ...row, amount: e.target.value }; set("categories", next);
                  }} className="h-8 text-xs" />
                </td>
                <td className="px-2 py-1.5">
                  <Input value={row.pipPic} onChange={(e) => {
                    const next = [...value.categories]; next[i] = { ...row, pipPic: e.target.value }; set("categories", next);
                  }} className="h-8 text-xs" />
                </td>
                <td className="px-2 py-1.5">
                  <Button size="icon" variant="ghost" onClick={() => set("categories", value.categories.filter(x => x.id !== row.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button size="sm" variant="outline" className="mt-3" onClick={() =>
          set("categories", [...value.categories, { id: uid("CAT"), type: "PI", categories: "", amount: "", pipPic: "" }])
        }><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
      </Section>

      <Section title="Roles & Contacts">
        <Grid>
          <Field label="Is processing done as PIC or PIP?">
            <Picker value={value.picOrPip} onChange={(v) => set("picOrPip", v as "PIC" | "PIP")} options={["PIC", "PIP"]} />
          </Field>
          <Field label="Is the system outsourced or subcontracted?">
            <Picker value={value.outsourced} onChange={(v) => set("outsourced", v as "Yes" | "No")} options={["Yes", "No"]} />
          </Field>
          <Field label="Name of PIP"><Input value={value.pipName} onChange={(e) => set("pipName", e.target.value)} className="h-9" /></Field>
          <Field label="PIP Email"><Input value={value.pipEmail} onChange={(e) => set("pipEmail", e.target.value)} className="h-9" /></Field>
          <Field label="PIP Contact No."><Input value={value.pipContact} onChange={(e) => set("pipContact", e.target.value)} className="h-9" /></Field>
          <Field label="Name of PIC"><Input value={value.picName} onChange={(e) => set("picName", e.target.value)} className="h-9" /></Field>
          <Field label="Name of DPO"><Input value={value.dpoName} onChange={(e) => set("dpoName", e.target.value)} className="h-9" /></Field>
          <Field label="DPO Email"><Input value={value.dpoEmail} onChange={(e) => set("dpoEmail", e.target.value)} className="h-9" /></Field>
          <Field label="DPO Contact No."><Input value={value.dpoContact} onChange={(e) => set("dpoContact", e.target.value)} className="h-9" /></Field>
          <Field label="Publicly facing online/mobile/web app?">
            <Picker value={value.publicFacing} onChange={(v) => set("publicFacing", v as "Yes" | "No")} options={["Yes", "No"]} />
          </Field>
          <Field label="External and/or Internal facing?">
            <Picker value={value.externalInternal} onChange={(v) => set("externalInternal", v as Phase2["externalInternal"])} options={["External", "Internal", "Both"]} />
          </Field>
          <Field label="Notice on automated decision-making / profiling?">
            <Input value={value.automatedDecisionNotice} onChange={(e) => set("automatedDecisionNotice", e.target.value)} className="h-9" />
          </Field>
        </Grid>
      </Section>

      <Section title="Lawful Basis & Consent">
        <Grid>
          <Field label="Lawful basis of processing personal data" full>
            <Picker value={value.lawfulBasis} onChange={(v) => set("lawfulBasis", v)} options={LAWFUL_BASIS_PI} />
          </Field>
          <Field label="Other relevant info on lawful basis" full>
            <Textarea value={value.otherBasisInfo} onChange={(e) => set("otherBasisInfo", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
          <Field label="Is consent used as the basis for processing?">
            <Picker value={value.consentUsed} onChange={(v) => set("consentUsed", v as "Yes" | "No")} options={["Yes", "No"]} />
          </Field>
          <Field label="Consent form / proof of consent">
            <Input value={value.consentProof} onChange={(e) => set("consentProof", e.target.value)} className="h-9" />
          </Field>
          <Field label="Retention period for the data processed">
            <Input value={value.retention} onChange={(e) => set("retention", e.target.value)} className="h-9" />
          </Field>
          <Field label="Methods and logic for automated processing">
            <Input value={value.automatedMethods} onChange={(e) => set("automatedMethods", e.target.value)} className="h-9" />
          </Field>
          <Field label="Possible decisions affecting rights/freedoms" full>
            <Textarea value={value.automatedDecisions} onChange={(e) => set("automatedDecisions", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
        </Grid>
      </Section>

      <Section title="Description of Security Measures">
        <Grid>
          <Field label="Organizational" full>
            <Textarea value={value.securityOrg} onChange={(e) => set("securityOrg", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
          <Field label="Physical" full>
            <Textarea value={value.securityPhysical} onChange={(e) => set("securityPhysical", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
          <Field label="Technical" full>
            <Textarea value={value.securityTechnical} onChange={(e) => set("securityTechnical", e.target.value)} className="min-h-[60px] text-sm" />
          </Field>
        </Grid>
      </Section>

      <Section title="Data Lifecycle — Collection">
        <DynamicTable
          rows={value.collection}
          headers={["When collected", "Who collects", "From whom"]}
          fields={["when", "who", "from"]}
          onChange={(rows) => set("collection", rows)}
          newRow={() => ({ id: uid("COL"), when: "", who: "", from: "" })}
        />
      </Section>

      <Section title="Data Lifecycle — Use">
        <DynamicTable
          rows={value.use}
          headers={["Position & Department", "Scope/Module", "File Name", "Purpose"]}
          fields={["positionDept", "scopeModule", "fileName", "purpose"]}
          onChange={(rows) => set("use", rows)}
          newRow={() => ({ id: uid("USE"), positionDept: "", scopeModule: "", fileName: "", purpose: "" })}
        />
      </Section>

      <Section title="Data Lifecycle — Disclosure">
        <DynamicTable
          rows={value.disclosure}
          headers={["Internal/External", "Recipients", "Sharing Purpose", "Data Sharing Agreement?", "Name of PIC", "Cross-border?"]}
          fields={["kind", "recipients", "purpose", "agreement", "pic", "crossBorder"]}
          onChange={(rows) => set("disclosure", rows as Phase2["disclosure"])}
          newRow={() => ({ id: uid("DIS"), kind: "Internal", recipients: "", purpose: "", agreement: "", pic: "", crossBorder: "" })}
          enums={{ kind: ["Internal", "External"] }}
        />
      </Section>

      <Section title="Retention & Disposal — Information Repositories">
        <DynamicTable
          rows={value.repositories}
          headers={["Repository Name", "Type of Media", "Location", "City, Country", "Retention Period", "Basis", "Disposal/Destruction/Deletion"]}
          fields={["name", "mediaType", "location", "cityCountry", "retentionPeriod", "basis", "disposal"]}
          onChange={(rows) => set("repositories", rows as Phase2["repositories"])}
          newRow={() => ({ id: uid("REP"), name: "", mediaType: "Electronic", location: "", cityCountry: "", retentionPeriod: "", basis: "", disposal: "" })}
          enums={{ mediaType: [...MEDIA_TYPES] }}
        />
      </Section>
    </div>
  );
}

// helpers ----
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-2.5 border-b bg-accent/5"><h3 className="text-sm font-semibold">{title}</h3></div>
        <div className="p-4">{children}</div>
      </CardContent>
    </Card>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
}
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
function Picker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function DynamicTable<T extends { id: string }>({
  rows, headers, fields, onChange, newRow, enums,
}: {
  rows: T[]; headers: string[]; fields: (keyof T)[];
  onChange: (rows: T[]) => void; newRow: () => T;
  enums?: Partial<Record<keyof T, string[]>>;
}) {
  return (
    <>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
          <tr>
            {headers.map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}
            <th className="px-3 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className="border-b last:border-0">
              {fields.map((f) => (
                <td key={String(f)} className="px-2 py-1.5">
                  {enums?.[f] ? (
                    <Select
                      value={String(row[f] ?? "")}
                      onValueChange={(v) => {
                        const next = [...rows]; next[i] = { ...row, [f]: v as T[keyof T] };
                        onChange(next);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {enums[f]!.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={String(row[f] ?? "")}
                      onChange={(e) => {
                        const next = [...rows]; next[i] = { ...row, [f]: e.target.value as T[keyof T] };
                        onChange(next);
                      }}
                      className="h-8 text-xs"
                    />
                  )}
                </td>
              ))}
              <td className="px-2 py-1.5">
                <Button size="icon" variant="ghost" onClick={() => onChange(rows.filter(x => x.id !== row.id))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button size="sm" variant="outline" className="mt-3" onClick={() => onChange([...rows, newRow()])}>
        <Plus className="h-3.5 w-3.5 mr-1" />Add row
      </Button>
    </>
  );
}

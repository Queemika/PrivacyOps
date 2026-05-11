import { Phase2, Phase1, Stakeholder } from "@/lib/pia/schema";
import { LAWFUL_BASIS_PI, LAWFUL_BASIS_SPI, MEDIA_TYPES } from "@/lib/pia/templates";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface Props {
  value: Phase2;
  onChange: (next: Phase2) => void;
  phase1?: Phase1;
}

export function Phase2Form({ value, onChange, phase1 }: Props) {
  const set = <K extends keyof Phase2>(k: K, v: Phase2[K]) => onChange({ ...value, [k]: v });
  const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // PIP present if any category row is PIP OR outsourced=Yes
  const pipPresent = value.outsourced === "Yes" || value.categories.some(c => c.pipPic === "PIP");

  // Auto-derived "When collected" options from Phase 1 data collection methods
  const whenOptions = [
    ...(phase1?.desc.dataCollection || []),
    ...(phase1?.desc.dataCollectionNote ? [phase1.desc.dataCollectionNote] : []),
  ].filter(Boolean);

  // Auto-populate Purpose of Processing from Phase 1 if empty
  useEffect(() => {
    if (!value.purposeProcessing && phase1?.desc.purpose) {
      onChange({ ...value, purposeProcessing: phase1.desc.purpose });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stakeholders: Stakeholder[] = phase1?.stakeholders || [];

  // Auto-fill Use rows with stakeholder data when empty
  const ensureUseRows = () => {
    if (value.use.length === 0 && stakeholders.length > 0) {
      const seeded = stakeholders.map(s => ({
        id: uid("USE"),
        positionDept: `${s.name}${s.role ? " — " + s.role : ""}`,
        scopeModule: "",
        fileName: "",
        purpose: s.involvement || "",
      }));
      set("use", seeded);
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Data Processing System Details">
        <Grid>
          <Field label="Is DPS Manual, Electronic, or Both?">
            <Picker value={value.dpsType} onChange={(v) => set("dpsType", v as Phase2["dpsType"])} options={["Manual", "Electronic", "Both"]} />
          </Field>
          <Field label="Data Processing System Name">
            <Input value={value.dpsName} onChange={(e) => set("dpsName", e.target.value)} className="h-9" />
            <div className="text-[10px] text-muted-foreground mt-1">Editing this also updates the PIA title.</div>
          </Field>
          <Field label="Basis for Processing Personal Information">
            <Picker value={value.basisPI} onChange={(v) => set("basisPI", v)} options={LAWFUL_BASIS_PI} />
          </Field>
          <Field label="Basis for Processing Sensitive PI (if applicable)">
            <Picker value={value.basisSPI} onChange={(v) => set("basisSPI", v)} options={LAWFUL_BASIS_SPI} />
          </Field>
          <Field label="Purpose of Processing" full>
            <Textarea value={value.purposeProcessing} onChange={(e) => set("purposeProcessing", e.target.value)} className="min-h-[60px] text-sm" />
            {phase1?.desc.purpose && (
              <button type="button" className="text-[10px] text-accent hover:underline mt-1"
                onClick={() => set("purposeProcessing", phase1.desc.purpose)}>
                Reset from Phase 1 Purpose
              </button>
            )}
          </Field>
          <Field label="Intended Future Purpose (if any)" full>
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
              <th className="px-3 py-2 text-left">PIC / PIP</th>
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
                  <Input
                    value={row.amount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      const formatted = raw ? Number(raw).toLocaleString("en-US") : "";
                      const next = [...value.categories]; next[i] = { ...row, amount: formatted };
                      set("categories", next);
                    }}
                    placeholder="0,000"
                    className="h-8 text-xs tabular-nums"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Picker value={row.pipPic} onChange={(v) => {
                    const next = [...value.categories]; next[i] = { ...row, pipPic: v };
                    set("categories", next);
                  }} options={["PIC", "PIP"]} />
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
          set("categories", [...value.categories, { id: uid("CAT"), type: "PI", categories: "", amount: "", pipPic: "PIC" }])
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

          {/* PIC always present */}
          <Field label="Name of PIC"><Input value={value.picName} onChange={(e) => set("picName", e.target.value)} className="h-9" /></Field>
          <Field label="Name of DPO"><Input value={value.dpoName} onChange={(e) => set("dpoName", e.target.value)} className="h-9" /></Field>
          <Field label="DPO Email"><Input value={value.dpoEmail} onChange={(e) => set("dpoEmail", e.target.value)} className="h-9" /></Field>
          <Field label="DPO Contact No."><Input value={value.dpoContact} onChange={(e) => set("dpoContact", e.target.value)} className="h-9" /></Field>

          {/* PIP block conditional */}
          {pipPresent && (
            <>
              <Field label="Name of PIP"><Input value={value.pipName} onChange={(e) => set("pipName", e.target.value)} className="h-9" /></Field>
              <Field label="PIP Email"><Input value={value.pipEmail} onChange={(e) => set("pipEmail", e.target.value)} className="h-9" /></Field>
              <Field label="PIP Contact No."><Input value={value.pipContact} onChange={(e) => set("pipContact", e.target.value)} className="h-9" /></Field>
            </>
          )}

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

      {pipPresent && (
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
      )}

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
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 text-left">When collected</th>
              <th className="px-3 py-2 text-left">Who collects</th>
              <th className="px-3 py-2 text-left">From whom</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {value.collection.map((row, i) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-2 py-1.5">
                  {whenOptions.length ? (
                    <Picker value={row.when} onChange={(v) => {
                      const next = [...value.collection]; next[i] = { ...row, when: v }; set("collection", next);
                    }} options={whenOptions} />
                  ) : (
                    <Input value={row.when} onChange={(e) => {
                      const next = [...value.collection]; next[i] = { ...row, when: e.target.value }; set("collection", next);
                    }} className="h-8 text-xs" />
                  )}
                </td>
                <td className="px-2 py-1.5">
                  <Picker value={row.who} onChange={(v) => {
                    const next = [...value.collection]; next[i] = { ...row, who: v }; set("collection", next);
                  }} options={["PIC", "PIP"]} />
                </td>
                <td className="px-2 py-1.5">
                  <Input value={row.from} onChange={(e) => {
                    const next = [...value.collection]; next[i] = { ...row, from: e.target.value }; set("collection", next);
                  }} className="h-8 text-xs" />
                </td>
                <td className="px-2 py-1.5">
                  <Button size="icon" variant="ghost" onClick={() => set("collection", value.collection.filter(x => x.id !== row.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button size="sm" variant="outline" className="mt-3" onClick={() =>
          set("collection", [...value.collection, { id: uid("COL"), when: whenOptions[0] || "", who: "PIC", from: "" }])
        }><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
      </Section>

      <Section title="Data Lifecycle — Use">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">Position & Department and Purpose auto-fill from Stakeholders (Phase 1).</p>
          <Button size="sm" variant="outline" onClick={ensureUseRows}>Seed from stakeholders</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Position & Department</th>
              <th className="px-3 py-2 text-left">Scope/Module</th>
              <th className="px-3 py-2 text-left">File Name</th>
              <th className="px-3 py-2 text-left">Purpose</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {value.use.map((row, i) => (
              <tr key={row.id} className="border-b last:border-0">
                {(["positionDept", "scopeModule", "fileName", "purpose"] as const).map(f => (
                  <td key={f} className="px-2 py-1.5">
                    <Input value={row[f]} onChange={(e) => {
                      const next = [...value.use]; next[i] = { ...row, [f]: e.target.value }; set("use", next);
                    }} className="h-8 text-xs" />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <Button size="icon" variant="ghost" onClick={() => set("use", value.use.filter(x => x.id !== row.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button size="sm" variant="outline" className="mt-3" onClick={() =>
          set("use", [...value.use, { id: uid("USE"), positionDept: "", scopeModule: "", fileName: "", purpose: "" }])
        }><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
      </Section>

      <Section title="Data Lifecycle — Disclosure">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              {["Internal/External", "Recipients", "Sharing Purpose", "Data Sharing Agreement?", "Name of PIC", "Cross-border?"].map(h => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {value.disclosure.map((row, i) => {
              const interOffice = row.kind === "Internal" && /inter-?office collaboration/i.test(row.recipients);
              const update = (patch: Partial<typeof row>) => {
                const next = [...value.disclosure]; next[i] = { ...row, ...patch }; set("disclosure", next);
              };
              return (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-2 py-1.5">
                    <Picker value={row.kind} onChange={(v) => update({ kind: v as "Internal" | "External" })} options={["Internal", "External"]} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.recipients} onChange={(e) => update({ recipients: e.target.value })} className="h-8 text-xs" placeholder='e.g., "Inter-office Collaboration"' />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.purpose} onChange={(e) => update({ purpose: e.target.value })} className="h-8 text-xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={interOffice ? "" : row.agreement} onChange={(e) => update({ agreement: e.target.value })} disabled={interOffice} className="h-8 text-xs disabled:bg-muted/40" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={interOffice ? "" : row.pic} onChange={(e) => update({ pic: e.target.value })} disabled={interOffice} className="h-8 text-xs disabled:bg-muted/40" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={interOffice ? "" : row.crossBorder} onChange={(e) => update({ crossBorder: e.target.value })} disabled={interOffice} className="h-8 text-xs disabled:bg-muted/40" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Button size="icon" variant="ghost" onClick={() => set("disclosure", value.disclosure.filter(x => x.id !== row.id))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button size="sm" variant="outline" className="mt-3" onClick={() =>
          set("disclosure", [...value.disclosure, { id: uid("DIS"), kind: "Internal", recipients: "", purpose: "", agreement: "", pic: "", crossBorder: "" }])
        }><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
      </Section>

      <Section title="Retention & Disposal — Information Repositories">
        <p className="text-xs text-muted-foreground mb-2">List of Information auto-fills from Data Lifecycle — Use (File Name).</p>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40 border-b">
            <tr>
              {["List of Information", "Type of Media", "Location", "Hosting", "City, Country", "Retention Period", "Basis", "Disposal"].map(h => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {value.repositories.map((row, i) => {
              const update = (patch: any) => {
                const next: any = [...value.repositories]; next[i] = { ...row, ...patch }; set("repositories", next);
              };
              const hosting = (row as any).hosting || "";
              const locationDisplay = hosting ? `${row.location || ""} | ${hosting}` : row.location;
              return (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-2 py-1.5">
                    {value.use.length ? (
                      <Picker value={row.name} onChange={(v) => update({ name: v })} options={value.use.map(u => u.fileName).filter(Boolean)} />
                    ) : (
                      <Input value={row.name} onChange={(e) => update({ name: e.target.value })} className="h-8 text-xs" />
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <Picker value={row.mediaType} onChange={(v) => update({ mediaType: v })} options={[...MEDIA_TYPES]} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.location} onChange={(e) => update({ location: e.target.value })} className="h-8 text-xs" placeholder="e.g., Storage Room" />
                    {hosting && <div className="text-[10px] text-muted-foreground mt-0.5">{locationDisplay}</div>}
                  </td>
                  <td className="px-2 py-1.5">
                    <Picker value={hosting} onChange={(v) => update({ hosting: v })} options={["In-house", "Outsourced"]} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.cityCountry} onChange={(e) => update({ cityCountry: e.target.value })} className="h-8 text-xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.retentionPeriod} onChange={(e) => update({ retentionPeriod: e.target.value })} className="h-8 text-xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.basis} onChange={(e) => update({ basis: e.target.value })} className="h-8 text-xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.disposal} onChange={(e) => update({ disposal: e.target.value })} className="h-8 text-xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Button size="icon" variant="ghost" onClick={() => set("repositories", value.repositories.filter(x => x.id !== row.id))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button size="sm" variant="outline" className="mt-3" onClick={() =>
          set("repositories", [...value.repositories, { id: uid("REP"), name: "", mediaType: "Electronic", location: "", cityCountry: "", retentionPeriod: "", basis: "", disposal: "" } as any])
        }><Plus className="h-3.5 w-3.5 mr-1" />Add row</Button>
      </Section>
    </div>
  );
}

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
        {options.filter(Boolean).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

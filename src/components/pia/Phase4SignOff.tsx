import { Phase4, SignOffBlock } from "@/lib/pia/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Phase4SignOff({ value, onChange }: { value: Phase4; onChange: (next: Phase4) => void }) {
  const blocks: { key: keyof Phase4; title: string }[] = [
    { key: "prepared", title: "Prepared By — System / Process Owner" },
    { key: "reviewed", title: "Reviewed By — DPO / Compliance Officer for Privacy" },
    { key: "approved", title: "Approved By — Group Head" },
  ];
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Each signatory confirms completion of their phase responsibility. The typed name acts as the signature on record.</p>
      {blocks.map(b => (
        <Card key={b.key}>
          <CardContent className="p-0">
            <div className="px-4 py-2.5 border-b bg-accent/5"><h3 className="text-sm font-semibold">{b.title}</h3></div>
            <div className="p-4 grid grid-cols-4 gap-4">
              <Block field="Name" value={value[b.key].name} onChange={(v) => onChange({ ...value, [b.key]: { ...value[b.key], name: v } })} />
              <Block field="Designation" value={value[b.key].designation} onChange={(v) => onChange({ ...value, [b.key]: { ...value[b.key], designation: v } })} />
              <Block field="Date" type="date" value={value[b.key].date} onChange={(v) => onChange({ ...value, [b.key]: { ...value[b.key], date: v } })} />
              <Block field="Signature (type to sign)" value={value[b.key].signature} onChange={(v) => onChange({ ...value, [b.key]: { ...value[b.key], signature: v } })} signature />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Block({ field, value, onChange, type, signature }: { field: string; value: string; onChange: (v: string) => void; type?: string; signature?: boolean }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{field}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} type={type} className={signature ? "h-9 font-signature italic" : "h-9"} />
    </div>
  );
}

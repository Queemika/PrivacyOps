import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldCheck, FileLock2, Info } from "lucide-react";
import { anonymizeText } from "@/lib/anonymize";

interface Props {
  original: string;
  strict: boolean;
  onStrictChange: (v: boolean) => void;
}

export default function AnonymizationPreview({ original, strict, onStrictChange }: Props) {
  const result = useMemo(() => anonymizeText(original, strict), [original, strict]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold">Anonymization preview</h3>
            <span className="text-[11px] text-muted-foreground">{result.replacements.length} entities masked</span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="strict" className="text-xs cursor-pointer">Enable Strict Anonymization Mode</Label>
            <Switch id="strict" checked={strict} onCheckedChange={onStrictChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <FileLock2 className="h-3 w-3" />Original (not stored)
            </div>
            <pre className="text-xs leading-relaxed bg-muted/30 border rounded-md p-3 whitespace-pre-wrap font-mono max-h-72 overflow-auto">{original}</pre>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-success mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />Anonymized (sent to AI)
            </div>
            <pre className="text-xs leading-relaxed bg-success/5 border border-success/30 rounded-md p-3 whitespace-pre-wrap font-mono max-h-72 overflow-auto">{result.text}</pre>
          </div>
        </div>

        {result.replacements.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Replacements</div>
            <div className="flex flex-wrap gap-1.5">
              {result.replacements.slice(0, 30).map((r, i) => (
                <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded border bg-card">
                  <span className="text-destructive line-through">{r.original}</span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span className="text-success">{r.placeholder}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 text-xs text-foreground bg-info/5 border border-info/20 rounded-md p-2.5">
          <Info className="h-3.5 w-3.5 mt-0.5 text-info shrink-0" />
          <span>All uploaded data is anonymized before processing to ensure confidentiality. Only the anonymized version is forwarded to AI features.</span>
        </div>
      </CardContent>
    </Card>
  );
}

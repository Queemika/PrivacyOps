import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { transcriptSample, extractedFields } from "@/lib/mockData";
import { Sparkles, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function TranscriptReview() {
  const navigate = useNavigate();
  const [fields, setFields] = useState(extractedFields);

  return (
    <>
      <PageHeader
        title="Transcript Review"
        description="AI-extracted privacy fields. Edit any value before generating the PIA. Confidence scores reflect extraction certainty."
        actions={
          <>
            <Button variant="outline">Re-run extraction</Button>
            <Button onClick={() => { toast.success("PIA generated"); navigate("/pia"); }}>
              <Sparkles className="mr-2 h-4 w-4" />Generate PIA
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Anonymized transcript</h3>
              <span className="text-xs text-muted-foreground">fireflies_hr_onboarding.txt</span>
            </div>
            <pre className="text-xs leading-relaxed p-4 whitespace-pre-wrap font-mono max-h-[640px] overflow-auto">{transcriptSample}</pre>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="text-sm font-semibold">Extracted fields</h3>
            </div>
            <div className="divide-y">
              {fields.map((f, i) => (
                <div key={f.field} className="p-4 hover:bg-muted/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label text={f.field} />
                    <ConfidenceBar value={f.confidence} />
                  </div>
                  {f.value.length > 80 ? (
                    <Textarea
                      defaultValue={f.value}
                      className="text-sm"
                      rows={2}
                      onChange={(e) => { const c = [...fields]; c[i] = { ...f, value: e.target.value }; setFields(c); }}
                    />
                  ) : (
                    <Input
                      defaultValue={f.value}
                      className="text-sm"
                      onChange={(e) => { const c = [...fields]; c[i] = { ...f, value: e.target.value }; setFields(c); }}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Edit3 className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs font-medium text-foreground">{text}</span>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const tone = value >= 90 ? "bg-success" : value >= 80 ? "bg-info" : value >= 70 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

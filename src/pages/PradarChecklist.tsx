import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download, Upload, Info, ChevronDown, FileSpreadsheet, Sparkles, Settings2,
} from "lucide-react";
import {
  PRADAR_DOMAINS,
  PRADAR_ITEMS,
  DRL_STATUS_OPTIONS,
  ASSESSMENT_STATUS_OPTIONS,
  REVIEWER_STATUS_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  ASSESSOR_OPTIONS,
  REVIEWER_OPTIONS,
  RATING_OPTIONS,
  RATING_LABELS,
  MATURITY_LABELS,
} from "@/lib/pradarTemplate";
import {
  loadEntries, saveEntries, entryFor, itemsByDomain, domainAverage, overallMaturity,
  type PradarEntry,
} from "@/lib/pradarModel";
import { exportPradarWorkbook, importPradarWorkbook } from "@/lib/pradarExport";
import { parseBasis, scoreFromChecks, SCORE_FORMULA_HELP } from "@/lib/pradar/workingFile";
import { addRow as addDrlRow, updateRow as updateDrlRow } from "@/lib/drl/store";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

const ratingTone = (r: number | null) => {
  if (r == null) return "bg-muted text-muted-foreground";
  if (r === 1) return "bg-destructive text-destructive-foreground";
  if (r === 2) return "bg-warning text-warning-foreground";
  if (r === 3) return "bg-info text-info-foreground";
  return "bg-success text-success-foreground";
};

export default function PradarChecklist() {
  const [entries, setEntries] = useState<Record<string, PradarEntry>>({});
  const [showInternal, setShowInternal] = useState(false);
  const [showClient, setShowClient] = useState(false);
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEntries(loadEntries()); }, []);
  useEffect(() => { if (Object.keys(entries).length) saveEntries(entries); }, [entries]);

  const update = (id: string, patch: Partial<PradarEntry>) =>
    setEntries(prev => ({ ...prev, [id]: { ...entryFor(prev, id), ...patch } }));

  const grouped = useMemo(() => itemsByDomain(), []);
  const overall = overallMaturity(entries);

  const handleExport = async () => {
    try {
      await exportPradarWorkbook(entries, `PRADAR_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("PRADAR exported to Excel template");
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    }
  };

  const handleImport = async (f: File) => {
    try {
      const incoming = await importPradarWorkbook(f);
      setEntries(prev => {
        const next = { ...prev };
        for (const [id, partial] of Object.entries(incoming)) {
          next[id] = { ...entryFor(prev, id), ...partial } as PradarEntry;
        }
        return next;
      });
      toast.success("Imported PRADAR responses");
    } catch (e: any) {
      toast.error(e.message ?? "Import failed");
    }
  };

  return (
    <TooltipProvider>
      <PageHeader
        title="PRADAR Assessment"
        description="Privacy Risk and Document Assessment Request — 24 control questions across 10 privacy domains. Synced with your Excel template."
        actions={
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />Import
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />Export to Excel
            </Button>
          </>
        }
      />

      {/* Scoreboard */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Overall Maturity</div>
              <div className="text-3xl font-semibold mt-1">
                {overall != null ? overall.toFixed(2) : "—"}
                {overall != null && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {MATURITY_LABELS[Math.round(overall)] ?? ""}
                  </span>
                )}
              </div>
            </div>
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              {PRADAR_DOMAINS.map(d => {
                const avg = domainAverage(d, entries);
                return (
                  <div key={d} className="rounded-md border p-2 text-xs">
                    <div className="text-[10px] text-muted-foreground line-clamp-2 min-h-[28px]">{d}</div>
                    <div className="mt-1 font-semibold tabular-nums">
                      {avg != null ? avg.toFixed(1) : "—"}
                      <span className="text-muted-foreground"> / 4</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-[260px]"><SelectValue placeholder="All domains" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {PRADAR_DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any rating</SelectItem>
            <SelectItem value="unrated">Unrated</SelectItem>
            <SelectItem value="low">Low (1–2)</SelectItem>
            <SelectItem value="high">High (3–4)</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant={showInternal ? "default" : "outline"} onClick={() => setShowInternal(s => !s)}>
            <Settings2 className="mr-2 h-3.5 w-3.5" />Internal mode
          </Button>
          <Button size="sm" variant={showClient ? "default" : "outline"} onClick={() => setShowClient(s => !s)}>
            Client mode
          </Button>
        </div>
      </div>

      {/* Domains */}
      <div className="space-y-3">
        {PRADAR_DOMAINS.filter(d => domainFilter === "all" || d === domainFilter).map(domain => {
          const items = (grouped[domain] ?? []).filter(item => {
            if (ratingFilter === "all") return true;
            const r = entries[item.id]?.rating;
            if (ratingFilter === "unrated") return r == null;
            if (ratingFilter === "low") return r === 1 || r === 2;
            if (ratingFilter === "high") return r === 3 || r === 4;
            return true;
          });
          if (!items.length) return null;
          const avg = domainAverage(domain, entries);

          return (
            <Collapsible key={domain} defaultOpen>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <div className="px-4 py-3 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                      <ChevronDown className="h-4 w-4" />
                      <span className="font-semibold text-sm">{domain}</span>
                      <Badge variant="secondary" className="text-[10px]">{items.length} controls</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: <span className="font-semibold text-foreground">{avg != null ? avg.toFixed(1) : "—"}</span> / 4
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-0 divide-y">
                    {items.map(item => {
                      const e = entryFor(entries, item.id);
                      return (
                        <div key={item.id} className="p-4 hover:bg-muted/10">
                          <div className="flex items-start gap-3 mb-3">
                            <Badge variant="outline" className="text-[10px] mt-0.5">DRL #{item.drlNo}</Badge>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium leading-snug flex items-start gap-2">
                                <span>{item.controlQuestion}</span>
                                {item.basis && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button type="button" className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
                                        <Info className="h-3.5 w-3.5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md whitespace-pre-wrap text-xs">
                                      {item.basis}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-1">
                                {item.component} · {item.subDomain} · Proof: {item.proof}
                              </div>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-muted-foreground w-20">Rating</span>
                            <div className="flex items-center gap-1">
                              {RATING_OPTIONS.map(r => (
                                <Popover key={r}>
                                  <PopoverTrigger asChild>
                                    <button
                                      onClick={() => update(item.id, { rating: e.rating === r ? null : r })}
                                      className={`text-[11px] px-2.5 py-1 rounded border transition ${
                                        e.rating === r ? ratingTone(r) + " border-transparent" : "bg-background hover:bg-muted"
                                      }`}
                                    >
                                      {r} · {RATING_LABELS[r]}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="max-w-md text-xs whitespace-pre-wrap">
                                    {item.ratingGuide}
                                  </PopoverContent>
                                </Popover>
                              ))}
                            </div>
                            <Button size="sm" variant="ghost" className="ml-auto text-xs h-7">
                              <Sparkles className="mr-1 h-3 w-3" />AI suggest
                            </Button>
                          </div>

                          {/* Core inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="text-[11px] text-muted-foreground">Gap (1–2 lines)</label>
                              <Textarea
                                rows={2}
                                value={e.gap}
                                onChange={ev => update(item.id, { gap: ev.target.value })}
                                placeholder="State the gap concisely…"
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-muted-foreground">Action Plan</label>
                              <Textarea
                                rows={2}
                                value={e.actionPlan}
                                onChange={ev => update(item.id, { actionPlan: ev.target.value })}
                                placeholder="Action: …\nResponsible: …\nTimeline: …"
                                className="text-xs"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[11px] text-muted-foreground">Document link</label>
                              <Input
                                value={e.documentLink}
                                onChange={ev => update(item.id, { documentLink: ev.target.value })}
                                placeholder="URL to evidence document"
                                className="text-xs h-8"
                              />
                            </div>
                          </div>

                          {/* Internal mode */}
                          {showInternal && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 p-3 rounded bg-muted/30">
                              <SmallSelect label="DRL Status" value={e.drlStatus} onChange={v => update(item.id, { drlStatus: v })} options={DRL_STATUS_OPTIONS} />
                              <SmallSelect label="Assessor" value={e.assessor} onChange={v => update(item.id, { assessor: v })} options={ASSESSOR_OPTIONS} />
                              <SmallSelect label="Assess. Status" value={e.assessmentStatus} onChange={v => update(item.id, { assessmentStatus: v })} options={ASSESSMENT_STATUS_OPTIONS} />
                              <SmallSelect label="Reviewer Status" value={e.reviewerStatus} onChange={v => update(item.id, { reviewerStatus: v })} options={REVIEWER_STATUS_OPTIONS} />
                              <div className="text-[10px] text-muted-foreground self-end pb-2">
                                Reviewers: {REVIEWER_OPTIONS.join(", ")}
                              </div>
                            </div>
                          )}

                          {/* Client mode */}
                          {showClient && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 p-3 rounded bg-accent/5 border border-accent/20">
                              <div className="md:col-span-2">
                                <label className="text-[11px] text-muted-foreground">Client comment</label>
                                <Textarea rows={2} value={e.clientComment} onChange={ev => update(item.id, { clientComment: ev.target.value })} className="text-xs" />
                              </div>
                              <SmallSelect label="Client Status" value={e.clientStatus} onChange={v => update(item.id, { clientStatus: v })} options={CLIENT_STATUS_OPTIONS} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <div className="mt-6 text-[11px] text-muted-foreground flex items-center gap-2">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Export writes back into your original PRADAR template — Scoreboard and DRL formulas recalculate when opened in Excel.
      </div>
    </TooltipProvider>
  );
}

function SmallSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

import { useRef } from "react";
import { Paperclip, X, Eye, Plus } from "lucide-react";
import { DrlAttachment, DrlRow, updateRow } from "@/lib/drl/store";
import { useAttachmentPreview } from "@/components/AttachmentPreview";
import { toast } from "sonner";

interface Props {
  row: DrlRow;
  onChange: () => void;
}

export function DrlAttachmentCell({ row, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const items = row.attachments || [];
  const { open } = useAttachmentPreview();

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: DrlAttachment[] = [...items];
    for (const f of Array.from(files)) {
      if (f.size > 2 * 1024 * 1024) { toast.error(`${f.name}: max 2 MB per file`); continue; }
      const dataUrl: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      next.push({ name: f.name, mime: f.type || "application/octet-stream", dataUrl });
    }
    updateRow(row.id, { attachments: next });
    onChange();
    toast.success(`Attached ${files.length} file${files.length === 1 ? "" : "s"}`);
  };

  const remove = (i: number) => {
    const next = items.filter((_, idx) => idx !== i);
    updateRow(row.id, { attachments: next });
    onChange();
  };

  return (
    <div className="space-y-1">
      <input ref={ref} type="file" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.currentTarget.value = ""; }} />
      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-dashed bg-background hover:bg-muted text-muted-foreground"
          title="No attachment yet — add to DRL"
        >
          <Plus className="h-3 w-3" />Add to DRL
        </button>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border bg-background hover:bg-muted"
        >
          <Paperclip className="h-3 w-3" />Attach more
        </button>
      )}
      {items.map((a, i) => (
        <div key={i} className="flex items-center gap-1 text-[10px] bg-muted/40 rounded px-1.5 py-0.5">
          <button
            type="button"
            onClick={() => open(a)}
            className="flex-1 min-w-0 flex items-center gap-1 truncate hover:underline text-left"
            title={`Preview ${a.name}`}
          >
            <Eye className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{a.name}</span>
          </button>
          <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileType, Archive } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { toast } from "sonner";

export interface ExportColumn { header: string; key: string; width?: number }

export interface ExportMenuProps {
  /** Display name without extension */
  filename: string;
  columns: ExportColumn[];
  rows: Record<string, any>[];
  /** Optional attachments for ZIP export: data URLs or base64 */
  attachments?: { name: string; dataUrl: string }[];
  formats?: ("excel" | "csv" | "pdf" | "zip")[];
  size?: "sm" | "default";
}

function escCsv(v: any) { return `"${String(v ?? "").replace(/"/g, '""')}"`; }

export function ExportMenu(props: ExportMenuProps) {
  const { filename, columns, rows, attachments = [], formats = ["excel", "pdf", "csv"], size = "sm" } = props;

  const downloadBlob = (blob: Blob, ext: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}.${ext}`;
    a.click();
  };

  const exportExcel = () => {
    const data = rows.map(r => Object.fromEntries(columns.map(c => [c.header, r[c.key] ?? ""])));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = columns.map(c => ({ wch: Math.max(12, Math.round((c.width || 120) / 8)) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename.slice(0, 30) || "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success("Excel exported");
  };

  const exportCsv = () => {
    const header = columns.map(c => escCsv(c.header)).join(",");
    const body = rows.map(r => columns.map(c => escCsv(r[c.key])).join(",")).join("\n");
    downloadBlob(new Blob([`${header}\n${body}`], { type: "text/csv" }), "csv");
    toast.success("CSV exported");
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(13);
    doc.text(filename, 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [columns.map(c => c.header)],
      body: rows.map(r => columns.map(c => String(r[c.key] ?? ""))),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`${filename}.pdf`);
    toast.success("PDF exported");
  };

  const exportZip = async () => {
    const zip = new JSZip();
    // Spreadsheet
    const data = rows.map(r => Object.fromEntries(columns.map(c => [c.header, r[c.key] ?? ""])));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    zip.file(`${filename}.xlsx`, out);
    // Attachments
    if (attachments.length) {
      const folder = zip.folder("attachments");
      attachments.forEach(att => {
        const m = /^data:([^;]+);base64,(.+)$/.exec(att.dataUrl);
        if (m) folder!.file(att.name, m[2], { base64: true });
      });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "zip");
    toast.success(`ZIP exported${attachments.length ? ` (${attachments.length} attachments)` : ""}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant="outline"><Download className="h-3.5 w-3.5 mr-1" />Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes("excel") && (
          <DropdownMenuItem onClick={exportExcel}><FileSpreadsheet className="h-3.5 w-3.5 mr-2" />Excel (.xlsx)</DropdownMenuItem>
        )}
        {formats.includes("pdf") && (
          <DropdownMenuItem onClick={exportPdf}><FileText className="h-3.5 w-3.5 mr-2" />PDF</DropdownMenuItem>
        )}
        {formats.includes("csv") && (
          <DropdownMenuItem onClick={exportCsv}><FileType className="h-3.5 w-3.5 mr-2" />CSV</DropdownMenuItem>
        )}
        {formats.includes("zip") && (
          <DropdownMenuItem onClick={exportZip}><Archive className="h-3.5 w-3.5 mr-2" />ZIP (data + attachments)</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

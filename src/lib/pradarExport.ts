import ExcelJS from "exceljs";
import { PRADAR_ITEMS } from "./pradarTemplate";
import type { PradarEntry } from "./pradarModel";

const TEMPLATE_URL = "/templates/pradar_template.xlsx";

// PRADAR sheet column indexes (1-based) we write to.
// H=8 DocumentLink, I=9 DRL Status, K=11 Assessor, L=12 Assessment, M=13 Assessment Status,
// N=14 Reviewer's Status, P=16 Rating, Q=17 Gaps, R=18 Client's Comments,
// S=19 Client's Status, T=20 Action Plan
const COL = {
  documentLink: 8,
  drlStatus: 9,
  assessor: 11,
  assessment: 12,
  assessmentStatus: 13,
  reviewerStatus: 14,
  rating: 16,
  gap: 17,
  clientComment: 18,
  clientStatus: 19,
  actionPlan: 20,
};

export async function exportPradarWorkbook(entries: Record<string, PradarEntry>, filename = "PRADAR_export.xlsx") {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error("Could not load PRADAR template");
  const buf = await res.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  const ws = wb.getWorksheet("PRADAR");
  if (!ws) throw new Error("PRADAR sheet missing in template");

  for (const item of PRADAR_ITEMS) {
    const e = entries[item.id];
    if (!e) continue;
    const row = ws.getRow(item.row);
    if (e.documentLink) row.getCell(COL.documentLink).value = e.documentLink;
    if (e.drlStatus) row.getCell(COL.drlStatus).value = e.drlStatus;
    if (e.assessor) row.getCell(COL.assessor).value = e.assessor;
    if (e.assessmentStatus) row.getCell(COL.assessmentStatus).value = e.assessmentStatus;
    if (e.reviewerStatus) row.getCell(COL.reviewerStatus).value = e.reviewerStatus;
    if (e.rating != null) row.getCell(COL.rating).value = e.rating;
    if (e.gap) row.getCell(COL.gap).value = e.gap;
    if (e.clientComment) row.getCell(COL.clientComment).value = e.clientComment;
    if (e.clientStatus) row.getCell(COL.clientStatus).value = e.clientStatus;
    if (e.actionPlan) row.getCell(COL.actionPlan).value = e.actionPlan;
    row.commit();
  }

  const out = await wb.xlsx.writeBuffer();
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importPradarWorkbook(file: File): Promise<Record<string, Partial<PradarEntry>>> {
  const buf = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.getWorksheet("PRADAR");
  if (!ws) throw new Error("Not a PRADAR template (PRADAR sheet missing)");

  const out: Record<string, Partial<PradarEntry>> = {};
  for (const item of PRADAR_ITEMS) {
    const row = ws.getRow(item.row);
    const get = (c: number) => {
      const v = row.getCell(c).value;
      if (v == null) return "";
      if (typeof v === "object" && "text" in (v as any)) return String((v as any).text);
      return String(v);
    };
    const ratingRaw = row.getCell(COL.rating).value;
    out[item.id] = {
      id: item.id,
      documentLink: get(COL.documentLink),
      drlStatus: get(COL.drlStatus),
      assessor: get(COL.assessor),
      assessmentStatus: get(COL.assessmentStatus),
      reviewerStatus: get(COL.reviewerStatus),
      rating: typeof ratingRaw === "number" ? ratingRaw : ratingRaw ? Number(ratingRaw) || null : null,
      gap: get(COL.gap),
      clientComment: get(COL.clientComment),
      clientStatus: get(COL.clientStatus),
      actionPlan: get(COL.actionPlan),
    };
  }
  return out;
}

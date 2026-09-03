import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PLATFORM } from "@/lib/branding";

/** Render a tabular report as a downloadable PDF. */
export function exportTablePdf({
  title,
  subtitle,
  columns,
  rows,
  fileName,
}: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
}) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });

  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  const meta = [subtitle, `Generated ${new Date().toLocaleString()}`, PLATFORM.name]
    .filter(Boolean)
    .join("  ·  ");
  doc.text(meta, 14, 22);

  autoTable(doc, {
    startY: 27,
    head: [columns],
    body: rows.length ? rows : [columns.map(() => "—")],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 52, 82], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 246, 248] },
  });

  doc.save(fileName);
}

import { Download, FileDown, FileSpreadsheet, Printer, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportTablePdf } from "@/lib/pdf";
import { PLATFORM } from "@/lib/branding";

export type ExportData = {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
};

function download(content: string, fileName: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

const cell = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function exportCsv({ columns, rows, fileName }: ExportData) {
  const csv = [columns.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join("\n");
  download("\uFEFF" + csv, fileName.replace(/\.\w+$/, "") + ".csv", "text/csv;charset=utf-8");
}

/** SpreadsheetML table — opens natively in Excel, Numbers and Sheets. */
export function exportExcel({ title, columns, rows, fileName }: ExportData) {
  const esc = (v: string | number) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body>
<table border="1"><thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>
<p>${esc(title)} — ${esc(PLATFORM.name)}</p></body></html>`;
  download(html, fileName.replace(/\.\w+$/, "") + ".xls", "application/vnd.ms-excel");
}

export function printTable({ title, subtitle, columns, rows }: ExportData) {
  const esc = (v: string | number) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;
  win.document.write(`<html><head><title>${esc(title)}</title><style>
    body{font-family:system-ui,sans-serif;padding:24px;color:#111}
    h1{font-size:18px;margin:0 0 4px} p.meta{color:#666;font-size:12px;margin:0 0 16px}
    table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
    thead th{background:#1e3452;color:#fff}
    tbody tr:nth-child(even){background:#f5f6f8}
  </style></head><body>
    <h1>${esc(title)}</h1>
    <p class="meta">${[subtitle, new Date().toLocaleString(), PLATFORM.name]
      .filter(Boolean)
      .map((s) => esc(s as string))
      .join(" · ")}</p>
    <table><thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>
  </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

/** One export control (PDF / CSV / Excel / Print) shared by every module table. */
export function ExportMenu({ data, disabled }: { data: ExportData; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="mr-1 h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportTablePdf(data)}>
          <FileDown className="mr-2 h-4 w-4" /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportCsv(data)}>
          <Table2 className="mr-2 h-4 w-4" /> CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportExcel(data)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => printTable(data)}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

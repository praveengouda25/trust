import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ExportMenu } from "@/components/data/export-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/data/states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/hooks/use-session";
import { getReportData } from "@/lib/operations.functions";


export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Generate occupancy, attendance, donation and expense reports and export them to PDF.",
      },
      { property: "og:title", content: "Reports | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Generate occupancy, attendance, donation and expense reports and export them to PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const REPORTS = [
  { value: "students", label: "Student register" },
  { value: "attendance", label: "Attendance" },
  { value: "leave", label: "Leave requests" },
  { value: "donations", label: "Donations" },
  { value: "expenses", label: "Expenses" },
  { value: "inventory", label: "Inventory stock" },
  { value: "issues", label: "Issue register" },
  { value: "staff", label: "Staff directory" },
  { value: "occupancy", label: "Hostel occupancy" },
] as const;

type ReportKey = (typeof REPORTS)[number]["value"];

function ReportsPage() {
  const { session, branchId } = useSession();
  const [report, setReport] = useState<ReportKey>("donations");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<{ columns: string[]; rows: string[][] } | null>(null);

  const fetchReport = useServerFn(getReportData);
  const branchName = session.branches.find((b) => b.id === branchId)?.name ?? "All branches";

  const run = useMutation({
    mutationFn: async () => {
      const data = await fetchReport({
        data: { report, branchId, from: from || undefined, to: to || undefined },
      });
      const rows = (data.rows as Record<string, unknown>[]).map((r) =>
        Object.values(r).map((v) => (v === null || v === undefined ? "—" : String(v))),
      );
      return { columns: data.columns, rows };
    },
    onSuccess: (data) => setResult(data),
    onError: (e: Error) => toast.error(e.message),
  });

  const label = REPORTS.find((r) => r.value === report)!.label;

  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate operational and financial reports, then export them as PDF."
        actions={
          <ExportMenu
            disabled={!result}
            data={{
              title: label,
              subtitle: `${branchName}${from || to ? ` · ${from || "start"} → ${to || "today"}` : ""}`,
              columns: result?.columns ?? [],
              rows: result?.rows ?? [],
              fileName: `${report}-report`,
            }}
          />
        }
      />

      <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-xs">Report</Label>
          <Select
            value={report}
            onValueChange={(v) => {
              setReport(v as ReportKey);
              setResult(null);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORTS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="sm:col-span-4">
          <Button onClick={() => run.mutate()} disabled={run.isPending}>
            {run.isPending ? "Generating…" : "Generate report"}
          </Button>
        </div>
      </div>

      {!result && (
        <EmptyState
          title="No report generated yet"
          description="Choose a report and date range, then generate to preview and download."
        />
      )}

      {result && result.rows.length === 0 && (
        <EmptyState title="No data in range" description="Try widening the date range or branch." />
      )}

      {result && result.rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {result.columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.slice(0, 200).map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

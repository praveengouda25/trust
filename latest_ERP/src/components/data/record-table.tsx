import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function RecordTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={c.className}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <TableCell key={c.key} className={c.className}>
                  {c.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const TONES: Record<string, string> = {
  present: "bg-success/15 text-success border-success/30",
  active: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  resolved: "bg-success/15 text-success border-success/30",
  enrolled: "bg-success/15 text-success border-success/30",
  pending: "bg-accent/15 text-accent border-accent/30",
  submitted: "bg-accent/15 text-accent border-accent/30",
  under_review: "bg-accent/15 text-accent border-accent/30",
  in_progress: "bg-accent/15 text-accent border-accent/30",
  on_leave: "bg-accent/15 text-accent border-accent/30",
  late: "bg-accent/15 text-accent border-accent/30",
  leave: "bg-accent/15 text-accent border-accent/30",
  absent: "bg-destructive/15 text-destructive border-destructive/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  open: "bg-info/15 text-info border-info/30",
};

export function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className={TONES[value] ?? ""}>
      {value.replace(/_/g, " ")}
    </Badge>
  );
}

export function money(value: number | string | null | undefined, currency = "INR") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

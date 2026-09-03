import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/data/states";
import { RecordTable, StatusBadge } from "@/components/data/record-table";
import { RecordDialog, clean, today, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { listLeaves, listStudents, saveLeave } from "@/lib/operations.functions";

export const Route = createFileRoute("/_authenticated/leave")({
  head: () => ({
    meta: [
      { title: "Leave requests | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Track student leave requests with destinations, contacts and approve or reject workflow.",
      },
      { property: "og:title", content: "Leave requests | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Track student leave requests with destinations, contacts and approve or reject workflow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeavePage,
});

function LeavePage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchLeaves = useServerFn(listLeaves);
  const fetchStudents = useServerFn(listStudents);
  const save = useServerFn(saveLeave);

  const leaves = useQuery({
    queryKey: ["leaves", branchId],
    queryFn: () => fetchLeaves({ data: { branchId } }),
  });
  const students = useQuery({
    queryKey: ["students", branchId],
    queryFn: () => fetchStudents({ data: { branchId } }),
  });

  const studentName = (id: string) => {
    const s = students.data?.students.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name ?? ""}`.trim() : "—";
  };

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          student_id: v.student_id,
          from_date: v.from_date,
          to_date: v.to_date,
          reason: v.reason || "",
          destination: v.destination || null,
          contact_phone: v.contact_phone || null,
          status: (v.status || "pending") as never,
        }),
      }),
    onSuccess: () => {
      toast.success("Leave request saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decide = useMutation({
    mutationFn: (input: { id: string; status: "approved" | "rejected" }) =>
      save({
        data: {
          id: input.id,
          branch_id: branchId!,
          student_id: leaves.data!.leaves.find((l) => l.id === input.id)!.student_id,
          from_date: leaves.data!.leaves.find((l) => l.id === input.id)!.from_date,
          to_date: leaves.data!.leaves.find((l) => l.id === input.id)!.to_date,
          reason: leaves.data!.leaves.find((l) => l.id === input.id)!.reason,
          status: input.status,
        },
      }),
    onSuccess: () => {
      toast.success("Leave updated");
      void qc.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = leaves.data?.leaves ?? [];

  return (
    <>
      <PageHeader
        title="Leave"
        description="Student leave applications, approvals and return tracking."
        actions={
          <Button disabled={!branchId} onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New request
          </Button>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="New leave request"
        fields={[
          {
            name: "student_id",
            label: "Student",
            type: "select",
            required: true,
            options: (students.data?.students ?? []).map((s) => ({
              value: s.id,
              label: `${s.first_name} ${s.last_name ?? ""} · ${s.admission_number}`,
            })),
          },
          { name: "from_date", label: "From", type: "date", required: true },
          { name: "to_date", label: "To", type: "date", required: true },
          { name: "destination", label: "Destination", type: "text" },
          { name: "contact_phone", label: "Contact phone", type: "tel" },
          { name: "reason", label: "Reason", type: "textarea", required: true },
        ]}
        initial={{ from_date: today(), to_date: today() }}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      {!branchId && (
        <EmptyState title="Select a branch" description="Leave is scoped per branch." />
      )}
      {leaves.isPending && <LoadingState />}
      {leaves.isError && (
        <ErrorState
          message="Failed to load leave requests"
          details="Check your branch permissions and try again"
          onRetry={() => void leaves.refetch()}
        />
      )}
      {leaves.data && rows.length === 0 && (
        <EmptyState
          title="No leave requests"
          description="Approved and pending leave shows here."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          columns={[
            { key: "student", header: "Student", cell: (r) => studentName(r.student_id) },
            {
              key: "dates",
              header: "Dates",
              cell: (r) => `${r.from_date} → ${r.to_date}`,
            },
            { key: "reason", header: "Reason", cell: (r) => r.reason },
            { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (r) =>
                r.status === "pending" ? (
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => decide.mutate({ id: r.id, status: "approved" })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => decide.mutate({ id: r.id, status: "rejected" })}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}
    </>
  );
}

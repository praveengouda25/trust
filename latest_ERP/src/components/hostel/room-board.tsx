import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BedDouble, Check, UserMinus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentAvatar } from "@/components/data/photo-field";
import { cn } from "@/lib/utils";
import { listStudents } from "@/lib/operations.functions";
import { assignBed, vacateBed } from "@/lib/modules.functions";
import { today } from "@/components/data/record-dialog";

export type BedRow = { id: string; bed_number: string; status: string; room_id: string };
export type RoomRow = { id: string; room_number: string; capacity: number };
export type Occupant = {
  allocationId: string;
  bedId: string;
  studentId: string | null;
  name: string;
  admissionNumber: string;
  classGrade: string | null;
  bloodGroup: string | null;
  photoUrl: string | null;
};

const TONE: Record<string, string> = {
  available: "border-success/40 bg-success/5",
  occupied: "border-primary/40 bg-primary/5",
  reserved: "border-warning/40 bg-warning/10",
  maintenance: "border-destructive/40 bg-destructive/5",
};

/** A single room card listing every bed with its occupant or an assign action. */
export function RoomCard({
  room,
  beds,
  occupants,
  branchId,
  editable,
  onChanged,
}: {
  room: RoomRow;
  beds: BedRow[];
  occupants: Occupant[];
  branchId: string | null;
  editable: boolean;
  onChanged: () => void;
}) {
  const [assignBedRow, setAssignBedRow] = useState<BedRow | null>(null);
  const vacate = useServerFn(vacateBed);
  const qc = useQueryClient();

  const vacateMut = useMutation({
    mutationFn: (allocationId: string) => vacate({ data: { allocationId } }),
    onSuccess: () => {
      toast.success("Bed vacated");
      onChanged();
      void qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const byBed = new Map(occupants.map((o) => [o.bedId, o]));
  const filled = beds.filter((b) => byBed.has(b.id)).length;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm font-semibold">Room {room.room_number}</p>
        <Badge variant="outline" className="text-[10px]">
          {filled}/{room.capacity} filled
        </Badge>
      </div>

      <ul className="mt-3 space-y-2">
        {beds.map((bed) => {
          const occ = byBed.get(bed.id);
          return (
            <li
              key={bed.id}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2 py-2",
                TONE[occ ? "occupied" : bed.status] ?? "border-border",
              )}
            >
              <BedDouble className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-mono text-[11px] font-medium">{bed.bed_number}</span>

              {occ ? (
                <>
                  <StudentAvatar path={occ.photoUrl} name={occ.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{occ.name}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {occ.admissionNumber}
                      {occ.classGrade ? ` · ${occ.classGrade}` : ""}
                    </p>
                  </div>
                  {editable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Vacate bed"
                      disabled={vacateMut.isPending}
                      onClick={() => vacateMut.mutate(occ.allocationId)}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-muted-foreground">
                    {bed.status === "available" ? "Vacant" : bed.status}
                  </span>
                  {editable && bed.status === "available" && (
                    <Button size="sm" variant="outline" onClick={() => setAssignBedRow(bed)}>
                      <UserPlus className="mr-1 h-3.5 w-3.5" /> Assign
                    </Button>
                  )}
                </>
              )}
            </li>
          );
        })}
        {beds.length === 0 && <li className="text-xs text-muted-foreground">No beds generated.</li>}
      </ul>

      <AssignStudentDialog
        bed={assignBedRow}
        roomNumber={room.room_number}
        branchId={branchId}
        onClose={() => setAssignBedRow(null)}
        onAssigned={() => {
          setAssignBedRow(null);
          onChanged();
        }}
      />
    </div>
  );
}

function AssignStudentDialog({
  bed,
  roomNumber,
  branchId,
  onClose,
  onAssigned,
}: {
  bed: BedRow | null;
  roomNumber: string;
  branchId: string | null;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [date, setDate] = useState(today());
  const qc = useQueryClient();

  const fetchStudents = useServerFn(listStudents);
  const assign = useServerFn(assignBed);

  const { data } = useQuery({
    queryKey: ["students", branchId],
    queryFn: () => fetchStudents({ data: { branchId } }),
    enabled: Boolean(bed),
  });

  const q = search.trim().toLowerCase();
  const students = useMemo(
    () =>
      (data?.students ?? [])
        .filter((s) => s.status === "active" || s.status === "applicant")
        .filter(
          (s) =>
            !q ||
            `${s.first_name} ${s.last_name ?? ""} ${s.admission_number} ${s.class_grade ?? ""}`
              .toLowerCase()
              .includes(q),
        )
        .slice(0, 40),
    [data, q],
  );

  const mut = useMutation({
    mutationFn: () =>
      assign({
        data: {
          studentId: selected!,
          bedId: bed!.id,
          remarks: remarks || null,
          allocatedAt: date || null,
        },
      }),
    onSuccess: () => {
      toast.success("Student assigned to bed");
      setSelected(null);
      setRemarks("");
      setSearch("");
      void qc.invalidateQueries({ queryKey: ["students"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      onAssigned();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={Boolean(bed)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign student</DialogTitle>
          <DialogDescription>
            Room {roomNumber} · Bed {bed?.bed_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Search by name, admission number or class…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-1">
            {students.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground">No matching students.</p>
            )}
            {students.map((s) => {
              const name = `${s.first_name} ${s.last_name ?? ""}`.trim();
              const active = selected === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted",
                    active && "bg-primary/10 ring-1 ring-primary/40",
                  )}
                >
                  <StudentAvatar path={s.photo_url} name={name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{name}</span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {s.admission_number}
                      {s.class_grade ? ` · ${s.class_grade}` : ""}
                    </span>
                  </span>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="alloc-date" className="mb-1.5 block text-xs">
                Allocation date
              </Label>
              <Input
                id="alloc-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="alloc-remarks" className="mb-1.5 block text-xs">
                Remarks
              </Label>
              <Textarea
                id="alloc-remarks"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={!selected || mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? "Assigning…" : "Assign bed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, BedDouble } from "lucide-react";
import { toast } from "sonner";

import { listHostels, saveHostel } from "@/lib/foundation.functions";
import { useSession } from "@/hooks/use-session";
import { can } from "@/lib/permissions";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/data/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/hostels/")({
  head: () => ({
    meta: [
      { title: "Hostels | VISTARX Hostel360" },
      {
        name: "description",
        content: "Manage hostels, buildings, floors, rooms and bed inventory across every branch.",
      },
      { property: "og:title", content: "Hostels | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Manage hostels, buildings, floors, rooms and bed inventory across every branch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HostelsPage,
});

function HostelsPage() {
  const { session, roles, branchId } = useSession();
  const queryClient = useQueryClient();
  const fetchHostels = useServerFn(listHostels);
  const createHostel = useServerFn(saveHostel);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "boys" as "boys" | "girls" | "mixed",
    branch_id: branchId ?? "",
  });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["hostels", branchId],
    queryFn: () => fetchHostels({ data: { branchId } }),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createHostel({
        data: {
          name: form.name,
          code: form.code.toUpperCase(),
          type: form.type,
          branch_id: form.branch_id,
        },
      }),
    onSuccess: () => {
      toast.success("Hostel created");
      setOpen(false);
      setForm({ name: "", code: "", type: "boys", branch_id: branchId ?? "" });
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const canCreate = can(roles, "hostels", "create") && session.branches.length > 0;

  return (
    <>
      <PageHeader
        title="Hostels"
        description="Buildings, floors, rooms and beds for each branch."
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New hostel
            </Button>
          ) : undefined
        }
      />

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {data && data.hostels.length === 0 && (
        <EmptyState
          icon={BedDouble}
          title="No hostels yet"
          description={
            session.branches.length === 0
              ? "Create a branch first, then add hostels to it."
              : "Add your first hostel to start modelling rooms and beds."
          }
          action={canCreate ? <Button onClick={() => setOpen(true)}>Add hostel</Button> : undefined}
        />
      )}

      {data && data.hostels.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.hostels.map((hostel) => {
            const occ = data.occupancy.find((o) => o.hostel_id === hostel.id);
            const branch = session.branches.find((b) => b.id === hostel.branch_id);
            return (
              <Link
                key={hostel.id}
                to="/hostels/$hostelId"
                params={{ hostelId: hostel.id }}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{hostel.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {hostel.code} {branch ? `· ${branch.name}` : ""}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {hostel.type}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1.5">
                  <Progress value={Number(occ?.occupancy_rate ?? 0)} />
                  <p className="text-xs text-muted-foreground">
                    {occ?.occupied_beds ?? 0} of {occ?.total_beds ?? 0} beds occupied
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New hostel</DialogTitle>
            <DialogDescription>Hostels belong to a single branch.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={form.branch_id}
                onValueChange={(v) => setForm((f) => ({ ...f, branch_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {session.branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostel-name">Name</Label>
              <Input
                id="hostel-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostel-code">Code</Label>
                <Input
                  id="hostel-code"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, type: v as "boys" | "girls" | "mixed" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boys">Boys</SelectItem>
                    <SelectItem value="girls">Girls</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.name || !form.code || !form.branch_id || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Create hostel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

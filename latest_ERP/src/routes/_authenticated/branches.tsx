import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

import { saveBranch } from "@/lib/foundation.functions";
import { useSession } from "@/hooks/use-session";
import { can } from "@/lib/permissions";
import { PageHeader, EmptyState } from "@/components/data/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

export const Route = createFileRoute("/_authenticated/branches")({
  head: () => ({
    meta: [
      { title: "Branches | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Create and manage the campuses and centres your trust operates, each with scoped data.",
      },
      { property: "og:title", content: "Branches | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Create and manage the campuses and centres your trust operates, each with scoped data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  const { session, roles } = useSession();
  const queryClient = useQueryClient();
  const create = useServerFn(saveBranch);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    trust_id: session.trusts[0]?.id ?? "",
    name: "",
    code: "",
    city: "",
    state: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          trust_id: form.trust_id,
          name: form.name,
          code: form.code.toUpperCase(),
          city: form.city || null,
          state: form.state || null,
        },
      }),
    onSuccess: () => {
      toast.success("Branch created");
      setOpen(false);
      setForm({ ...form, name: "", code: "", city: "", state: "" });
      queryClient.invalidateQueries({ queryKey: ["session-context"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canCreate = can(roles, "branches", "create");
  const hasTrust = session.trusts.length > 0;

  return (
    <>
      <PageHeader
        title="Branches"
        description="Each branch is a separate campus or centre. All records are scoped to a branch."
        actions={
          canCreate && hasTrust ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New branch
            </Button>
          ) : undefined
        }
      />

      {!hasTrust && (
        <EmptyState
          title="Set up your trust first"
          description="A trust owns its branches. Configure it under Trust & branding."
        />
      )}

      {hasTrust && session.branches.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No branches yet"
          description="Add your first branch to begin registering hostels and students."
          action={canCreate ? <Button onClick={() => setOpen(true)}>Add branch</Button> : undefined}
        />
      )}

      {session.branches.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {session.branches.map((branch) => (
            <div key={branch.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{branch.name}</p>
                <p className="text-xs text-muted-foreground">
                  {branch.code}
                  {branch.city ? ` · ${branch.city}` : ""}
                  {branch.state ? `, ${branch.state}` : ""}
                </p>
              </div>
              <Badge variant={branch.is_active ? "secondary" : "outline"}>
                {branch.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New branch</DialogTitle>
            <DialogDescription>Branches belong to your trust.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trust</Label>
              <Select
                value={form.trust_id}
                onValueChange={(v) => setForm((f) => ({ ...f, trust_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trust" />
                </SelectTrigger>
                <SelectContent>
                  {session.trusts.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch-name">Name</Label>
                <Input
                  id="branch-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-code">Code</Label>
                <Input
                  id="branch-code"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-city">City</Label>
                <Input
                  id="branch-city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-state">State</Label>
                <Input
                  id="branch-state"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.name || !form.code || !form.trust_id || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Create branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

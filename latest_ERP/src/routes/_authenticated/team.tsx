import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { UserPlus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import {
  listTeamMembers,
  findUserByEmail,
  grantRole,
  revokeRole,
} from "@/lib/foundation.functions";
import { useSession } from "@/hooks/use-session";
import { ALL_ROLES, ROLE_LABELS, can, type AppRole } from "@/lib/permissions";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/data/states";
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

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Team & roles | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Grant and revoke role-based access for admins, wardens, teachers and accountants.",
      },
      { property: "og:title", content: "Team & roles | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Grant and revoke role-based access for admins, wardens, teachers and accountants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { session, roles } = useSession();
  const queryClient = useQueryClient();
  const fetchTeam = useServerFn(listTeamMembers);
  const lookup = useServerFn(findUserByEmail);
  const grant = useServerFn(grantRole);
  const revoke = useServerFn(revokeRole);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("warden");
  const [branch, setBranch] = useState<string>("");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["team"],
    queryFn: () => fetchTeam({ data: undefined as never }),
  });

  const assign = useMutation({
    mutationFn: async () => {
      const found = await lookup({ data: { email } });
      if (!found.profile) {
        throw new Error("No account found with that email. Ask them to sign up first.");
      }
      return grant({
        data: {
          user_id: found.profile.id,
          role,
          branch_id: branch || null,
          trust_id: session.trusts[0]?.id ?? null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Role assigned");
      setOpen(false);
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => {
      toast.success("Role revoked");
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canManage = can(roles, "users", "manage");

  return (
    <>
      <PageHeader
        title="Team & roles"
        description="Roles decide what each person can see and do. Access is enforced in the database."
        actions={
          canManage ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Assign role
            </Button>
          ) : undefined
        }
      />

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {data && data.roles.length === 0 && (
        <EmptyState
          icon={Users}
          title="No role assignments yet"
          description="Invite colleagues to sign up, then assign them a role here."
        />
      )}

      {data && data.roles.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {data.roles.map((grant) => {
            const profile = data.profiles.find((p) => p.id === grant.user_id);
            const branchName = session.branches.find((b) => b.id === grant.branch_id)?.name;
            return (
              <div key={grant.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {profile?.full_name || profile?.email || "Unknown user"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile?.email}
                    {branchName ? ` · ${branchName}` : " · All branches"}
                  </p>
                </div>
                <Badge variant="secondary">{ROLE_LABELS[grant.role as AppRole]}</Badge>
                {canManage && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Revoke role"
                    onClick={() => remove.mutate(grant.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a role</DialogTitle>
            <DialogDescription>
              The person must already have an account on this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-email">Email</Label>
              <Input
                id="team-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Branch scope</Label>
              <Select
                value={branch || "none"}
                onValueChange={(v) => setBranch(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All branches</SelectItem>
                  {session.branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!email || assign.isPending} onClick={() => assign.mutate()}>
              Assign role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

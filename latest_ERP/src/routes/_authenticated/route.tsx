import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { SessionCtx, useSessionQuery } from "@/hooks/use-session";
import { LoadingState, ErrorState } from "@/components/data/states";
import type { AppRole } from "@/lib/permissions";
import { visibleSections } from "@/components/layout/nav-config";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    if (roleError) throw new Error(`Unable to load access roles: ${roleError.message}`);
    const roles = roleRows.map((row) => row.role) as AppRole[];
    const allowed = visibleSections(roles).flatMap((section) => section.items);
    const allowedPath = allowed.some(
      (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
    );
    if (!allowedPath) {
      const fallback = allowed[0]?.to ?? "/auth";
      if (fallback === "/auth") throw redirect({ to: "/auth" });
      throw redirect({ to: fallback as never });
    }
    return { user: data.user, roles };
  },
  component: AuthenticatedLayout,
});

const BRANCH_KEY = "vistarx.active-branch";

function AuthenticatedLayout() {
  const { data, error, isPending, isError, refetch } = useSessionQuery();
  const [branchId, setBranchIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(BRANCH_KEY);
    if (stored) setBranchIdState(stored);
  }, []);

  function setBranchId(id: string | null) {
    setBranchIdState(id);
    if (id) window.localStorage.setItem(BRANCH_KEY, id);
    else window.localStorage.removeItem(BRANCH_KEY);
  }

  if (isPending) {
    return (
      <div className="min-h-screen p-8">
        <LoadingState label="Preparing your workspace…" />
      </div>
    );
  }

  if (isError || !data) {
    const knownMessage = error instanceof Error ? error.message : "";
    const errorMessage = [
      "Your login is valid, but an ERP account profile has not been configured for this user.",
      "Your ERP account is inactive.",
      "Your ERP account is valid, but no access role has been assigned yet.",
    ].includes(knownMessage)
      ? knownMessage
      : "We couldn't load your account context.";
    return (
      <div className="min-h-screen p-8">
        <ErrorState
          message={errorMessage}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const activeBranch =
    branchId && data.branches.some((b) => b.id === branchId)
      ? branchId
      : data.branches.length === 1
        ? data.branches[0].id
        : null;

  return (
    <SessionCtx.Provider
      value={{
        session: data,
        roles: data.roles as AppRole[],
        branchId: activeBranch,
        setBranchId,
      }}
    >
      <AppShell>
        <Outlet />
      </AppShell>
    </SessionCtx.Provider>
  );
}

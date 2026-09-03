import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createContext, useContext } from "react";
import { getSessionContext } from "@/lib/foundation.functions";
import type { AppRole } from "@/lib/permissions";
import { supabase } from "@/integrations/supabase/client";

export type SessionContext = Awaited<ReturnType<typeof getSessionContext>>;

export function useSessionQuery() {
  const fetchSession = useServerFn(getSessionContext);
  return useQuery({
    queryKey: ["session-context"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error("SESSION_NOT_FOUND");
      if (!data.session?.user) throw new Error("SESSION_NOT_FOUND");

      try {
        return await fetchSession({ data: undefined as never });
      } catch (contextError) {
        // Keep diagnostics useful without ever logging session tokens or credentials.
        const safeError = contextError instanceof Error ? contextError : new Error(String(contextError));
        console.error("[ERP account context]", safeError.name, safeError.message);
        throw contextError;
      }
    },
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}

type SessionValue = {
  session: SessionContext;
  roles: AppRole[];
  branchId: string | null;
  setBranchId: (id: string | null) => void;
};

export const SessionCtx = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used inside the authenticated layout");
  return ctx;
}

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Tables that drive dashboard counters, mapped to the query keys they invalidate. */
const TABLE_QUERIES: Record<string, string[]> = {
  students: ["students", "dashboard-stats", "student-detail", "reports"],
  bed_allocations: ["dashboard-stats", "student-detail", "hostel-detail", "available-beds"],
  beds: ["dashboard-stats", "hostel-detail", "available-beds", "hostels"],
  donations: ["donations", "finance-summary", "finance-dashboard", "dashboard-stats"],
  expenses: ["expenses", "finance-summary", "finance-dashboard", "dashboard-stats"],
  attendance: ["attendance", "dashboard-stats", "student-detail"],
  visitors: ["visitors", "security-stats", "dashboard-stats"],
  student_gate_passes: ["gate-passes", "security-stats", "dashboard-stats"],
  inventory_items: ["inventory", "dashboard-stats"],
  issues: ["issues", "dashboard-stats"],
  leave_requests: ["leave", "dashboard-stats", "student-detail"],
  admissions: ["admissions", "dashboard-stats"],
  student_timeline_events: ["student-detail"],
};

/**
 * One shared realtime channel for the whole app: any insert/update/delete on the
 * operational tables refreshes just the queries that depend on them, so every
 * portal stays live without a page refresh.
 */
export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("hostel360-ops");

    for (const [table, keys] of Object.entries(TABLE_QUERIES)) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        for (const key of keys) {
          void qc.invalidateQueries({ queryKey: [key] });
        }
      });
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
}

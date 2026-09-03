import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAuditLogs } from "@/lib/foundation.functions";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/data/states";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Audit log | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Review every create, update and delete recorded across the hostel operations platform.",
      },
      { property: "og:title", content: "Audit log | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Review every create, update and delete recorded across the hostel operations platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditPage,
});

const TONE: Record<string, "secondary" | "outline" | "destructive"> = {
  INSERT: "secondary",
  UPDATE: "outline",
  DELETE: "destructive",
};

function AuditPage() {
  const fetchLogs = useServerFn(listAuditLogs);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetchLogs({ data: { limit: 100 } }),
  });

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every create, update and delete on core records is captured automatically."
      />

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {data && data.logs.length === 0 && (
        <EmptyState
          title="No activity yet"
          description="Changes will appear here as your team works."
        />
      )}

      {data && data.logs.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {data.logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <Badge
                variant={TONE[log.action] ?? "outline"}
                className="w-16 justify-center text-[10px]"
              >
                {log.action}
              </Badge>
              <span className="font-mono text-xs">{log.table_name}</span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {log.record_id}
              </span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

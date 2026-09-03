import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCheck, Archive, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { listNotifications, updateNotification } from "@/lib/ops-extra.functions";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Live alerts for admissions, leave approvals, medical emergencies, low stock and maintenance across your branch.",
      },
      { property: "og:title", content: "Notifications | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Live alerts for admissions, leave, medical, stock and maintenance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

const TONE: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-accent text-accent-foreground",
  normal: "bg-secondary text-secondary-foreground",
  low: "bg-muted text-muted-foreground",
};

function NotificationsPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const fetchList = useServerFn(listNotifications);
  const update = useServerFn(updateNotification);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["notifications", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const mut = useMutation({
    mutationFn: (input: {
      id?: string;
      markAllRead?: boolean;
      is_read?: boolean;
      is_archived?: boolean;
    }) => update({ data: input }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data?.notifications ?? [];

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Everything that needs your attention, updated live."
        actions={
          <Button
            variant="outline"
            disabled={!data?.unread}
            onClick={() => mut.mutate({ markAllRead: true })}
          >
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Unread" value={data?.unread ?? 0} tone="accent" />
        <StatCard label="Total" value={rows.length} />
        <StatCard
          label="Critical"
          value={rows.filter((r) => r.priority === "critical").length}
          tone="accent"
        />
      </div>

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && (
        <EmptyState
          title="You're all caught up"
          description="New alerts appear here the moment something happens."
        />
      )}

      <div className="space-y-2">
        {rows.map((n) => (
          <Card key={n.id} className={n.is_read ? "opacity-70" : ""}>
            <CardContent className="flex items-start gap-3 p-4">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  <Badge className={TONE[n.priority ?? "normal"] ?? TONE.normal}>
                    {n.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{n.category}</span>
                </div>
                {n.message && <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-1">
                {!n.is_read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => mut.mutate({ id: n.id, is_read: true })}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => mut.mutate({ id: n.id, is_archived: true })}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

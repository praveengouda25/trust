import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, StatCard, LoadingState, ErrorState } from "@/components/data/states";
import { useSession } from "@/hooks/use-session";
import { getSecurityStats } from "@/lib/ops-extra.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, ArrowRightLeft, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/security")({
  beforeLoad: ({ context }) => {
    const roles = context.roles as string[];
    if (!can(roles as any, "security", "view")) {
      throw redirect({
        to: "/dashboard",
        search: { error: "Access denied: Security module requires appropriate permissions" },
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Security Dashboard | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Security operations dashboard with visitor management, gate passes, and security alerts.",
      },
      { property: "og:title", content: "Security Dashboard | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Security operations dashboard with visitor management, gate passes, and security alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const { branchId } = useSession();
  const fetchSecurityStats = useServerFn(getSecurityStats);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["security-stats", branchId],
    queryFn: () => fetchSecurityStats({ data: { branchId } }),
    enabled: !!branchId,
  });

  if (!branchId) {
    return (
      <PageHeader
        title="Security Dashboard"
        description="Select a branch to view security operations."
      />
    );
  }

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const stats = data?.stats || {
    todayVisitors: 0,
    studentsOut: 0,
    studentsReturned: 0,
    lateReturns: 0,
    pendingApprovals: 0,
    unresolvedAlerts: 0,
    totalVisitors: 0,
    totalGatePasses: 0,
    activeVisitors: 0,
    checkedOutVisitors: 0,
    todayGatePasses: 0,
    approvedGatePasses: 0,
    rejectedGatePasses: 0,
  };

  const visitors = data?.visitors || [];
  const gatePasses = data?.gatePasses || [];
  const alerts = data?.logs || [];

  return (
    <>
      <PageHeader
        title="Security Dashboard"
        description="Monitor visitor activity, student gate passes, and security alerts."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Visitors" value={stats.todayVisitors} tone="info" icon={Users} />
        <StatCard
          label="Students Outside"
          value={stats.studentsOut}
          tone="warning"
          icon={ArrowRightLeft}
        />
        <StatCard
          label="Students Returned"
          value={stats.studentsReturned}
          tone="success"
          icon={CheckCircle}
        />
        <StatCard label="Late Returns" value={stats.lateReturns} tone="accent" icon={Clock} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Visitors" value={stats.totalVisitors} tone="info" icon={Users} />
        <StatCard
          label="Active Visitors"
          value={stats.activeVisitors}
          tone="success"
          icon={Shield}
        />
        <StatCard
          label="Today's Gate Passes"
          value={stats.todayGatePasses}
          tone="info"
          icon={ArrowRightLeft}
        />
        <StatCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          tone="warning"
          icon={Clock}
        />
        <StatCard
          label="Unresolved Alerts"
          value={stats.unresolvedAlerts}
          tone="accent"
          icon={AlertTriangle}
        />
        <StatCard
          label="Approved Passes"
          value={stats.approvedGatePasses}
          tone="success"
          icon={CheckCircle}
        />
        <StatCard
          label="Rejected Passes"
          value={stats.rejectedGatePasses}
          tone="destructive"
          icon={AlertTriangle}
        />
        <StatCard
          label="Current Occupancy"
          value={`${stats.studentsReturned}/${stats.studentsOut + stats.studentsReturned}`}
          tone="info"
          icon={Shield}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitors
                .slice(0, 5)
                .map(
                  (v: {
                    id: string;
                    visitor_name: string;
                    purpose: string | null;
                    entry_at: string;
                    status: string;
                  }) => (
                    <div key={v.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{v.visitor_name}</p>
                        <p className="text-xs text-muted-foreground">{v.purpose ?? "—"}</p>
                      </div>
                      <Badge variant={v.status === "checked_in" ? "default" : "secondary"}>
                        {v.status}
                      </Badge>
                    </div>
                  ),
                )}
              {visitors.length === 0 && (
                <p className="text-sm text-muted-foreground">No visitors today</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Gate Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gatePasses
                .slice(0, 5)
                .map(
                  (g: {
                    id: string;
                    gate_pass_number: string | null;
                    purpose: string;
                    out_time: string;
                    status: string;
                  }) => (
                    <div key={g.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {g.gate_pass_number ?? new Date(g.out_time).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{g.purpose}</p>
                      </div>
                      <Badge variant={g.status === "out" ? "default" : "secondary"}>
                        {g.status}
                      </Badge>
                    </div>
                  ),
                )}
              {gatePasses.length === 0 && (
                <p className="text-sm text-muted-foreground">No active gate passes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map(
                (a: {
                  id: string;
                  title: string;
                  description: string | null;
                  alert_level: string;
                }) => (
                  <div key={a.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                    <Badge variant={a.alert_level === "critical" ? "destructive" : "default"}>
                      {a.alert_level}
                    </Badge>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

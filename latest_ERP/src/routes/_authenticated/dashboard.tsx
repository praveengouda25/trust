import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/foundation.functions";
import { getFinanceSummary } from "@/lib/operations.functions";
import { getWardenDashboard } from "@/lib/ops-extra.functions";
import { useSession } from "@/hooks/use-session";
import {
  PageHeader,
  StatCard,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/data/states";
import { money } from "@/components/data/record-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, primaryRole, isStaff } from "@/lib/permissions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Live hostel occupancy, student counts and donation totals for your trust in one operations dashboard.",
      },
      { property: "og:title", content: "Dashboard | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Live hostel occupancy, student counts and donation totals for your trust in one operations dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { session, roles, branchId } = useSession();
  const fetchStats = useServerFn(getDashboardStats);
  const fetchFinance = useServerFn(getFinanceSummary);
  const fetchWardenStats = useServerFn(getWardenDashboard);
  const role = primaryRole(roles);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats", branchId],
    queryFn: () => fetchStats({ data: { branchId } }),
  });

  // Donations and expenses feed straight into the dashboard as they are recorded.
  const finance = useQuery({
    queryKey: ["finance-summary", branchId],
    queryFn: () => fetchFinance({ data: { branchId } }),
  });

  // Warden-specific dashboard stats
  const wardenStats = useQuery({
    queryKey: ["warden-dashboard", branchId],
    queryFn: () => fetchWardenStats({ data: { branchId } }),
    enabled:
      role === "warden" ||
      role === "branch_admin" ||
      role === "trust_admin" ||
      role === "super_admin",
  });

  const name = session.profile?.full_name || session.email || "there";
  const branchName = session.branches.find((b) => b.id === branchId)?.name;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  // Prepare chart data
  const donationTrendData =
    finance.data?.recentDonations?.slice(0, 10).map((d, i) => ({
      name: d.donated_on?.slice(5) || `Day ${i + 1}`,
      donations: Number(d.amount || 0),
    })) || [];

  const incomeExpenseData = [
    { name: "Income", value: finance.data?.donationsTotal || 0 },
    { name: "Expenses", value: finance.data?.expensesTotal || 0 },
  ];

  const monthlyData = [
    { name: "Jan", donations: 12000, expenses: 8000 },
    { name: "Feb", donations: 15000, expenses: 10000 },
    { name: "Mar", donations: 18000, expenses: 12000 },
    { name: "Apr", donations: 14000, expenses: 9000 },
    { name: "May", donations: 20000, expenses: 15000 },
    {
      name: "Jun",
      donations: finance.data?.donationsThisMonth || 0,
      expenses: finance.data?.expensesThisMonth || 0,
    },
  ];

  const donationCategoryData = [
    { name: "General Fund", value: 45 },
    { name: "Education", value: 25 },
    { name: "Infrastructure", value: 15 },
    { name: "Medical", value: 10 },
    { name: "Other", value: 5 },
  ];

  const expenseBreakdownData = [
    { name: "Food", value: 35 },
    { name: "Utilities", value: 20 },
    { name: "Maintenance", value: 15 },
    { name: "Staff", value: 20 },
    { name: "Other", value: 10 },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${name.split(" ")[0]}`}
        description={
          role
            ? `Signed in as ${ROLE_LABELS[role]}${branchName ? ` · ${branchName}` : ""}`
            : `Signed in as ${session.email}`
        }
      />

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Students" value={data.students} />
            <StatCard label="Hostels" value={data.hostels} />
            <StatCard label="Rooms" value={data.rooms} />
            <StatCard
              label="Beds occupied"
              value={`${data.occupiedBeds} / ${data.beds}`}
              tone="accent"
              hint={
                data.beds > 0
                  ? `${Math.round((data.occupiedBeds / data.beds) * 100)}% occupancy`
                  : undefined
              }
            />
          </div>

          {session.branches.length > 1 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Branch-wise statistics</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {session.branches.map((branch) => (
                  <Card key={branch.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{branch.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Students</span>
                        <span className="font-medium">—</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Hostels</span>
                        <span className="font-medium">—</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-medium">—</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {isStaff(roles) && finance.data && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Donations & spend</h2>
                <Link
                  to="/donations"
                  className="text-xs text-accent underline-offset-4 hover:underline"
                >
                  Manage donations
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Donations received"
                  value={money(finance.data.donationsTotal)}
                  tone="success"
                  hint={`${finance.data.donationsCount} gifts recorded`}
                />
                <StatCard
                  label="Donations this month"
                  value={money(finance.data.donationsThisMonth)}
                  tone="success"
                />
                <StatCard
                  label="Expenses"
                  value={money(finance.data.expensesTotal)}
                  tone="accent"
                />
                <StatCard
                  label="Net balance"
                  value={money(finance.data.donationsTotal - finance.data.expensesTotal)}
                  tone="info"
                />
              </div>

              {finance.data.recentDonations.length > 0 && (
                <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                  {finance.data.recentDonations.map((d) => (
                    <div key={d.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.donor_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.donated_on} · {d.purpose ?? "General fund"}
                        </p>
                      </div>
                      <span className="font-mono text-sm tabular-nums text-success">
                        {money(d.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Financial Analytics Charts */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={incomeExpenseData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${money(entry.value)}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {incomeExpenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Monthly Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="donations" fill="#00C49F" name="Donations" />
                        <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Donation Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={donationCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {donationCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={expenseBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {isStaff(roles) && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Occupancy by hostel</h2>
              {data.occupancy.length === 0 ? (
                <EmptyState
                  title="No hostels configured"
                  description="Add a hostel with buildings, floors and rooms to start tracking occupancy."
                />
              ) : (
                <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                  {data.occupancy.map((row) => (
                    <div key={row.hostel_id} className="flex items-center gap-4 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{row.hostel_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.occupied_beds ?? 0} of {row.total_beds ?? 0} beds ·{" "}
                          {row.available_beds ?? 0} available
                        </p>
                      </div>
                      <div className="w-40">
                        <Progress value={Number(row.occupancy_rate ?? 0)} />
                      </div>
                      <span className="w-12 text-right font-mono text-sm tabular-nums">
                        {Math.round(Number(row.occupancy_rate ?? 0))}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Warden-specific widgets */}
          {wardenStats.data &&
            (role === "warden" ||
              role === "branch_admin" ||
              role === "trust_admin" ||
              role === "super_admin") && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Today's operations</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Present today"
                    value={wardenStats.data.presentToday}
                    tone="success"
                  />
                  <StatCard
                    label="Absent today"
                    value={wardenStats.data.absentToday}
                    tone="accent"
                  />
                  <StatCard label="On leave" value={wardenStats.data.onLeaveToday} tone="info" />
                  <StatCard
                    label="Late arrivals"
                    value={wardenStats.data.lateToday}
                    tone="warning"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                  <StatCard
                    label="Visitors inside"
                    value={wardenStats.data.visitorsInside}
                    tone="success"
                  />
                  <StatCard
                    label="Pending leave"
                    value={wardenStats.data.pendingLeave}
                    tone="accent"
                  />
                  <StatCard
                    label="Open complaints"
                    value={wardenStats.data.openComplaints}
                    tone="warning"
                  />
                  <StatCard
                    label="Pending maintenance"
                    value={wardenStats.data.pendingMaintenance}
                    tone="accent"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                  <StatCard
                    label="Available beds"
                    value={wardenStats.data.availableBeds}
                    tone="success"
                  />
                  <StatCard
                    label="Occupied beds"
                    value={wardenStats.data.occupiedBeds}
                    tone="info"
                  />
                  <StatCard
                    label="Low stock items"
                    value={wardenStats.data.lowStock}
                    tone="warning"
                  />
                  <StatCard
                    label="Critical medical"
                    value={wardenStats.data.criticalMedical}
                    tone="destructive"
                  />
                </div>
              </section>
            )}

          {/* Teacher-specific widgets */}
          {role === "teacher" && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Your classroom overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Present today"
                  value={wardenStats.data?.presentToday ?? 0}
                  tone="success"
                />
                <StatCard
                  label="Absent today"
                  value={wardenStats.data?.absentToday ?? 0}
                  tone="accent"
                />
                <StatCard
                  label="On leave"
                  value={wardenStats.data?.onLeaveToday ?? 0}
                  tone="info"
                />
                <StatCard
                  label="Late arrivals"
                  value={wardenStats.data?.lateToday ?? 0}
                  tone="warning"
                />
              </div>
              <div className="mt-4 p-4 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  View detailed attendance and student profiles from the Students and Attendance
                  modules.
                </p>
              </div>
            </section>
          )}

          {/* Student-specific widgets */}
          {role === "student" && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Your profile</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Attendance status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-success">Present</p>
                    <p className="text-xs text-muted-foreground mt-1">Today's status</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Leave balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">—</p>
                    <p className="text-xs text-muted-foreground mt-1">Days remaining</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Meal schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">View in Kitchen & Mess</p>
                    <p className="text-xs text-muted-foreground mt-1">Today's menu</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4 p-4 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  Access your complete profile, attendance history, and hostel details from the
                  Students module.
                </p>
              </div>
            </section>
          )}

          {/* Parent-specific widgets */}
          {role === "parent" && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Your child's overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Attendance status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-success">Present</p>
                    <p className="text-xs text-muted-foreground mt-1">Today's status</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Leave status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">No leave</p>
                    <p className="text-xs text-muted-foreground mt-1">Current status</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Hostel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">View in Students</p>
                    <p className="text-xs text-muted-foreground mt-1">Room details</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4 p-4 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  View your child's complete profile, attendance history, and hostel details from
                  the Students module.
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

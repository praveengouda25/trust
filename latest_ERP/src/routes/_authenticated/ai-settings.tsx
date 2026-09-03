import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, LoadingState, ErrorState } from "@/components/data/states";
import { useSession } from "@/hooks/use-session";
import { getAISettings, saveAISettings } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/ai-settings")({
  head: () => ({
    meta: [
      { title: "AI Settings | VISTARX Hostel360" },
      {
        name: "description",
        content: "Configure AI insights, predictions and automation features.",
      },
      { property: "og:title", content: "AI Settings | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Configure AI insights, predictions and automation features.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AISettingsPage,
});

function AISettingsPage() {
  const { roles, branchId } = useSession();
  const qc = useQueryClient();

  const fetchSettings = useServerFn(getAISettings);
  const save = useServerFn(saveAISettings);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["ai-settings", branchId],
    queryFn: () => fetchSettings({ data: { branchId } }),
    enabled: roles.includes("super_admin"),
  });

  const saveMut = useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
      save({
        data: {
          branch_id: branchId,
          ...settings,
        },
      }),
    onSuccess: () => {
      toast.success("AI settings saved");
      void qc.invalidateQueries({ queryKey: ["ai-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const settings = data?.settings || {
    ai_enabled: false,
    ai_provider: "openai",
    ai_widgets_enabled: false,
    dashboard_insights_enabled: false,
    attendance_prediction_enabled: false,
    inventory_prediction_enabled: false,
    donation_prediction_enabled: false,
    maintenance_prediction_enabled: false,
  };

  if (!roles.includes("super_admin")) {
    return (
      <>
        <PageHeader title="AI Settings" description="Configure AI insights and predictions" />
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              AI settings can only be configured by Super Admins. Contact your Super Admin to enable
              AI features.
            </CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  if (isPending) return <LoadingState />;
  if (isError)
    return (
      <ErrorState
        message="Failed to load AI settings"
        details="Check your Super Admin permissions and try again"
        onRetry={() => void refetch()}
      />
    );

  return (
    <>
      <PageHeader
        title="AI Settings"
        description="Configure AI insights, predictions and automation features"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>
              Enable and configure AI features for your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-enabled">Enable AI Features</Label>
                <p className="text-sm text-muted-foreground">Turn on AI insights and predictions</p>
              </div>
              <Switch
                id="ai-enabled"
                checked={settings.ai_enabled}
                onCheckedChange={(checked) => saveMut.mutate({ ...settings, ai_enabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-provider">AI Provider</Label>
              <select
                id="ai-provider"
                className="w-full p-2 border rounded"
                value={settings.ai_provider}
                onChange={(e) => saveMut.mutate({ ...settings, ai_provider: e.target.value })}
              >
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <p className="text-xs text-muted-foreground">
              Provider credentials are configured as server environment variables and are never stored
              in browser code or database rows.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
            <CardDescription>Toggle specific AI-powered features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-widgets">AI Widgets</Label>
                <p className="text-sm text-muted-foreground">
                  Show AI-powered widgets in dashboard
                </p>
              </div>
              <Switch
                id="ai-widgets"
                checked={settings.ai_widgets_enabled}
                onCheckedChange={(checked) =>
                  saveMut.mutate({ ...settings, ai_widgets_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dashboard-insights">Dashboard Insights</Label>
                <p className="text-sm text-muted-foreground">
                  AI-powered analytics and recommendations
                </p>
              </div>
              <Switch
                id="dashboard-insights"
                checked={settings.dashboard_insights_enabled}
                onCheckedChange={(checked) =>
                  saveMut.mutate({ ...settings, dashboard_insights_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="attendance-prediction">Attendance Prediction</Label>
                <p className="text-sm text-muted-foreground">
                  Predict attendance patterns and anomalies
                </p>
              </div>
              <Switch
                id="attendance-prediction"
                checked={settings.attendance_prediction_enabled}
                onCheckedChange={(checked) =>
                  saveMut.mutate({ ...settings, attendance_prediction_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inventory-prediction">Inventory Prediction</Label>
                <p className="text-sm text-muted-foreground">Predict stock needs and shortages</p>
              </div>
              <Switch
                id="inventory-prediction"
                checked={settings.inventory_prediction_enabled}
                onCheckedChange={(checked) =>
                  saveMut.mutate({ ...settings, inventory_prediction_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="donation-prediction">Donation Prediction</Label>
                <p className="text-sm text-muted-foreground">
                  Predict donation trends and patterns
                </p>
              </div>
              <Switch
                id="donation-prediction"
                checked={settings.donation_prediction_enabled}
                onCheckedChange={(checked) =>
                  saveMut.mutate({ ...settings, donation_prediction_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance-prediction">Maintenance Prediction</Label>
                <p className="text-sm text-muted-foreground">
                  Predict maintenance needs and schedules
                </p>
              </div>
              <Switch
                id="maintenance-prediction"
                checked={settings.maintenance_prediction_enabled}
                onCheckedChange={(checked) =>
                  saveMut.mutate({ ...settings, maintenance_prediction_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

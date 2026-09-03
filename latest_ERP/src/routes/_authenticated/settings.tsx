import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { updateMyProfile } from "@/lib/foundation.functions";
import { updateNotificationPrefs } from "@/lib/modules.functions";
import { useSession } from "@/hooks/use-session";
import { ROLE_LABELS, type AppRole } from "@/lib/permissions";
import { PageHeader } from "@/components/data/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NOTIFICATION_CATEGORIES: { key: string; label: string; hint: string }[] = [
  { key: "admissions", label: "Admissions", hint: "New applications and enrolments" },
  { key: "leave", label: "Leave requests", hint: "Requests raised and decisions taken" },
  { key: "attendance", label: "Attendance", hint: "Absentees and irregular attendance" },
  { key: "visitors", label: "Visitors", hint: "Visitors waiting or checked in" },
  { key: "inventory", label: "Low stock", hint: "Items below their minimum quantity" },
  { key: "medical", label: "Medical alerts", hint: "Critical health records and emergencies" },
  { key: "donations", label: "Donations", hint: "New gifts received" },
  { key: "issues", label: "Issues & maintenance", hint: "New and escalating complaints" },
];

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings | VISTARX Hostel360" },
      {
        name: "description",
        content: "Update your profile, default branch and account preferences.",
      },
      { property: "og:title", content: "Settings | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Update your profile, default branch and account preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { session, roles } = useSession();
  const queryClient = useQueryClient();
  const save = useServerFn(updateMyProfile);
  const [fullName, setFullName] = useState(session.profile?.full_name ?? "");
  const [phone, setPhone] = useState(session.profile?.phone ?? "");
  const savePrefs = useServerFn(updateNotificationPrefs);
  const storedPrefs = (session.profile?.notification_prefs ?? {}) as Record<string, boolean>;
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.key, storedPrefs[c.key] ?? true])),
  );

  const prefsMutation = useMutation({
    mutationFn: () => savePrefs({ data: { prefs } }),
    onSuccess: () => {
      toast.success("Notification preferences saved");
      queryClient.invalidateQueries({ queryKey: ["session-context"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mutation = useMutation({
    mutationFn: () => save({ data: { full_name: fullName, phone: phone || null } }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["session-context"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Settings" description="Your personal profile and access." />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{session.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button disabled={!fullName || mutation.isPending} onClick={() => mutation.mutate()}>
            Save profile
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what you want to be alerted about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIFICATION_CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor={`pref-${c.key}`}>{c.label}</Label>
                <p className="text-xs text-muted-foreground">{c.hint}</p>
              </div>
              <Switch
                id={`pref-${c.key}`}
                checked={prefs[c.key] ?? true}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, [c.key]: v }))}
              />
            </div>
          ))}
          <Button disabled={prefsMutation.isPending} onClick={() => prefsMutation.mutate()}>
            Save preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Your access</CardTitle>
          <CardDescription>
            Roles are stored in Supabase and can be managed from the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No access roles are assigned yet.</p>
          ) : (
            roles.map((r) => (
              <Badge key={r} variant="secondary">
                {ROLE_LABELS[r as AppRole]}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

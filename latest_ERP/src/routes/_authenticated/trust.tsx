import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { saveTrust } from "@/lib/foundation.functions";
import { useSession } from "@/hooks/use-session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/data/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM } from "@/lib/branding";

export const Route = createFileRoute("/_authenticated/trust")({
  head: () => ({
    meta: [
      { title: "Trust & branding | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Configure the trust identity, logo and contact details used across the white-label workspace.",
      },
      { property: "og:title", content: "Trust & branding | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Configure the trust identity, logo and contact details used across the white-label workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrustPage,
});

function TrustPage() {
  const { session, roles } = useSession();
  const queryClient = useQueryClient();
  const save = useServerFn(saveTrust);
  const trust = session.trusts[0] ?? null;

  const [form, setForm] = useState({
    name: trust?.name ?? "",
    display_name: trust?.display_name ?? "",
    slug: trust?.slug ?? "",
    logo_url: trust?.logo_url ?? "",
    contact_email: trust?.contact_email ?? "",
    contact_phone: trust?.contact_phone ?? "",
    address: trust?.address ?? "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          id: trust?.id,
          name: form.name,
          display_name: form.display_name || form.name,
          slug: form.slug.toLowerCase(),
          logo_url: form.logo_url || null,
          contact_email: form.contact_email || null,
          contact_phone: form.contact_phone || null,
          address: form.address || null,
        },
      }),
    onSuccess: () => {
      toast.success(trust ? "Trust updated" : "Trust created");
      queryClient.invalidateQueries({ queryKey: ["session-context"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editable = can(roles, "branding", "edit");

  return (
    <>
      <PageHeader
        title="Trust & branding"
        description={`${PLATFORM.name} is white-label: the trust name and logo below appear throughout the workspace.`}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{trust ? "Trust details" : "Set up your trust"}</CardTitle>
          <CardDescription>
            The trust owns every branch, hostel and student record in this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trust-name">Registered name</Label>
              <Input
                id="trust-name"
                disabled={!editable}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trust-display">Display name</Label>
              <Input
                id="trust-display"
                disabled={!editable}
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trust-slug">Slug</Label>
              <Input
                id="trust-slug"
                disabled={!editable}
                placeholder="my-trust"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trust-logo">Logo URL</Label>
              <Input
                id="trust-logo"
                disabled={!editable}
                value={form.logo_url}
                onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trust-email">Contact email</Label>
              <Input
                id="trust-email"
                type="email"
                disabled={!editable}
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trust-phone">Contact phone</Label>
              <Input
                id="trust-phone"
                disabled={!editable}
                value={form.contact_phone}
                onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="trust-address">Address</Label>
            <Input
              id="trust-address"
              disabled={!editable}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          {editable && (
            <Button
              disabled={!form.name || !form.slug || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {trust ? "Save changes" : "Create trust"}
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}

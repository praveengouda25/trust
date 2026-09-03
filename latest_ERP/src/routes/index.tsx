import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BedDouble, ShieldCheck, Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PLATFORM } from "@/lib/branding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VISTARX Hostel360 — Hostel & student ERP for NGO trusts" },
      {
        name: "description",
        content:
          "Multi-branch hostel, student and welfare operations software for NGO trusts: bed allocation, admissions, roles and audit-ready records.",
      },
      { property: "og:title", content: "VISTARX Hostel360 — Hostel & student ERP for NGO trusts" },
      {
        property: "og:description",
        content:
          "Run every branch, hostel, room and bed from one audit-ready platform built for NGO trusts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Building2,
    title: "Multi-branch by design",
    body: "Every record is scoped to a branch, so trusts running many campuses share one system without mixing data.",
  },
  {
    icon: BedDouble,
    title: "Hostel to bed level",
    body: "Model buildings, floors, rooms and individual beds, and see live occupancy at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    body: "Nine roles from trust admin to guardian, enforced in the database — not just hidden in the interface.",
  },
  {
    icon: Users,
    title: "Student-centred records",
    body: "Admissions, guardians, documents and timeline events kept together for each student.",
  },
];

function Landing() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight">{PLATFORM.name}</span>
          <Button asChild size="sm">
            <Link to={signedIn ? "/dashboard" : "/auth"}>
              {signedIn ? "Open workspace" : "Sign in"}
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          NGO trust operations
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Every branch, hostel and student in one accountable system.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground">
          {PLATFORM.tagline}. Built for trusts that need clean records, clear responsibilities and
          reporting they can stand behind.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to={signedIn ? "/dashboard" : "/auth"}>
              {signedIn ? "Go to dashboard" : "Get started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-6">
              <f.icon className="h-5 w-5 text-accent" />
              <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground">
          {PLATFORM.name} · Powered by {PLATFORM.vendor}
        </div>
      </footer>
    </div>
  );
}

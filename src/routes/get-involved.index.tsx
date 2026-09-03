import { createFileRoute, Link } from "@tanstack/react-router";
import { HandHeart, HeartHandshake, IdCard, Building2, ArrowRight } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/images";

const paths = [
  {
    to: "/request-help",
    label: "Request Help",
    body: "If you or a family you know needs education, health or food support, tell us and our team will reach out.",
    Icon: HandHeart,
  },
  {
    to: "/volunteer-registration",
    label: "Volunteer With Us",
    body: "Give time, skills or presence in the field. Volunteers run most of what we do on the ground.",
    Icon: HeartHandshake,
  },
  {
    to: "/get-involved/membership",
    label: "Become a Member",
    body: "Join as a member and support programmes continuously through the year.",
    Icon: IdCard,
  },
  {
    to: "/corporate-partnership",
    label: "Corporate Partnership",
    body: "Partner with us on CSR programmes with clear reporting and measurable outcomes.",
    Icon: Building2,
  },
] as const;

export const Route = createFileRoute("/get-involved/")({
  head: () => ({
    meta: [
      { title: "Get Involved — Volunteer, Member or Partner | SVRST Trust" },
      {
        name: "description",
        content:
          "Volunteer, become a member, request help or start a corporate partnership with SVRST Trust. Every role helps children and families.",
      },
      { property: "og:title", content: "Get Involved with SVRST Trust" },
      {
        property: "og:description",
        content: "Volunteer, become a member, request help or partner with SVRST Trust.",
      },
      { property: "og:url", content: "/get-involved" },
    ],
    links: [{ rel: "canonical", href: "/get-involved" }],
  }),
  component: GetInvolvedIndex,
});

function GetInvolvedIndex() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="There is a place here for you"
        subtitle="Whether you have time, skills, resources or a need — start here."
        image={images.volunteers}
        imageAlt="Volunteers preparing support materials for children"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Four ways to join"
            title="Choose how you want to take part"
            description="Each route has a short form. We reply to every submission."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {paths.map((p, i) => (
              <Reveal key={p.to} delay={i * 80} className="h-full">
                <article className="group flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-lift">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <p.Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{p.label}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                  <Button asChild variant="outline" className="mt-6 self-start">
                    <Link to={p.to}>
                      {p.label}
                      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <SectionHeading
            eyebrow="Prefer to give"
            title="A donation reaches a child this month"
            description="Donations fund school materials, health camps, meals and skills training."
          >
            <Button asChild variant="donate" size="lg">
              <Link to="/donate" search={{ cause: "general" }}>
                Donate Now
              </Link>
            </Button>
          </SectionHeading>
        </div>
      </section>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { org, whyTrustUs, PLACEHOLDER } from "@/data/site";
import { getIcon } from "@/lib/icon-map";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/svrst-trust")({
  head: () => ({
    meta: [
      { title: "About SVRST Trust — Who We Are" },
      {
        name: "description",
        content:
          "SVRST Trust is a community-led non-profit working on education, healthcare, nutrition and skills for children and their families.",
      },
      { property: "og:title", content: "About SVRST Trust — Who We Are" },
      { property: "og:description", content: "A community-led non-profit for children and families." },
    ],
  }),
  component: AboutTrust,
});

function AboutTrust() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="SVRST Trust"
        subtitle="A community-led trust working so that a child's circumstances never decide their future."
        image={images.community}
        imageAlt="Community gathering supported by SVRST Trust"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <p className="eyebrow text-accent">Our story</p>
            <h2 className="mt-3 text-3xl leading-[1.1] sm:text-4xl">Started by volunteers, sustained by community</h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>{org.mission}</p>
              <p>
                What began as a small group of volunteers helping children stay in school has grown into structured
                programmes across education, healthcare, nutrition and skills training. {PLACEHOLDER}
              </p>
              <p>
                Every programme is planned with the families it serves, delivered by local volunteers, and reviewed
                against what actually changed for the children involved.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/about/mission">Mission &amp; Vision</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/get-involved/volunteer">Volunteer With Us</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <img
              src={images.education}
              alt="Children in an SVRST Trust learning programme"
              width={1600}
              height={1000}
              loading="lazy"
              className="w-full rounded-3xl object-cover shadow-lift"
            />
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-accent">Registration</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{org.registration}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-accent">Working hours</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{org.hours}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why trust us" title="Accountable in the details" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyTrustUs.map((item, i) => (
              <FeatureCard key={item.title} title={item.title} body={item.body} Icon={getIcon(item.icon)} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

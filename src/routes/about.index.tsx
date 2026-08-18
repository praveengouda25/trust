import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { coreValues, org } from "@/data/site";
import { getIcon } from "@/lib/icon-map";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/")({
  head: () => ({
    meta: [
      { title: "About Us — SVRST Trust" },
      {
        name: "description",
        content:
          "Learn about SVRST Trust: our story, mission, values, team and the children and families we support every day.",
      },
      { property: "og:title", content: "About SVRST Trust" },
      { property: "og:description", content: "Our story, mission, values and team." },
    ],
  }),
  component: AboutIndex,
});

const links = [
  { label: "About SVRST Trust", to: "/about/svrst-trust", body: "Who we are and how we work with communities." },
  { label: "Mission & Vision", to: "/about/mission", body: "What we are working towards and why." },
  { label: "Our Journey", to: "/about/journey", body: "Milestones from our first initiative to today." },
  { label: "Our Team", to: "/about/team", body: "The trustees, staff and volunteers behind the work." },
  { label: "Achievements", to: "/about/achievements", body: "Recognitions and programme milestones." },
];

function AboutIndex() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A trust built around children and their futures"
        subtitle={org.mission}
        image={images.education}
        imageAlt="Children learning in a classroom supported by SVRST Trust"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Explore" title="Get to know SVRST Trust" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((item, i) => (
              <div
                key={item.to}
                className="rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <h3 className="font-display text-xl font-semibold">{item.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                <Button asChild variant="outline" className="mt-6">
                  <Link to={item.to as never}>
                    Read more <ArrowRight />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Core values" title="The principles we hold to" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, i) => (
              <FeatureCard key={value.title} title={value.title} body={value.body} Icon={getIcon(value.icon)} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

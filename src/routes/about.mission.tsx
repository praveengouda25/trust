import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { coreValues, org } from "@/data/site";
import { getIcon } from "@/lib/icon-map";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/mission")({
  head: () => ({
    meta: [
      { title: "Mission & Vision — SVRST Trust" },
      {
        name: "description",
        content:
          "Our mission is to widen access to education, health, nutrition and skills for children. Our vision is a community where opportunity is not decided by circumstance.",
      },
      { property: "og:title", content: "Mission & Vision — SVRST Trust" },
      { property: "og:description", content: "What SVRST Trust is working towards, and the values behind it." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <>
      <PageHero
        eyebrow="Mission & vision"
        title="Opportunity should never depend on circumstance"
        subtitle="Clear purpose, measurable progress, and a long-term commitment to the children we work with."
        image={images.food}
        imageAlt="Children receiving nutritious meals"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-soft">
              <span className="grid size-12 place-items-center rounded-2xl gradient-navy text-primary-foreground">
                <Target className="size-5" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold">Our Mission</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{org.mission}</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-soft">
              <span className="grid size-12 place-items-center rounded-2xl gradient-leaf text-leaf-foreground">
                <Eye className="size-5" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold">Our Vision</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                A community where every child learns, eats well, stays healthy and grows up with real choices — supported
                by families and neighbours who have the means to help.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Core values" title="How we make decisions" />
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

import { createFileRoute } from "@tanstack/react-router";
import { Award, Trophy } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { ImpactCounter } from "@/components/ImpactCounter";
import { achievements, recognitions, impactStats } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/achievements")({
  head: () => ({
    meta: [
      { title: "Our Achievements — SVRST Trust" },
      {
        name: "description",
        content:
          "Programme milestones, community recognition and measured impact from SVRST Trust's work with children and families.",
      },
      { property: "og:title", content: "Our Achievements — SVRST Trust" },
      { property: "og:description", content: "Milestones, recognitions and measured impact." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="Progress we can point to"
        subtitle="Milestones, recognitions and the numbers behind our programmes."
        image={images.healthcare}
        imageAlt="Child being checked at a community health camp"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 90}>
                <ImpactCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Milestones" title="Programme achievements" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {achievements.map((item, i) => (
              <Reveal key={item.title} delay={i * 80} className="h-full">
                <article className="h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                    <Trophy className="size-5" />
                  </span>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-accent">{item.meta}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Recognition" title="Certificates & appreciation" />
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {recognitions.map((item, i) => (
              <Reveal key={`${item.title}-${i}`} delay={i * 80} className="h-full">
                <div className="h-full rounded-3xl border border-border bg-card p-7 text-center shadow-soft">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl gradient-navy text-primary-foreground">
                    <Award className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.issuer}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.year}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

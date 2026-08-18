import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { timeline } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/journey")({
  head: () => ({
    meta: [
      { title: "Our Journey — SVRST Trust" },
      {
        name: "description",
        content:
          "The SVRST Trust timeline: from our first neighbourhood initiatives to today's education, health, nutrition and skills programmes for children.",
      },
      { property: "og:title", content: "Our Journey — SVRST Trust" },
      { property: "og:description", content: "Milestones in the SVRST Trust story." },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  return (
    <>
      <PageHero
        eyebrow="Our journey"
        title="Milestones, year by year"
        subtitle="Every step here came from a community need and the volunteers who answered it."
        image={images.community}
        imageAlt="Volunteers working with children in the community"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading align="left" eyebrow="Timeline" title="How the work grew" />
          <ol className="relative mt-14 space-y-10 border-l border-border pl-8">
            {timeline.map((item, i) => (
              <Reveal key={`${item.title}-${i}`} delay={i * 60}>
                <li className="relative">
                  <span className="absolute -left-[41px] top-1.5 grid size-4 place-items-center rounded-full bg-accent ring-4 ring-background" />
                  <p className="eyebrow text-accent">{item.year}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  {"challenge" in item && item.challenge && (
                    <dl className="mt-4 grid gap-3 rounded-2xl bg-secondary/70 p-5 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="font-semibold text-foreground">Challenge</dt>
                        <dd className="mt-1 text-muted-foreground">{item.challenge}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-foreground">Response</dt>
                        <dd className="mt-1 text-muted-foreground">{item.response}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-foreground">Impact</dt>
                        <dd className="mt-1 text-muted-foreground">{item.impact}</dd>
                      </div>
                    </dl>
                  )}
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

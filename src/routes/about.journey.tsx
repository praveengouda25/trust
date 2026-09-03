import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { timeline } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/journey")({
  head: () => ({
    meta: [
      { title: "Our Journey — SVRST" },
      { name: "description", content: "The story and continuing journey of SVRST." },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  return (
    <>
      <PageHero
        eyebrow="Our journey"
        title="A story still being written"
        subtitle="Care, learning and community built one day at a time."
        image={images.eventWalk}
        imageAlt="SVRST community activity"
      />
      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-primary/20 border-y border-primary/20">
            {timeline.map((item, index) => (
              <Reveal key={item.title} delay={Math.min(index * 45, 300)}>
                <article className="grid gap-5 py-9 sm:grid-cols-[180px_1fr] sm:gap-12">
                  <p className="eyebrow pt-1 text-accent">{item.year}</p>
                  <div>
                    <h2 className="text-3xl sm:text-4xl">{item.title}</h2>
                    <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { CauseCard, StoryCard } from "@/components/cards";
import { causes, stories } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Our Work — Education, Health, Food & Skills" },
      {
        name: "description",
        content:
          "SVRST Trust runs four programmes for children and families: education support, healthcare camps, food and nutrition, and skills for women and girls.",
      },
      { property: "og:title", content: "Our Work — SVRST Trust Programmes" },
      { property: "og:description", content: "Education, healthcare, food support and skills programmes." },
    ],
  }),
  component: WorkIndex,
});

function WorkIndex() {
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Four programmes, built around children"
        subtitle="Learning, health, nutrition and skills — delivered together, because a child's needs do not arrive one at a time."
        image={images.education}
        imageAlt="Children studying in a supported classroom"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {causes.map((cause, i) => (
              <CauseCard key={cause.slug} cause={cause} delay={i * 90} showDonate />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Success stories"
            title="What changed for the families we walk with"
            description="Shared with consent and kept respectful of privacy."
          />
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {stories.map((story, i) => (
              <StoryCard key={story.name} story={story} delay={i * 90} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

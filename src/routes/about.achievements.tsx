import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { achievements } from "@/data/site";
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
  const journey = achievements.map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(2, "0"),
    image: [images.achievements, images.storyStudent, images.eventWalk, images.storyFamily][index],
  }));

  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="Progress we can point to"
        subtitle="Milestones, recognitions and the numbers behind our programmes."
        image={images.healthcare}
        imageAlt="Child being checked at a community health camp"
      />

      <section className="bg-secondary/50 py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <p className="eyebrow text-accent">The journey</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-6xl">
              Small steps, shared milestones.
            </h2>
          </div>
          <div className="divide-y divide-primary/20 border-y border-primary/20">
            {journey.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <article className="grid gap-8 py-12 lg:grid-cols-[96px_1fr_0.8fr] lg:items-center lg:gap-12">
                  <p className="font-display text-5xl text-accent">{item.number}</p>
                  <div>
                    <p className="eyebrow text-accent">{item.meta}</p>
                    <h3 className="mt-3 text-3xl sm:text-4xl">{item.title}</h3>
                    <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                  <img
                    src={item.image}
                    alt=""
                    width={640}
                    height={400}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { org } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/")({
  head: () => ({
    meta: [
      { title: "About Us — SVRST" },
      {
        name: "description",
        content:
          "Learn about SVRST: our story, mission, values and the children we support every day through education, dhyana, yoga, sports and values.",
      },
      { property: "og:title", content: "About SVRST" },
      { property: "og:description", content: "Our story, mission, values and programmes." },
    ],
  }),
  component: AboutIndex,
});

function AboutIndex() {
  const focusAreas = [
    ["01", "Education", "Academic support, curiosity and the confidence to keep learning."],
    ["02", "Dhyana", "Stillness and mindfulness that help children feel grounded."],
    ["03", "Yoga & sport", "Movement, discipline and the joy of growing stronger together."],
    ["04", "Values", "Respect, compassion and character woven into everyday life."],
  ];

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A Trust Built Around Children and Their Futures"
        subtitle={org.mission}
        image={images.educationClassroom}
        imageAlt="Children learning at SVRST"
      />

      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-accent">Our story</p>
              <p className="mt-8 font-display text-5xl leading-none text-primary sm:text-7xl">01</p>
              <div className="mt-8 h-px w-20 bg-accent" />
            </Reveal>
            <Reveal delay={120}>
              <h2 className="max-w-4xl text-4xl leading-[1.05] text-foreground sm:text-6xl">
                Nurturing children with dignity and consistency.
              </h2>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                SVRST began with a simple commitment: to provide children with a nurturing environment where they can grow with dignity, confidence and purpose.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Today, education, dhyana, yoga, sports and values-based learning meet in one child-focused environment. The result is not only academic progress, but character, discipline, inner peace and physical fitness.
              </p>
            </Reveal>
          </div>
          <Reveal delay={180} className="mt-20 sm:mt-28">
            <div className="relative ml-auto max-w-5xl lg:pr-16">
              <img src={images.ourStory} alt="Children growing together at SVRST" width={1200} height={700} className="aspect-[16/9] w-full object-cover" />
              <p className="mt-5 max-w-xs text-xs uppercase tracking-[0.18em] text-muted-foreground lg:absolute lg:-right-1 lg:bottom-0 lg:rotate-90 lg:origin-bottom-left">
                A place to learn, reflect and grow
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/50 py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-accent">Our approach</p>
              <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">The whole child, every day.</h2>
              <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">We make room for the mind, body and spirit to develop together.</p>
            </Reveal>
            <div>
              {focusAreas.map(([number, title, body], i) => (
                <Reveal key={title} delay={i * 90}>
                  <div className="grid gap-4 border-t border-primary/20 py-7 sm:grid-cols-[72px_0.7fr_1fr] sm:items-baseline sm:gap-8">
                    <span className="font-display text-2xl text-accent">{number}</span>
                    <h3 className="font-display text-2xl text-foreground">{title}</h3>
                    <p className="max-w-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </Reveal>
              ))}
              <div className="border-t border-primary/20" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 border-t border-primary/20 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-accent">Continue exploring</p>
              <h2 className="mt-4 text-4xl sm:text-5xl">The work in closer view.</h2>
            </div>
            <p className="max-w-sm text-muted-foreground">Follow the ideas, people and milestones that shape SVRST.</p>
          </div>
          <div className="mt-12 divide-y divide-primary/20 border-y border-primary/20">
            {[
              { label: "About SVRST", to: "/about/svrst-trust", body: "Who we are and how we work with communities." },
              { label: "Mission & Vision", to: "/about/mission", body: "What we are working towards and why." },
              { label: "Achievements", to: "/about/achievements", body: "Recognitions and programme milestones." },
            ].map((item, i) => (
              <Reveal key={item.to} delay={i * 100}>
                <div className="grid gap-4 py-7 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-8">
                  <h3 className="font-display text-2xl">{item.label}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  <Button asChild variant="ghost" className="w-fit px-0 text-primary hover:bg-transparent">
                    <Link to={item.to as never}>
                      Read more <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

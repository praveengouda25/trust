import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, Users, HandHeart } from "lucide-react";

import { HeroSlider } from "@/components/HeroSlider";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { ImpactCounter } from "@/components/ImpactCounter";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CauseCard, StoryCard, FeatureCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { causes, impactStats, whyTrustUs, stories, org } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SVRST Trust — Real People. Real Impact. Real Change." },
      {
        name: "description",
        content:
          "SVRST Trust supports communities through education, healthcare, food support and women empowerment. Donate, volunteer, or request help today.",
      },
      { property: "og:title", content: "SVRST Trust — Real People. Real Impact." },
      {
        property: "og:description",
        content: "Education, healthcare, food support and women empowerment programmes with measurable community impact.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSlider />

      {/* Impact numbers */}
      <section className="relative overflow-hidden bg-secondary/40 py-16 sm:py-20">
        <AnimatedBackground variant="grid" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <ImpactCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Who we are"
            title="Support that begins with listening"
            description={org.mission}
          >
            <Button asChild size="lg">
              <Link to="/about/svrst-trust">
                About SVRST Trust <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about/mission">Our Mission & Vision</Link>
            </Button>
          </SectionHeading>
        </div>
      </section>

      {/* Causes */}
      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our work"
            title="Four focus areas, one shared goal"
            description="Each programme is designed with the community it serves, and measured by what actually changes for families."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {causes.map((cause, i) => (
              <CauseCard key={cause.slug} cause={cause} delay={i * 90} showDonate />
            ))}
          </div>
        </div>
      </section>

      {/* Why trust us */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why trust us" title="Accountable in the details" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyTrustUs.map((item, i) => (
              <FeatureCard key={item.title} title={item.title} body={item.body} icon={item.icon} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Success stories"
            title="Change, one household at a time"
            description="Names and details are shared with consent and kept respectful of privacy."
          />
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {stories.slice(0, 2).map((story, i) => (
              <StoryCard key={story.name} story={story} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* Get involved */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Get involved" title="There is a way for everyone to help" />
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { title: "Donate", body: "Fund meals, learning materials, health camps and skills training.", to: "/donate", icon: HandHeart },
              { title: "Volunteer", body: "Give your time and skills alongside our community teams.", to: "/get-involved/volunteer", icon: Users },
              { title: "Partner", body: "Bring your organisation's CSR into long-term community work.", to: "/get-involved/corporate-partnership", icon: HeartHandshake },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
                  <span className="grid size-12 place-items-center rounded-2xl gradient-navy text-primary-foreground">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  <Button asChild variant="outline" className="mt-6 self-start">
                    <Link to={item.to as never}>
                      Learn more <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Donation CTA */}
      <section className="relative isolate overflow-hidden gradient-navy py-20 sm:py-28">
        <AnimatedBackground variant="orbs" className="text-primary-foreground" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading
            tone="dark"
            eyebrow="Your support matters"
            title="A small monthly gift changes a child's whole year"
            description="Every contribution goes into programme delivery — meals, learning support, health camps and skills training."
          >
            <Button asChild variant="donate" size="xl">
              <Link to="/donate">Donate Now</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/get-involved/membership">Become a Member</Link>
            </Button>
          </SectionHeading>
        </div>
      </section>
    </>
  );
}

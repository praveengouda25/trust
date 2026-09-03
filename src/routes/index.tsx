import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { HeroSlider } from "@/components/HeroSlider";
import { VideoSection } from "@/components/VideoSection";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { org } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mathrudhama Children's Home — SVRST" },
      {
        name: "description",
        content:
          "Mathrudhama Children's Home — SVRST provides children with a nurturing environment focused on education, yoga, wellness, values and character development.",
      },
      { property: "og:title", content: "Mathrudhama Children's Home — SVRST" },
      {
        property: "og:description",
        content:
          "Education, yoga, wellness, values and character development for children at Mathrudhama Children's Home.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSlider />

      {/* Education Section - Editorial Design */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={images.educationReading}
                  alt="Students learning in classroom at SVRST"
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
            </Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Education"
                title="Education That Shapes More Than a Career"
                description="Learning support, school materials, coaching and mentoring so children stay in education and progress with confidence."
              />
              <Reveal delay={200} className="mt-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  We believe education is the foundation for confidence, choice and a brighter
                  future. Our approach goes beyond academics to cultivate critical thinking,
                  creativity and character.
                </p>
              </Reveal>
              <Reveal delay={300} className="mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to="/education">
                    Learn More <ArrowRight />
                  </Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Yoga Section - Image-Led Horizontal */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <SectionHeading
                align="left"
                eyebrow="Yoga & Wellness"
                title="Balance. Discipline. Mind-Body Connection"
                description="Yoga practice for physical flexibility, mental clarity, discipline and healthy lifestyle."
              />
              <Reveal delay={200} className="mt-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Yoga is integral to our approach to child development. Through regular practice,
                  students develop physical fitness, mental clarity, and the discipline that serves
                  them in all aspects of life.
                </p>
              </Reveal>
              <Reveal delay={300} className="mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to="/dhyana-yoga">
                    Learn More <ArrowRight />
                  </Link>
                </Button>
              </Reveal>
            </div>
            <Reveal className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={images.yogaMeditation}
                  alt="Students practicing yoga at SVRST"
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values Section - Editorial */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={images.culturalActivity}
                  alt="Students learning values and culture at SVRST"
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
            </Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Values & Culture"
                title="Rooted in Values. Grounded in Culture."
                description="Devotional learning, Indian cultural values, respect, compassion, gratitude and self-awareness."
              />
              <Reveal delay={200} className="mt-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  We nurture character alongside academics. Through cultural learning, devotional
                  practices and value-based education, children develop respect, compassion,
                  gratitude and self-awareness.
                </p>
              </Reveal>
              <Reveal delay={300} className="mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to="/about/mission">
                    Explore Our Mission <ArrowRight />
                  </Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Our Story"
                title="A Trust Built Around Children and Their Futures"
                description={org.mission}
              />
              <Reveal delay={200} className="mt-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  SVRST began with a simple commitment: to provide children with a nurturing
                  environment where they could grow with dignity, confidence and purpose. Today, we
                  continue that mission through education, dhyana, yoga, sports and values-based
                  learning.
                </p>
              </Reveal>
              <Reveal delay={300} className="mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to="/about/svrst-trust">
                    Read Our Story <ArrowRight />
                  </Link>
                </Button>
              </Reveal>
            </div>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={images.ourStory}
                  alt="Our story at SVRST"
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <VideoSection />

      {/* Achievements Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="center"
            eyebrow="Achievements"
            title="Celebrating Growth and Success"
            description="Academic achievements, sports accomplishments, cultural participation and personal development milestones."
          />
          <Reveal delay={200} className="mt-12">
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={images.achievements}
                alt="Student achievements at SVRST"
                width={1200}
                height={600}
                className="w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={300} className="mt-8 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/about/achievements">
                View Achievements <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="relative isolate overflow-hidden gradient-forest py-20 sm:py-28">
        <AnimatedBackground variant="orbs" className="text-primary-foreground" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading
            tone="dark"
            eyebrow="Join Our Community"
            title="Be Part of Something Meaningful"
            description="Register to learn more about SVRST programmes, volunteer opportunities, or to request support."
          >
            <Button asChild variant="leaf" size="xl">
              <Link to="/donate">Donate Now</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/volunteer-registration">Volunteer</Link>
            </Button>
          </SectionHeading>
        </div>
      </section>
    </>
  );
}

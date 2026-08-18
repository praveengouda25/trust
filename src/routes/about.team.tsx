import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { TeamCard } from "@/components/cards";
import { team } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/team")({
  head: () => ({
    meta: [
      { title: "Our Team — SVRST Trust" },
      {
        name: "description",
        content:
          "Meet the trustees, programme leads and volunteer coordinators who run SVRST Trust's programmes for children and families.",
      },
      { property: "og:title", content: "Our Team — SVRST Trust" },
      { property: "og:description", content: "Trustees, programme leads and volunteers behind SVRST Trust." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Our team"
        title="The people behind the programmes"
        subtitle="Trustees, programme leads and volunteers who show up week after week."
        image={images.women}
        imageAlt="Mentor guiding girls in a skills workshop"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Leadership & volunteers" title="Accountable, local, and hands-on" />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <TeamCard key={`${member.role}-${i}`} member={member} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { EventCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { events } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/events/past")({
  head: () => ({
    meta: [
      { title: "Past Events & Their Impact | SVRST Trust" },
      {
        name: "description",
        content:
          "A record of SVRST Trust meal drives, orientations and awareness walks already held, with a short impact summary for each event.",
      },
      { property: "og:title", content: "Past SVRST Trust Events" },
      { property: "og:description", content: "Events already held and what each one achieved." },
      { property: "og:url", content: "/events/past" },
    ],
    links: [{ rel: "canonical", href: "/events/past" }],
  }),
  component: PastEvents,
});

function PastEvents() {
  const past = events.filter((e) => e.status === "past");

  return (
    <>
      <PageHero
        eyebrow="Past events"
        title="What we have already done"
        subtitle="Each entry carries a short summary of what the event delivered."
        image={images.foodKitchen}
        imageAlt="Volunteers cooking meals in a community kitchen"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Archive" title="Completed events" />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event, i) => (
              <EventCard key={event.slug} event={event} delay={i * 80} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="donate" size="lg">
              <Link to="/donate" search={{ cause: "general" }}>
                Fund the Next Event
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

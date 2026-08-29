import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { EventCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { events } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — Camps, Drives & Workshops | SVRST Trust" },
      {
        name: "description",
        content:
          "See upcoming and past SVRST Trust events: health camps, school kit distributions, meal drives and skills workshops. Register to take part.",
      },
      { property: "og:title", content: "SVRST Trust Events" },
      { property: "og:description", content: "Upcoming and past community events, camps and workshops." },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsIndex,
});

function EventsIndex() {
  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Where the work happens"
        subtitle="Camps, drives and workshops run through the year — most of them open to volunteers."
        image={images.eventWalk}
        imageAlt="Community members taking part in an awareness walk"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/events/upcoming">Upcoming Events</Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="/events/gallery">Events Gallery</Link>
          </Button>
        </div>
      </PageHero>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Coming up" title="Upcoming events" description="Register to join as a participant or volunteer." />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <EventCard key={event.slug} event={event} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Already held" title="Past events" description="What we ran recently and what it achieved." />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event, i) => (
              <EventCard key={event.slug} event={event} delay={i * 80} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/events/past">View all past events</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

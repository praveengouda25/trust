import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { EventCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { events } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/events/upcoming")({
  head: () => ({
    meta: [
      { title: "Upcoming Events — Register to Join | SVRST Trust" },
      {
        name: "description",
        content:
          "Upcoming SVRST Trust health camps, school kit distributions and skills workshops. See dates, places available and register online.",
      },
      { property: "og:title", content: "Upcoming SVRST Trust Events" },
      {
        property: "og:description",
        content: "Dates, locations and registration for our next community events.",
      },
      { property: "og:url", content: "/events/upcoming" },
    ],
    links: [{ rel: "canonical", href: "/events/upcoming" }],
  }),
  component: UpcomingEvents,
});

function UpcomingEvents() {
  const upcoming = events.filter((e) => e.status === "upcoming");

  return (
    <>
      <PageHero
        eyebrow="Upcoming events"
        title="Join us at our next event"
        subtitle="Registration is free. Places are limited for camps and workshops."
        image={images.eventKits}
        imageAlt="Kits prepared ahead of a distribution event"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Open for registration" title="What's coming up" />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <EventCard key={event.slug} event={event} delay={i * 80} />
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Button asChild variant="leaf" size="lg">
              <Link to="/events/register" search={{ event: upcoming[0]?.slug ?? "" }}>
                Register for an Event
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/volunteer-registration">Volunteer at an Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

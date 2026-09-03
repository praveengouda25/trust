import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { events } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — Camps, Workshops & Activities | SVRST" },
      {
        name: "description",
        content:
          "See upcoming and past SVRST events: sports day, dhyana camps, yoga workshops and cultural celebrations. Register to take part.",
      },
      { property: "og:title", content: "SVRST Events" },
      {
        property: "og:description",
        content: "Upcoming and past community events, camps and workshops.",
      },
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
        title="Where the Work Happens"
        subtitle="Camps, workshops and activities run through the year — most of them open to volunteers."
        image={images.eventWalk}
        imageAlt="Community members taking part in activities"
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
          <SectionHeading
            eyebrow="Coming Up"
            title="Upcoming Events"
            description="Register to join as a participant or volunteer."
          />
          <div className="mt-14 space-y-8">
            {upcoming.map((event, i) => (
              <Reveal key={event.slug} delay={i * 100}>
                <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:gap-12 items-start">
                  <div className="lg:sticky lg:top-8">
                    <div className="rounded-2xl bg-secondary/40 p-6 text-center">
                      <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                        {event.date === "Event details available on request" ? "TBA" : "Upcoming"}
                      </p>
                      <p className="mt-2 font-display text-xl font-semibold">{event.time}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{event.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{event.location}</p>
                    <p className="mt-4 text-base leading-relaxed">{event.description}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/volunteer-registration">Volunteer with us</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Already Held"
            title="Past Events"
            description="What we ran recently and what it achieved."
          />
          <div className="mt-14 space-y-8">
            {past.map((event, i) => (
              <Reveal key={event.slug} delay={i * 100}>
                <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:gap-12 items-start">
                  <div className="lg:sticky lg:top-8">
                    <div className="rounded-2xl bg-card p-6 text-center border border-border">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Past Event
                      </p>
                      <p className="mt-2 font-display text-xl font-semibold">{event.time}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{event.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{event.location}</p>
                    <p className="mt-4 text-base leading-relaxed">{event.description}</p>
                    {event.impact && (
                      <p className="mt-4 text-sm font-medium text-accent">{event.impact}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/events/past">View All Past Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

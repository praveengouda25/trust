import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { StoryCard, EventCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { causes, stories, events } from "@/data/site";
import { causeImage } from "@/lib/images";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const cause = causes.find((c) => c.slug === params.slug);
    if (!cause) throw notFound();
    return { cause };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Programme not found — SVRST Trust" }, { name: "robots", content: "noindex" }] };
    }
    const { cause } = loaderData;
    return {
      meta: [
        { title: `${cause.label} Programme — SVRST Trust` },
        { name: "description", content: cause.blurb },
        { property: "og:title", content: `${cause.label} Programme — SVRST Trust` },
        { property: "og:description", content: cause.blurb },
      ],
    };
  },
  component: CausePage,
});

function CausePage() {
  const { cause } = Route.useLoaderData();
  const related = stories.filter((s) => s.cause === cause.slug);
  const relatedEvents = events.filter((e) => e.cause === cause.slug);

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title={cause.label}
        subtitle={cause.short}
        image={causeImage[cause.slug]}
        imageAlt={`${cause.label} programme`}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="donate" size="lg">
            <Link to="/donate" search={{ cause: cause.slug }}>
              {cause.cta}
            </Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="/get-involved/request-help">Request Help</Link>
          </Button>
        </div>
      </PageHero>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading align="left" eyebrow="What we do" title={`How our ${cause.label.toLowerCase()} work runs`} description={cause.blurb} />
          <Reveal className="mt-10 rounded-3xl border border-border bg-card p-7 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Measured by</p>
            <p className="mt-2 font-display text-2xl font-semibold">{cause.impact}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We track delivery and outcomes for every programme cycle and share summaries with donors and partners.
            </p>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-secondary/40 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Stories" title="From this programme" />
            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {related.map((story, i) => (
                <StoryCard key={story.name} story={story} delay={i * 90} />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedEvents.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Events" title="Related activities" />
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((event, i) => (
                <EventCard key={event.slug} event={event} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

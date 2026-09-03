import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { causes } from "@/data/site";
import { causeImage, images } from "@/lib/images";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    if (params.slug === "values") throw notFound();
    const cause = causes.find((c) => c.slug === params.slug);
    if (!cause) throw notFound();
    return { cause };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Programme not found — SVRST" }, { name: "robots", content: "noindex" }],
      };
    }
    const { cause } = loaderData;
    return {
      meta: [
        { title: `${cause.label} — SVRST` },
        { name: "description", content: cause.blurb },
        { property: "og:title", content: `${cause.label} — SVRST` },
        { property: "og:description", content: cause.blurb },
      ],
    };
  },
  component: CausePage,
});

function CausePage() {
  const { cause } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Our Focus"
        title={cause.label}
        subtitle={cause.short}
        image={causeImage[cause.slug] ?? images.community}
        imageAlt={`${cause.label} programme`}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="donate" size="lg">
            <Link to="/donate">{cause.cta}</Link>
          </Button>
          <Button asChild variant="hero" size="lg">
            <Link to="/volunteer-registration">Volunteer with us</Link>
          </Button>
        </div>
      </PageHero>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="What We Do"
            title={`How Our ${cause.label} Programme Works`}
            description={cause.blurb}
          />
          <Reveal className="mt-10 rounded-3xl border border-border bg-card p-7 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Measured by</p>
            <p className="mt-2 font-display text-2xl font-semibold">{cause.impact}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We track delivery and outcomes for every programme cycle and share summaries with
              donors and partners.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

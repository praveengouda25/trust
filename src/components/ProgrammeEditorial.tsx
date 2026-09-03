import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";

type ProgrammeEditorialProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  intro?: string;
  purpose?: string;
  sections: { number: string; title: string; body: string; image?: string; imageAlt?: string }[];
  tone?: "hopeful" | "calm" | "energetic";
};

export function ProgrammeEditorial({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  intro,
  purpose,
  sections,
  tone = "hopeful",
}: ProgrammeEditorialProps) {
  const pageTone =
    tone === "calm" ? "programme-calm" : tone === "energetic" ? "programme-energetic" : "";
  const accent =
    tone === "calm" ? "text-primary" : tone === "energetic" ? "text-accent" : "text-accent";

  return (
    <div className={pageTone}>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        image={image}
        imageAlt={imageAlt}
      >
        <Button asChild variant="donate" size="lg">
          <Link to="/volunteer-registration">Volunteer with us</Link>
        </Button>
      </PageHero>

      <section
        className={`programme-purpose py-24 sm:py-36 ${tone === "calm" ? "programme-purpose-calm" : ""} ${tone === "energetic" ? "programme-purpose-energetic" : ""}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-24">
            <Reveal>
              <p className={`eyebrow ${accent}`}>The Purpose</p>
              <p className="mt-6 font-display text-6xl leading-none text-primary sm:text-8xl">01</p>
              <div className="mt-8 h-px w-20 bg-accent" />
            </Reveal>
            <Reveal delay={120}>
              <p className="programme-purpose-statement max-w-4xl font-display text-4xl leading-[1.08] text-foreground sm:text-6xl">
                {purpose ?? intro}
              </p>
              {!purpose && (
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  We create space for children to develop with care, discipline and confidence,
                  building foundations that stay with them beyond the programme.
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section
        className={`programme-sections py-24 sm:py-36 ${tone === "calm" ? "programme-sections-calm" : ""} ${tone === "energetic" ? "programme-sections-energetic" : ""}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-primary/20 border-y border-primary/20">
            {sections.map((section, index) => (
              <Reveal key={section.number} delay={index * 90}>
                <article className="grid gap-8 py-14 lg:grid-cols-[72px_1fr_1fr] lg:items-center lg:gap-12">
                  <p className="font-display text-3xl text-accent">{section.number}</p>
                  <div>
                    <h2 className="text-3xl leading-tight sm:text-5xl">{section.title}</h2>
                    <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  </div>
                  {section.image ? (
                    <img
                      src={section.image}
                      alt={section.imageAlt ?? ""}
                      width="900"
                      height="600"
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  ) : (
                    <div className="programme-section-marker" aria-hidden="true">
                      <span>{tone === "calm" ? "Breathe" : "Move"}</span>
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl border-t border-primary/20 px-4 pt-10 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-accent">Walk with us</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
              Growth is a shared practice.
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
              Support the people and daily practices that help children move towards a steadier,
              more hopeful future.
            </p>
            <Button asChild variant="ghost" className="mt-7 px-0 text-primary hover:bg-transparent">
              <Link to="/volunteer-registration">
                Be part of the work <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { coreValues, org } from "@/data/site";
import { images } from "@/lib/images";

export const Route = createFileRoute("/about/mission")({
  head: () => ({
    meta: [
      { title: "Mission & Vision — SVRST Trust" },
      {
        name: "description",
        content:
          "Our mission is to widen access to education, health, nutrition and skills for children. Our vision is a community where opportunity is not decided by circumstance.",
      },
      { property: "og:title", content: "Mission & Vision — SVRST Trust" },
      { property: "og:description", content: "What SVRST Trust is working towards, and the values behind it." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const principles = [
    ["01", "Education", "Open the door to learning, confidence and meaningful choice."],
    ["02", "Empowerment", "Build the inner and practical strength to shape a life with agency."],
    ["03", "Community", "Grow with families, neighbours and supporters who show up together."],
    ["04", "Sustainable development", "Invest in habits, health and skills that endure beyond a single moment."],
  ];

  return (
    <>
      <PageHero
        eyebrow="Mission & vision"
        title="Opportunity should never depend on circumstance"
        subtitle="Clear purpose, measurable progress, and a long-term commitment to the children we work with."
        image={images.food}
        imageAlt="Children receiving nutritious meals"
      />

      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-accent">Our mission</p>
              <h2 className="mt-6 max-w-4xl text-5xl leading-[1.02] sm:text-7xl">Every child deserves room to become.</h2>
              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">{org.mission}</p>
            </Reveal>
            <Reveal delay={140} className="lg:pt-20">
              <p className="eyebrow text-accent">Our vision</p>
              <p className="mt-5 max-w-md font-display text-3xl leading-tight text-primary sm:text-4xl">
                A community where opportunity is not decided by circumstance.
              </p>
              <div className="mt-10 h-px w-full bg-primary/20" />
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
                Children learn, eat well, stay healthy and grow up with real choices, supported by families and neighbours who have the means to help.
              </p>
            </Reveal>
          </div>
          <Reveal delay={180} className="mt-20 sm:mt-28">
            <div className="grid items-end gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <img src={images.community} alt="Children and community gathered at SVRST" width={1200} height={700} className="aspect-[16/8] w-full object-cover" />
              <p className="border-l border-accent pl-5 text-sm leading-relaxed text-muted-foreground">Purpose becomes visible in the everyday: a lesson, a practice, a shared meal, a child finding their voice.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/50 py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-accent">How we work</p>
              <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">Principles with a pulse.</h2>
            </Reveal>
            <div className="divide-y divide-primary/20 border-y border-primary/20">
              {principles.map(([number, title, body], i) => (
                <Reveal key={title} delay={i * 90}>
                  <div className="grid gap-4 py-8 sm:grid-cols-[72px_0.75fr_1fr] sm:items-baseline sm:gap-8">
                    <span className="font-display text-2xl text-accent">{number}</span>
                    <h3 className="font-display text-2xl">{title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="mt-24 max-w-3xl border-t border-primary/20 pt-8 sm:ml-auto">
            <p className="eyebrow text-accent">The values underneath</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 font-display text-2xl text-primary sm:text-3xl">
              {coreValues.map((value) => <span key={value.title}>{value.title}</span>)}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

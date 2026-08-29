import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Check } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { AutoForm, type FieldDef } from "@/components/forms";
import { images } from "@/lib/images";
import { PLACEHOLDER } from "@/data/site";

const tiers = [
  {
    name: "Supporting Member",
    price: "Annual contribution",
    note: PLACEHOLDER,
    perks: ["Programme updates", "Invitations to events", "Annual impact summary"],
  },
  {
    name: "Patron Member",
    price: "Annual contribution",
    note: PLACEHOLDER,
    perks: ["Everything in Supporting", "Named support for a programme", "Field visit invitations"],
    featured: true,
  },
  {
    name: "Life Member",
    price: "One-time contribution",
    note: PLACEHOLDER,
    perks: ["Lifetime membership", "Advisory participation", "Recognition in reports"],
  },
];

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a reachable phone number"),
  city: z.string().min(2, "Please enter your city"),
  tier: z.string().min(1, "Please choose a membership type"),
  motivation: z.string().min(10, "Tell us briefly why you'd like to join"),
  consent: z.literal(true, { message: "Please agree before submitting" }),
});

type Values = z.infer<typeof schema>;

const fields: FieldDef[] = [
  { name: "name", label: "Full name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone number", type: "tel" },
  { name: "city", label: "City / area" },
  {
    name: "tier",
    label: "Membership type",
    type: "select",
    options: [
      { value: "supporting", label: "Supporting Member" },
      { value: "patron", label: "Patron Member" },
      { value: "life", label: "Life Member" },
    ],
  },
  { name: "motivation", label: "Why would you like to become a member?", type: "textarea" },
  {
    name: "consent",
    label: "I agree to be contacted about membership with SVRST Trust.",
    type: "checkbox",
    full: true,
  },
];

export const Route = createFileRoute("/get-involved/membership")({
  head: () => ({
    meta: [
      { title: "Become a Member — Support Us Year-Round | SVRST Trust" },
      {
        name: "description",
        content:
          "Become a supporting, patron or life member of SVRST Trust and fund education, healthcare and food programmes throughout the year.",
      },
      { property: "og:title", content: "Become a Member of SVRST Trust" },
      { property: "og:description", content: "Support children's education, health and nutrition all year as a member." },
      { property: "og:url", content: "/get-involved/membership" },
    ],
    links: [{ rel: "canonical", href: "/get-involved/membership" }],
  }),
  component: MembershipPage,
});

function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Become a member"
        subtitle="Members give our programmes something rare — steady, predictable support."
        image={images.eventKits}
        imageAlt="Support kits prepared for children in our programmes"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Membership options"
            title="Choose a level that suits you"
            description="Contribution amounts are confirmed by our team — final figures will be shared with you."
          />
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {tiers.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 90} className="h-full">
                <article
                  className={
                    tier.featured
                      ? "h-full rounded-3xl border-2 border-accent bg-card p-7 shadow-lift"
                      : "h-full rounded-3xl border border-border bg-card p-7 shadow-soft"
                  }
                >
                  {tier.featured && (
                    <span className="mb-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      Most chosen
                    </span>
                  )}
                  <h3 className="font-display text-xl font-semibold">{tier.name}</h3>
                  <p className="mt-1 text-sm font-medium text-accent">{tier.price}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{tier.note}</p>
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-leaf" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading align="left" eyebrow="Membership form" title="Apply for membership" />
          <div className="mt-10">
            <AutoForm<Values>
              schema={schema}
              fields={fields}
              defaultValues={{
                name: "",
                email: "",
                phone: "",
                city: "",
                tier: "supporting",
                motivation: "",
                consent: false as unknown as true,
              }}
              submitLabel="Apply for Membership"
              successTitle="Thank you for applying for membership."
              successBody="We'll contact you with the membership details and contribution options."
            />
          </div>
        </div>
      </section>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { AutoForm, type FieldDef } from "@/components/forms";
import { images } from "@/lib/images";

const schema = z.object({
  organisation: z.string().min(2, "Please enter the organisation name"),
  contact: z.string().min(2, "Please enter a contact name"),
  email: z.string().email("Please enter a valid work email"),
  phone: z.string().min(8, "Please enter a reachable phone number"),
  type: z.string().min(1, "Please choose an organisation type"),
  interest: z.string().min(1, "Please choose a partnership interest"),
  message: z.string().min(20, "Please describe the partnership you have in mind"),
  consent: z.literal(true, { message: "Please agree before submitting" }),
});
type Values = z.infer<typeof schema>;
const fields: FieldDef[] = [
  { name: "organisation", label: "Organisation name" },
  { name: "contact", label: "Contact person" },
  { name: "email", label: "Work email", type: "email" },
  { name: "phone", label: "Phone number", type: "tel" },
  {
    name: "type",
    label: "Organisation type",
    type: "select",
    options: [
      { value: "company", label: "Company" },
      { value: "foundation", label: "Foundation" },
      { value: "institution", label: "Institution" },
      { value: "other", label: "Other organisation" },
    ],
  },
  {
    name: "interest",
    label: "Partnership interest",
    type: "select",
    options: [
      { value: "csr", label: "Corporate Social Responsibility" },
      { value: "education", label: "Education support" },
      { value: "infrastructure", label: "Infrastructure support" },
      { value: "employee-volunteering", label: "Employee volunteering" },
      { value: "long-term", label: "Long-term partnership" },
    ],
  },
  {
    name: "message",
    label: "Partnership outline",
    type: "textarea",
    placeholder: "Tell us about the work you would like to explore together.",
  },
  {
    name: "consent",
    label: "I agree to be contacted about a partnership with SVRST.",
    type: "checkbox",
    full: true,
  },
];

export const Route = createFileRoute("/corporate-partnership")({
  head: () => ({
    meta: [
      { title: "Corporate Partnership — SVRST" },
      { name: "description", content: "Explore meaningful corporate partnerships with SVRST." },
    ],
  }),
  component: CorporatePartnershipPage,
});

function CorporatePartnershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Partner with SVRST"
        subtitle="Bring your organisation's capacity, care and purpose into work that supports children and communities."
        image={images.eventWalk}
        imageAlt="SVRST community outreach programme"
      />
      <section className="bg-secondary/50 py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-accent">Ways to collaborate</p>
              <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
                Partnerships with a human centre.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="divide-y divide-primary/20 border-y border-primary/20">
                {[
                  "Corporate Social Responsibility",
                  "Education and child development",
                  "Infrastructure and community initiatives",
                  "Employee volunteering",
                  "Long-term partnerships",
                ].map((item, index) => (
                  <div key={item} className="grid gap-3 py-6 sm:grid-cols-[64px_1fr]">
                    <span className="font-display text-2xl text-accent">0{index + 1}</span>
                    <p className="font-display text-2xl">{item}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:grid sm:grid-cols-[0.7fr_1.3fr] sm:gap-24 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-accent">Partnership enquiry</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
              Start a considered conversation.
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
              Tell us what matters to your organisation and we will explore a useful, accountable
              way to work together.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-12 border-y border-primary/20 py-8 sm:mt-0">
              <AutoForm<Values>
                schema={schema}
                fields={fields}
                defaultValues={{
                  organisation: "",
                  contact: "",
                  email: "",
                  phone: "",
                  type: "company",
                  interest: "csr",
                  message: "",
                  consent: false as unknown as true,
                }}
                submitLabel="Submit Partnership Request"
                successTitle="Thank you for reaching out."
                successBody="Our team will contact you to discuss next steps."
                submitTo="/public/applications"
                toPayload={(values) => ({ type: "CORPORATE_PARTNERSHIP", data: values })}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

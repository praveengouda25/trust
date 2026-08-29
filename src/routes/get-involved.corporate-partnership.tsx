import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BarChart3, FileText, Users, Target } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureCard } from "@/components/cards";
import { AutoForm, type FieldDef } from "@/components/forms";
import { causes } from "@/data/site";
import { images } from "@/lib/images";

const schema = z.object({
  company: z.string().min(2, "Please enter the organisation name"),
  contact: z.string().min(2, "Please enter a contact name"),
  designation: z.string().min(2, "Please enter a designation"),
  email: z.string().email("Please enter a valid work email"),
  phone: z.string().min(8, "Please enter a reachable phone number"),
  focus: z.string().min(1, "Please choose a focus area"),
  scale: z.string().min(1, "Please choose an intended scale"),
  proposal: z.string().min(20, "Please describe the partnership you have in mind"),
  consent: z.literal(true, { message: "Please agree before submitting" }),
});

type Values = z.infer<typeof schema>;

const fields: FieldDef[] = [
  { name: "company", label: "Organisation name" },
  { name: "contact", label: "Contact person" },
  { name: "designation", label: "Designation" },
  { name: "email", label: "Work email", type: "email" },
  { name: "phone", label: "Phone number", type: "tel" },
  {
    name: "focus",
    label: "Focus area",
    type: "select",
    options: [...causes.map((c) => ({ value: c.slug, label: c.label })), { value: "multiple", label: "Multiple programmes" }],
  },
  {
    name: "scale",
    label: "Intended engagement",
    type: "select",
    options: [
      { value: "csr-project", label: "CSR project" },
      { value: "employee-volunteering", label: "Employee volunteering" },
      { value: "in-kind", label: "In-kind support" },
      { value: "long-term", label: "Long-term partnership" },
    ],
  },
  { name: "proposal", label: "Partnership outline", type: "textarea" },
  {
    name: "consent",
    label: "I agree to be contacted about a partnership with SVRST Trust.",
    type: "checkbox",
    full: true,
  },
];

const value = [
  { title: "Measured outcomes", body: "Programme metrics agreed before work begins.", Icon: Target },
  { title: "Clear reporting", body: "Utilisation and outcome reports for every cycle.", Icon: BarChart3 },
  { title: "Employee involvement", body: "Structured volunteering days for your teams.", Icon: Users },
  { title: "Documentation", body: "Receipts, agreements and compliance records.", Icon: FileText },
];

export const Route = createFileRoute("/get-involved/corporate-partnership")({
  head: () => ({
    meta: [
      { title: "Corporate Partnership & CSR Programmes | SVRST Trust" },
      {
        name: "description",
        content:
          "Partner with SVRST Trust on CSR programmes for children's education, healthcare, nutrition and women's livelihoods, with measurable reporting.",
      },
      { property: "og:title", content: "Corporate Partnership with SVRST Trust" },
      { property: "og:description", content: "CSR partnerships with measurable outcomes and clear reporting." },
      { property: "og:url", content: "/get-involved/corporate-partnership" },
    ],
    links: [{ rel: "canonical", href: "/get-involved/corporate-partnership" }],
  }),
  component: CorporatePage,
});

function CorporatePage() {
  return (
    <>
      <PageHero
        eyebrow="Corporate partnership"
        title="Partner with us on CSR"
        subtitle="Programme design, delivery and reporting — built around outcomes your board can review."
        image={images.eventWalk}
        imageAlt="A community outreach programme in progress"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How we work with companies" title="What a partnership includes" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {value.map((v, i) => (
              <FeatureCard key={v.title} title={v.title} body={v.body} Icon={v.Icon} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading align="left" eyebrow="Partnership enquiry" title="Start the conversation" />
          <div className="mt-10">
            <AutoForm<Values>
              schema={schema}
              fields={fields}
              defaultValues={{
                company: "",
                contact: "",
                designation: "",
                email: "",
                phone: "",
                focus: "education",
                scale: "csr-project",
                proposal: "",
                consent: false as unknown as true,
              }}
              submitLabel="Send Partnership Enquiry"
              successTitle="Thank you — your enquiry has reached our team."
              successBody="We'll respond with a programme outline and next steps."
            />
          </div>
        </div>
      </section>
    </>
  );
}

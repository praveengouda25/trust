import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { AutoForm, type FieldDef } from "@/components/forms";
import { causes } from "@/data/site";
import { images } from "@/lib/images";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(8, "Please enter a reachable phone number"),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
  city: z.string().min(2, "Please enter your city or area"),
  support: z.string().min(1, "Please choose the support you need"),
  details: z.string().min(20, "Please describe the situation in at least 20 characters"),
  consent: z.literal(true, { message: "Please confirm the details are accurate" }),
});

type Values = z.infer<typeof schema>;

const fields: FieldDef[] = [
  { name: "name", label: "Full name", placeholder: "Your name" },
  { name: "phone", label: "Phone number", type: "tel", placeholder: "+91 00000 00000" },
  { name: "email", label: "Email (optional)", type: "email", placeholder: "you@example.com" },
  { name: "city", label: "City / area", placeholder: "Where you live" },
  {
    name: "support",
    label: "Support needed",
    type: "select",
    options: causes.map((c) => ({ value: c.slug, label: c.label })),
  },
  {
    name: "details",
    label: "Tell us about the situation",
    type: "textarea",
    placeholder: "Who needs support, what has happened, and what would help most.",
  },
  {
    name: "consent",
    label: "I confirm the information above is accurate and I agree to be contacted about this request.",
    type: "checkbox",
    full: true,
  },
];

export const Route = createFileRoute("/get-involved/request-help")({
  head: () => ({
    meta: [
      { title: "Request Help — Education, Health & Food Support | SVRST Trust" },
      {
        name: "description",
        content:
          "Ask SVRST Trust for education, healthcare or food support. Share your details and our team will contact you to understand the need.",
      },
      { property: "og:title", content: "Request Help from SVRST Trust" },
      { property: "og:description", content: "Share your need for education, healthcare or food support." },
      { property: "og:url", content: "/get-involved/request-help" },
    ],
    links: [{ rel: "canonical", href: "/get-involved/request-help" }],
  }),
  component: RequestHelpPage,
});

function RequestHelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Request help"
        title="Tell us what you need"
        subtitle="Every request is treated with care and confidentiality. Support is offered on need alone."
        image={images.mentoring}
        imageAlt="A mentor supporting a child one-to-one"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Help request form"
            title="Share a few details"
            description="Our coordinator will call you to understand the situation before any support is arranged."
          />
          <div className="mt-10">
            <AutoForm<Values>
              schema={schema}
              fields={fields}
              defaultValues={{
                name: "",
                phone: "",
                email: "",
                city: "",
                support: "education",
                details: "",
                consent: false as unknown as true,
              }}
              submitLabel="Submit Request"
              successTitle="Your request has been received."
              successBody="Our coordinator will contact you on the number you shared."
              note="In an emergency, please also call us directly — the phone number is on the Contact page."
            />
          </div>
        </div>
      </section>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { AutoForm, type FieldDef } from "@/components/forms";
import { images } from "@/lib/images";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(8, "Please enter a reachable phone number"),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
  location: z.string().min(2, "Please enter your location"),
  support: z.string().min(1, "Please choose the assistance needed"),
  details: z.string().min(20, "Please describe the request in at least 20 characters"),
  contactMethod: z.string().min(1, "Please choose a contact method"),
  consent: z.literal(true, { message: "Please confirm the details are accurate" }),
});
type Values = z.infer<typeof schema>;
const fields: FieldDef[] = [
  { name: "name", label: "Full name" },
  { name: "phone", label: "Phone number", type: "tel" },
  { name: "email", label: "Email address", type: "email", placeholder: "Optional" },
  { name: "location", label: "Location" },
  {
    name: "support",
    label: "Type of assistance needed",
    type: "select",
    options: [
      { value: "education", label: "Education support" },
      { value: "wellbeing", label: "Wellbeing support" },
      { value: "food", label: "Food or essentials" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    name: "contactMethod",
    label: "Preferred contact method",
    type: "select",
    options: [
      { value: "phone", label: "Phone" },
      { value: "email", label: "Email" },
      { value: "either", label: "Either" },
    ],
  },
  {
    name: "details",
    label: "Description of the request",
    type: "textarea",
    placeholder: "Tell us what has happened and what would help most.",
  },
  {
    name: "consent",
    label:
      "I confirm the information above is accurate and agree to be contacted about this request.",
    type: "checkbox",
    full: true,
  },
];

export const Route = createFileRoute("/request-help")({
  head: () => ({
    meta: [
      { title: "Request Help — SVRST" },
      { name: "description", content: "Reach out to SVRST when you or your family needs support." },
    ],
  }),
  component: RequestHelpPage,
});

function RequestHelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Request help"
        subtitle="If you or someone you know needs support, tell us what is happening. Every request is treated with care and dignity."
        image={images.mentoring}
        imageAlt="A mentor supporting a child at SVRST"
      />
      <section className="py-24 sm:py-36">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:grid-cols-[0.7fr_1.3fr] sm:px-6 lg:gap-24 lg:px-8">
          <Reveal>
            <p className="eyebrow text-accent">A listening first approach</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
              You do not have to explain everything at once.
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
              Share a few details and our team will contact you to understand the need before any
              support is arranged.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="border-y border-primary/20 py-8">
              <p className="eyebrow text-accent">Help request</p>
              <h2 className="mt-4 text-3xl sm:text-4xl">Start with what feels important.</h2>
              <div className="mt-10">
                <AutoForm<Values>
                  schema={schema}
                  fields={fields}
                  defaultValues={{
                    name: "",
                    phone: "",
                    email: "",
                    location: "",
                    support: "education",
                    details: "",
                    contactMethod: "phone",
                    consent: false as unknown as true,
                  }}
                  submitLabel="Submit Request"
                  successTitle="Your request has been received."
                  successBody="Our coordinator will contact you on the number you shared."
                  submitTo="/public/applications"
                  toPayload={(values) => ({ type: "BENEFICIARY", data: values })}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

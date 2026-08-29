import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { AutoForm, type FieldDef } from "@/components/forms";
import { FeatureCard } from "@/components/cards";
import { causes } from "@/data/site";
import { images } from "@/lib/images";
import { Clock, MapPin, GraduationCap, HeartHandshake } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a reachable phone number"),
  city: z.string().min(2, "Please enter your city"),
  interest: z.string().min(1, "Please choose a programme"),
  availability: z.string().min(1, "Please choose your availability"),
  skills: z.string().min(10, "Tell us a little about your skills"),
  consent: z.literal(true, { message: "Please agree before submitting" }),
});

type Values = z.infer<typeof schema>;

const fields: FieldDef[] = [
  { name: "name", label: "Full name", placeholder: "Your name" },
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { name: "phone", label: "Phone number", type: "tel", placeholder: "+91 00000 00000" },
  { name: "city", label: "City / area", placeholder: "Where you can volunteer" },
  {
    name: "interest",
    label: "Programme you'd like to join",
    type: "select",
    options: [...causes.map((c) => ({ value: c.slug, label: c.label })), { value: "events", label: "Events & Outreach" }],
  },
  {
    name: "availability",
    label: "Availability",
    type: "select",
    options: [
      { value: "weekends", label: "Weekends" },
      { value: "weekdays", label: "Weekdays" },
      { value: "events", label: "Event days only" },
      { value: "remote", label: "Remote / online help" },
    ],
  },
  {
    name: "skills",
    label: "Skills or experience you can offer",
    type: "textarea",
    placeholder: "Teaching, medical, design, logistics, translation, photography…",
  },
  {
    name: "consent",
    label: "I agree to be contacted about volunteering opportunities with SVRST Trust.",
    type: "checkbox",
    full: true,
  },
];

const benefits = [
  { title: "Flexible commitment", body: "Weekend, weekday or event-only roles — choose what fits.", Icon: Clock },
  { title: "Work close to home", body: "Volunteer in the community you already know.", Icon: MapPin },
  { title: "Training and guidance", body: "Orientation and field guidance before you start.", Icon: GraduationCap },
  { title: "Real responsibility", body: "Volunteers lead sessions, camps and distributions.", Icon: HeartHandshake },
];

export const Route = createFileRoute("/get-involved/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer With Us — Give Time to Children | SVRST Trust" },
      {
        name: "description",
        content:
          "Volunteer with SVRST Trust in education, healthcare, food support or women empowerment programmes. Flexible weekend and weekday roles.",
      },
      { property: "og:title", content: "Volunteer With SVRST Trust" },
      { property: "og:description", content: "Join our volunteer network and support children and families." },
      { property: "og:url", content: "/get-involved/volunteer" },
    ],
    links: [{ rel: "canonical", href: "/get-involved/volunteer" }],
  }),
  component: VolunteerPage,
});

function VolunteerPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Volunteer with us"
        subtitle="Volunteers are the reason our programmes run. A few hours a month changes a child's year."
        image={images.volunteers}
        imageAlt="Volunteers working together on a community programme"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why volunteer" title="What you can expect" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <FeatureCard key={b.title} title={b.title} body={b.body} Icon={b.Icon} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading align="left" eyebrow="Volunteer form" title="Sign up to volunteer" />
          <div className="mt-10">
            <AutoForm<Values>
              schema={schema}
              fields={fields}
              defaultValues={{
                name: "",
                email: "",
                phone: "",
                city: "",
                interest: "education",
                availability: "weekends",
                skills: "",
                consent: false as unknown as true,
              }}
              submitLabel="Join as Volunteer"
              successTitle="Welcome — your volunteer details are with us."
              successBody="Our volunteer coordinator will contact you about the next orientation."
            />
          </div>
        </div>
      </section>
    </>
  );
}

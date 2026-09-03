import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { AutoForm, type FieldDef } from "@/components/forms";
import { images } from "@/lib/images";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a reachable phone number"),
  city: z.string().min(2, "Please enter your city or location"),
  interest: z.string().min(1, "Please choose an area of interest"),
  skills: z.string().min(10, "Please share a little about your skills"),
  availability: z.string().min(1, "Please choose your availability"),
  message: z.string().min(20, "Please tell us why you would like to volunteer"),
  consent: z.literal(true, { message: "Please agree before submitting" }),
});
type Values = z.infer<typeof schema>;
const fields: FieldDef[] = [
  { name: "name", label: "Full name", placeholder: "Your name" },
  { name: "email", label: "Email address", type: "email", placeholder: "you@example.com" },
  { name: "phone", label: "Phone number", type: "tel" },
  { name: "city", label: "City / location" },
  {
    name: "interest",
    label: "Area of interest",
    type: "select",
    options: [
      { value: "education", label: "Education" },
      { value: "wellbeing", label: "Dhyana & Yoga" },
      { value: "sports", label: "Sports" },
      { value: "outreach", label: "Community outreach" },
    ],
  },
  {
    name: "availability",
    label: "Availability",
    type: "select",
    options: [
      { value: "weekdays", label: "Weekdays" },
      { value: "weekends", label: "Weekends" },
      { value: "events", label: "Event days" },
      { value: "flexible", label: "Flexible" },
    ],
  },
  {
    name: "skills",
    label: "Skills / profession",
    type: "textarea",
    placeholder: "Teaching, design, sport, logistics or another skill",
  },
  { name: "message", label: "Why would you like to volunteer?", type: "textarea" },
  {
    name: "consent",
    label: "I agree to be contacted about volunteering opportunities with SVRST.",
    type: "checkbox",
    full: true,
  },
];

export const Route = createFileRoute("/volunteer-registration")({
  head: () => ({
    meta: [
      { title: "Volunteer With Us — SVRST" },
      { name: "description", content: "Offer your time, skills and care to the work of SVRST." },
    ],
  }),
  component: VolunteerRegistrationPage,
});

function VolunteerRegistrationPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Volunteer with us"
        subtitle="Your time, skills and care can help children learn, grow and feel supported."
        image={images.volunteers}
        imageAlt="SVRST volunteers working together"
      />
      <section className="py-24 sm:py-36">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:grid-cols-[0.7fr_1.3fr] sm:px-6 lg:gap-24 lg:px-8">
          <Reveal>
            <p className="eyebrow text-accent">A shared commitment</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">Bring what you can.</h2>
            <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
              There is room for teachers, organisers, mentors, artists, coaches and thoughtful
              neighbours in the work.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="border-y border-primary/20 py-8">
              <p className="eyebrow text-accent">Volunteer registration</p>
              <h2 className="mt-4 text-3xl sm:text-4xl">
                Tell us how you would like to contribute.
              </h2>
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
                    skills: "",
                    availability: "weekends",
                    message: "",
                    consent: false as unknown as true,
                  }}
                  submitLabel="Submit Registration"
                  successTitle="Thank you for offering your time."
                  successBody="Our volunteer coordinator will contact you about the next steps."
                  submitTo="/public/applications"
                  toPayload={(values) => ({ type: "VOLUNTEER", data: values })}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

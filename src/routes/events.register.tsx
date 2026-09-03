import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { AutoForm, type FieldDef } from "@/components/forms";
import { events } from "@/data/site";
import { images } from "@/lib/images";

const schema = z.object({ name: z.string().min(2, "Please enter your name"), email: z.string().email("Please enter a valid email"), phone: z.string().min(8, "Please enter your phone"), event: z.string().min(1, "Please select an event"), attendees: z.coerce.number().int().min(1).max(20), consent: z.literal(true, { message: "Please agree before submitting" }) });
type Values = z.infer<typeof schema>;
const fields: FieldDef[] = [{ name: "name", label: "Participant name" }, { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone", type: "tel" }, { name: "event", label: "Event", type: "select", options: events.filter((event) => event.status === "upcoming").map((event) => ({ value: event.slug, label: event.title })) }, { name: "attendees", label: "Number of attendees", type: "number" }, { name: "consent", label: "I agree to be contacted about this event registration.", type: "checkbox", full: true }];
export const Route = createFileRoute("/events/register")({ component: RegisterPage });
function RegisterPage() { return <><PageHero eyebrow="Event registration" title="Join the next event" subtitle="Register your place and the SVRST Trust team will confirm availability." image={images.eventKits} imageAlt="SVRST Trust event kits" /><section className="py-20 sm:py-28"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"><SectionHeading align="left" eyebrow="Registration form" title="Reserve a place" /><div className="mt-10"><AutoForm<Values> schema={schema} fields={fields} defaultValues={{ name: "", email: "", phone: "", event: events.find((event) => event.status === "upcoming")?.slug || "", attendees: 1, consent: false as unknown as true }} submitLabel="Register" submitTo="/public/applications" toPayload={(values) => ({ type: "EVENT_REGISTRATION", data: values })} successTitle="Registration received" successBody="The event team will confirm your registration by email or phone." /></div></div></section></>; }

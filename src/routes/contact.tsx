import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { AutoForm, type FieldDef } from "@/components/forms";
import { images } from "@/lib/images";
import { org } from "@/data/site";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Please enter a subject"),
  message: z.string().min(10, "Please share a little more detail")
});
type Values = z.infer<typeof schema>;
const fields: FieldDef[] = [
  { name: "name", label: "Full name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "subject", label: "Subject" },
  { name: "message", label: "Message", type: "textarea" }
];

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  return <>
    <PageHero eyebrow="Contact" title="Let’s talk about the work" subtitle="Questions, partnership ideas, or a request for information — send us a message." image={images.community} imageAlt="SVRST Trust community programme" />
    <section className="py-20 sm:py-28"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <SectionHeading align="left" eyebrow="Send a message" title="We’re listening" description={`Call us at ${org.phone} or use the form below.`} />
      <div className="mt-10"><AutoForm<Values> schema={schema} fields={fields} defaultValues={{ name: "", email: "", phone: "", subject: "", message: "" }} submitLabel="Send message" submitTo="/public/contact" successTitle="Message received" successBody="Thank you. The SVRST Trust team will get back to you shortly." /></div>
    </div></section>
  </>;
}

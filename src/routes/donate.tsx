import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { AutoForm, type FieldDef } from "@/components/forms";
import { donationAmounts, donationCauses } from "@/data/site";
import { images } from "@/lib/images";

const schema = z.object({
  donorName: z.string().min(2, "Please enter your name"),
  donorEmail: z.string().email("Please enter a valid email"),
  donorPhone: z.string().min(8, "Please enter a reachable phone number"),
  amount: z.coerce.number().positive("Enter a donation amount"),
  purpose: z.string().min(1, "Please choose a cause"),
  paymentMode: z.enum(["UPI", "BANK_TRANSFER", "ONLINE"]),
  transactionId: z.string().optional()
});
type Values = z.infer<typeof schema>;
const fields: FieldDef[] = [
  { name: "donorName", label: "Full name" }, { name: "donorEmail", label: "Email", type: "email" }, { name: "donorPhone", label: "Phone", type: "tel" },
  { name: "amount", label: "Amount (INR)", type: "number", hint: `Suggested: ${donationAmounts.map((amount) => `₹${amount}`).join(", ")}` },
  { name: "purpose", label: "Cause", type: "select", options: donationCauses },
  { name: "paymentMode", label: "Payment method", type: "select", options: [{ value: "UPI", label: "UPI" }, { value: "BANK_TRANSFER", label: "Bank transfer" }, { value: "ONLINE", label: "Online (Razorpay when configured)" }] },
  { name: "transactionId", label: "Transaction/reference ID", hint: "Required for UPI or bank transfer." }
];
export const Route = createFileRoute("/donate")({ component: DonatePage });
function DonatePage() { return <>
  <PageHero eyebrow="Donate" title="Support work that lasts" subtitle="Your contribution is recorded securely and reviewed by the SVRST Trust team." image={images.donateBg} imageAlt="SVRST Trust support programme" />
  <section className="py-20 sm:py-28"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"><SectionHeading align="left" eyebrow="Donation form" title="Make a contribution" description="Online payment verification is handled server-side. Never share card or UPI PIN details here." /><div className="mt-10"><AutoForm<Values> schema={schema} fields={fields} defaultValues={{ donorName: "", donorEmail: "", donorPhone: "", amount: 1000, purpose: "general", paymentMode: "UPI", transactionId: "" }} submitLabel="Submit donation" submitTo="/public/donations" toPayload={(values) => ({ ...values, amount: Number(values.amount), donorType: "INDIVIDUAL" })} successTitle="Donation recorded for review" successBody="Thank you. Your donation reference has been sent to the SVRST Trust team for verification." /></div></div></section>
  </>; }

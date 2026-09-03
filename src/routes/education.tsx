import { createFileRoute } from "@tanstack/react-router";

import { ProgrammeEditorial } from "@/components/ProgrammeEditorial";
import { images } from "@/lib/images";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Education — SVRST" },
      {
        name: "description",
        content: "Education support, learning and future opportunities for children at SVRST.",
      },
    ],
  }),
  component: EducationPage,
});

function EducationPage() {
  return (
    <ProgrammeEditorial
      eyebrow="Education"
      title="Creating opportunities through learning"
      subtitle="Education gives children the confidence, skills and support to shape a wider future."
      image={images.educationReading}
      imageAlt="Children learning together at SVRST"
      intro="Every child deserves the chance to learn, be supported and discover what they can become."
      sections={[
        {
          number: "02",
          title: "Learning opportunities",
          body: "We help children learn, explore and develop their abilities through steady academic support, materials and mentoring.",
          image: images.educationClassroom,
          imageAlt: "Students studying in a classroom",
        },
        {
          number: "03",
          title: "Confidence through education",
          body: "A caring environment helps young learners build curiosity, self-belief and the confidence to keep going when learning feels difficult.",
          image: images.storyStudent,
          imageAlt: "Student supported in the SVRST learning programme",
        },
        {
          number: "04",
          title: "Skills for the future",
          body: "Knowledge, practical skills and community support give children stronger foundations for meaningful choices and equal opportunities.",
          image: images.mentoring,
          imageAlt: "Mentoring and learning support at SVRST",
        },
      ]}
    />
  );
}

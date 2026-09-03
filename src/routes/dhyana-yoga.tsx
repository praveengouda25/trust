import { createFileRoute } from "@tanstack/react-router";

import { ProgrammeEditorial } from "@/components/ProgrammeEditorial";
import { images } from "@/lib/images";

export const Route = createFileRoute("/dhyana-yoga")({
  head: () => ({
    meta: [
      { title: "Dhyana & Yoga — SVRST" },
      {
        name: "description",
        content:
          "Yoga, meditation and mindfulness practices that nurture calm minds and healthier communities at SVRST.",
      },
    ],
  }),
  component: DhyanaYogaPage,
});

function DhyanaYogaPage() {
  return (
    <ProgrammeEditorial
      eyebrow="Dhyana & Yoga"
      title="Nurturing calm minds and healthier communities"
      subtitle="Accessible yoga, meditation and mindfulness practices for balance, confidence and emotional well-being."
      image={images.yogaMeditation}
      imageAlt="Children practising yoga at SVRST"
      purpose="Peace. Balance. Well-being."
      tone="calm"
      sections={[
        {
          number: "02",
          title: "Mindful Living",
          body: "Simple practices encourage calmness, awareness and emotional balance in everyday life.",
        },
        {
          number: "03",
          title: "Healthy Habits",
          body: "Yoga and mindful movement make healthier routines feel accessible, joyful and sustainable.",
        },
        {
          number: "04",
          title: "Community Well-being",
          body: "Welcoming spaces help people pause, connect and grow together with care.",
        },
      ]}
    />
  );
}

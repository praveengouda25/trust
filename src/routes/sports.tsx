import { createFileRoute } from "@tanstack/react-router";

import { ProgrammeEditorial } from "@/components/ProgrammeEditorial";
import { images } from "@/lib/images";

export const Route = createFileRoute("/sports")({
  head: () => ({
    meta: [
      { title: "Sports — SVRST" },
      {
        name: "description",
        content:
          "Sport-based youth development that builds confidence, discipline, teamwork and opportunity at SVRST.",
      },
    ],
  }),
  component: SportsPage,
});

function SportsPage() {
  return (
    <ProgrammeEditorial
      eyebrow="Sports & youth development"
      title="Creating opportunities through sport"
      subtitle="Sport helps young people build confidence, discipline, leadership and a strong sense of belonging."
      image={images.sportsActivity}
      imageAlt="Children taking part in sports at SVRST"
      purpose="Play. Grow. Lead."
      tone="energetic"
      sections={[
        {
          number: "02",
          title: "Play With Purpose",
          body: "Creating opportunities for young people to participate, learn and enjoy sport.",
        },
        {
          number: "03",
          title: "Stronger Together",
          body: "Teamwork and shared activity build confidence, respect and connection.",
        },
        {
          number: "04",
          title: "Growing Through Sport",
          body: "Sport helps young people develop discipline, leadership and healthy habits.",
        },
      ]}
    />
  );
}

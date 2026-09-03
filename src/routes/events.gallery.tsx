import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

const galleryImages = [
  { src: "484906498_2309865726081007_3933555102617373580_n.jpg", size: "large" },
  { src: "485102872_2314820398918873_398084130907220773_n.jpg", size: "medium" },
  { src: "485680654_2314820495585530_4844798421333418608_n.jpg", size: "small" },
  { src: "485895274_2316844125383167_1612227953887777993_n.jpg", size: "medium" },
  { src: "485984924_2315104355557144_4712796985316385331_n.jpg", size: "small" },
  { src: "485995676_2316844402049806_2027262695686617169_n.jpg", size: "large" },
  { src: "486141822_2316844352049811_4766525757847180261_n.jpg", size: "medium" },
  { src: "486202553_2315961552138091_2057107015716883614_n.jpg", size: "small" },
  { src: "486531486_2316844078716505_6594244948484410213_n.jpg", size: "medium" },
  { src: "486575863_2316844385383141_5966308131945866189_n.jpg", size: "small" },
  { src: "486637361_2321493718251541_4049028166686544729_n.jpg", size: "large" },
  { src: "486672457_2321493698251543_1227417758185921883_n.jpg", size: "medium" },
];

export const Route = createFileRoute("/events/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — SVRST" },
      {
        name: "description",
        content: "Official photographs from the SVRST gallery showing education, dhyana, yoga, sports and cultural activities.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Real Moments from SVRST"
        subtitle="Official photographs from the SVRST gallery collection showing our programmes in action."
        image="/gallery/487881677_2325158101218436_1034937149395650112_n.jpg"
        imageAlt="SVRST field photograph"
      />
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Visual Story"
            title="The Work, As It Happens"
            description="Images are presented from the supplied SVRST gallery without generated or stock photography."
          />
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {galleryImages.map((image, i) => (
              <Reveal key={image.src} delay={i * 50} className="mb-4 break-inside-avoid">
                <a
                  href={`/gallery/${image.src}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-2xl"
                >
                  <img
                    src={`/gallery/${image.src}`}
                    alt="SVRST field photograph"
                    loading="lazy"
                    className={cn(
                      "w-full object-cover transition duration-500 group-hover:scale-105",
                      image.size === "large" ? "aspect-[4/3]" : image.size === "medium" ? "aspect-square" : "aspect-[3/4]"
                    )}
                  />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

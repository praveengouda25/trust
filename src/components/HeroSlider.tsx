import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/images";
import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  alt: string;
  eyebrow: string;
  headline: string;
  text: string;
  cta: { label: string; to: string };
};

const slides: Slide[] = [
  {
    image: images.education,
    alt: "Students reading together with their teacher in a community classroom",
    eyebrow: "Education",
    headline: "Empowering Lives Through Education",
    text: "Creating opportunities for children and communities to learn, grow and build a better future.",
    cta: { label: "Explore Our Work", to: "/work" },
  },
  {
    image: images.healthcare,
    alt: "A doctor checking an elderly woman's blood pressure at a community health camp",
    eyebrow: "Healthcare",
    headline: "Healthcare Within Reach",
    text: "Working to make essential healthcare and support accessible to vulnerable communities.",
    cta: { label: "Our Healthcare Work", to: "/work/healthcare" },
  },
  {
    image: images.food,
    alt: "Volunteers distributing meals and grocery kits to families",
    eyebrow: "Food Support",
    headline: "No One Should Go Hungry",
    text: "Providing essential food support and standing with families during difficult times.",
    cta: { label: "Support This Cause", to: "/donate" },
  },
  {
    image: images.women,
    alt: "Women learning tailoring skills in a training workshop",
    eyebrow: "Women Empowerment",
    headline: "Empowering Women. Strengthening Communities.",
    text: "Creating pathways toward confidence, independence and sustainable livelihoods.",
    cta: { label: "Learn More", to: "/work/women-empowerment" },
  },
];

const INTERVAL = 6500;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative isolate flex min-h-[92dvh] items-end overflow-hidden bg-navy pb-16 pt-32 sm:pb-24"
      aria-roledescription="carousel"
      aria-label="SVRST Trust programmes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        const end = e.changedTouches[0]?.clientX;
        if (start == null || end == null) return;
        if (Math.abs(end - start) > 48) go(index + (end < start ? 1 : -1));
        touchStart.current = null;
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.headline}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            width={1600}
            height={1000}
            loading={i === 0 ? "eager" : "lazy"}
            className={cn("size-full object-cover", i === index && "ken-burns")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {slides.map((slide, i) =>
            i === index ? (
              <div key={slide.headline}>
                <p className="eyebrow animate-in fade-in slide-in-from-bottom-2 text-ember duration-700">
                  {slide.eyebrow}
                </p>
                <h1 className="mt-4 animate-in fade-in text-4xl leading-[1.05] text-primary-foreground text-balance-tight duration-700 slide-in-from-bottom-4 sm:text-5xl lg:text-6xl">
                  {slide.headline}
                </h1>
                <p className="mt-5 max-w-xl animate-in fade-in text-base leading-relaxed text-primary-foreground/80 delay-150 duration-700 slide-in-from-bottom-4 sm:text-lg">
                  {slide.text}
                </p>
                <div className="mt-8 flex flex-wrap gap-3 animate-in fade-in delay-300 duration-700 slide-in-from-bottom-4">
                  <Button asChild variant="leaf" size="xl">
                    <Link to={slide.cta.to}>{slide.cta.label}</Link>
                  </Button>
                  <Button asChild variant="hero" size="xl">
                    <Link to="/donate">Donate Now</Link>
                  </Button>
                </div>
              </div>
            ) : null,
          )}
        </div>

        <div className="mt-12 flex items-center gap-4">
          <div className="flex gap-2">
            <Button variant="hero" size="icon" aria-label="Previous slide" onClick={() => go(index - 1)}>
              <ArrowLeft className="size-4" />
            </Button>
            <Button variant="hero" size="icon" aria-label="Next slide" onClick={() => go(index + 1)}>
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="flex flex-1 gap-2" role="tablist" aria-label="Slides">
            {slides.map((slide, i) => (
              <button
                key={slide.headline}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={slide.eyebrow}
                onClick={() => go(i)}
                className="group h-11 flex-1 max-w-24"
              >
                <span
                  className={cn(
                    "block h-1 w-full rounded-full transition-colors",
                    i === index ? "bg-ember" : "bg-primary-foreground/30 group-hover:bg-primary-foreground/60",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

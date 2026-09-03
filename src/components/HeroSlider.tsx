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
    image: images.hero1,
    alt: "SVRST children learning together",
    eyebrow: "Welcome",
    headline: "A steady foundation for a wider future",
    text: "Where education meets values, discipline and inner growth for children to flourish with confidence.",
    cta: { label: "Explore Education", to: "/education" },
  },
  {
    image: images.hero2,
    alt: "SVRST students growing through education",
    eyebrow: "Education",
    headline: "Learning with care and purpose",
    text: "Support, mentoring and opportunity help children stay curious, capable and connected to their future.",
    cta: { label: "Our Education", to: "/education" },
  },
  {
    image: images.hero3,
    alt: "Students practicing yoga asanas at SVRST",
    eyebrow: "Yoga & Wellness",
    headline: "Balance. Discipline. Mind-Body Connection.",
    text: "Yoga practice for physical flexibility, mental clarity, discipline and healthy lifestyle.",
    cta: { label: "Explore Yoga", to: "/dhyana-yoga" },
  },
  {
    image: images.hero4,
    alt: "SVRST young people taking part in community activity",
    eyebrow: "Community",
    headline: "Growing stronger together",
    text: "Shared experiences build confidence, character and the sense of belonging every child deserves.",
    cta: { label: "Our Mission", to: "/about/mission" },
  },
];

const INTERVAL = 2000;

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
      className="relative isolate flex min-h-[92dvh] items-end overflow-hidden bg-forest pb-16 pt-32 sm:pb-24"
      aria-roledescription="carousel"
      aria-label="SVRST programmes"
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
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/70 to-navy/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest/80 via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {slides.map((slide, i) =>
            i === index ? (
              <div key={slide.headline}>
                <p className="eyebrow animate-in fade-in slide-in-from-bottom-2 text-saffron duration-700">
                  {slide.eyebrow}
                </p>
                <h1 className="mt-4 text-4xl leading-[1.05] text-primary-foreground text-balance-tight sm:text-5xl lg:text-6xl">
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
            <Button
              variant="hero"
              size="icon"
              aria-label="Previous slide"
              onClick={() => go(index - 1)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              variant="hero"
              size="icon"
              aria-label="Next slide"
              onClick={() => go(index + 1)}
            >
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
                    i === index
                      ? "bg-ember"
                      : "bg-primary-foreground/30 group-hover:bg-primary-foreground/60",
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

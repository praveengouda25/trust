import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ImpactCounter({
  value,
  suffix = "",
  label,
  tone = "light",
  className,
}: {
  value: number;
  suffix?: string;
  label: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.unobserve(el);
        const start = performance.now();
        const duration = 1600;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <div
        className={cn(
          "font-display text-4xl font-semibold tabular-nums sm:text-5xl lg:text-6xl",
          tone === "dark" ? "text-primary-foreground" : "text-primary",
        )}
      >
        {display.toLocaleString("en-IN")}
        <span className={tone === "dark" ? "text-ember" : "text-accent"}>{suffix}</span>
      </div>
      <p
        className={cn(
          "mt-2 text-sm font-medium tracking-wide",
          tone === "dark" ? "text-primary-foreground/70" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
    </div>
  );
}

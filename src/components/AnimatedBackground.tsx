import { cn } from "@/lib/utils";

type Variant = "orbs" | "particles" | "shapes" | "grid" | "waves" | "glow" | "ambient";

/**
 * Reusable decorative backgrounds. Purely presentational, always behind content,
 * and disabled visually for users who prefer reduced motion (see styles.css).
 */
export function AnimatedBackground({
  variant = "orbs",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {variant === "orbs" && (
        <>
          <div className="absolute -left-24 top-[-10%] size-96 rounded-full bg-accent/12 blur-3xl drift-slow" />
          <div
            className="absolute -right-16 bottom-[-20%] size-[28rem] rounded-full bg-primary/10 blur-3xl drift-slow"
            style={{ animationDelay: "-8s" }}
          />
        </>
      )}

      {variant === "glow" && (
        <div className="absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/12 blur-3xl float-slow" />
      )}

      {variant === "ambient" && (
        <>
          <div className="ambient-orb ambient-orb-one" />
          <div className="ambient-orb ambient-orb-two" />
          <div className="ambient-orb ambient-orb-three" />
          <div className="ambient-grid" />
        </>
      )}

      {variant === "particles" && (
        <div className="absolute inset-0">
          {particleSeeds.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-accent/40 float-slow"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {variant === "shapes" && (
        <svg
          className="absolute inset-0 size-full opacity-[0.10]"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-40 420C120 320 220 520 400 430S680 300 860 380"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
          <path
            d="M-40 470C140 380 240 570 420 480S700 350 880 430"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-accent"
          />
          <circle cx="120" cy="140" r="70" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent float-slow" />
          <circle cx="690" cy="180" r="110" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        </svg>
      )}

      {variant === "grid" && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
          }}
        />
      )}

      {variant === "waves" && (
        <svg
          className="absolute inset-x-0 bottom-0 h-40 w-full opacity-20"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <path
            d="M0 96C240 40 480 140 720 96s480-120 720-56v120H0Z"
            fill="currentColor"
            className="text-accent"
          />
          <path
            d="M0 120C240 70 480 160 720 120s480-90 720-40v80H0Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      )}
    </div>
  );
}

const particleSeeds = [
  { x: 8, y: 22, size: 6, delay: 0, duration: 10 },
  { x: 18, y: 68, size: 4, delay: 1.5, duration: 12 },
  { x: 31, y: 14, size: 8, delay: 0.8, duration: 9 },
  { x: 44, y: 78, size: 5, delay: 2.2, duration: 13 },
  { x: 57, y: 30, size: 7, delay: 1.1, duration: 11 },
  { x: 68, y: 62, size: 4, delay: 3, duration: 10 },
  { x: 79, y: 20, size: 6, delay: 0.4, duration: 14 },
  { x: 88, y: 74, size: 5, delay: 2.6, duration: 12 },
  { x: 95, y: 44, size: 7, delay: 1.9, duration: 9 },
];

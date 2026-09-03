import type { ReactNode } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden gradient-forest pb-16 pt-32 sm:pb-24 sm:pt-40", className)}>
      {image && (
        <>
          <img
            src={image}
            alt={imageAlt ?? ""}
            width={1600}
            height={1000}
            className="absolute inset-0 size-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/50" />
        </>
      )}
      <AnimatedBackground variant="particles" className="text-primary-foreground" />
      <AnimatedBackground variant="shapes" className="text-primary-foreground opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow text-ember">{eyebrow}</p>}
          <h1 className="mt-4 text-4xl leading-[1.05] text-primary-foreground text-balance-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

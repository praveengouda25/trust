import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        tone === "dark" && "text-primary-foreground",
        className,
      )}
    >
      {eyebrow && (
        <p className={cn("eyebrow mb-3", tone === "dark" ? "text-ember" : "text-accent")}>{eyebrow}</p>
      )}
      <h2 className="text-3xl leading-[1.1] text-balance-tight sm:text-4xl lg:text-5xl">{title}</h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
      {children && <div className={cn("mt-7", align === "center" && "flex flex-wrap justify-center gap-3")}>{children}</div>}
    </Reveal>
  );
}

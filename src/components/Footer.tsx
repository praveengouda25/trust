import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Phone, Twitter } from "lucide-react";
import { org } from "@/data/site";
import { ERP_AUTH_URL } from "@/lib/api";

const columns = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" },
      { label: "About SVRST", to: "/about/svrst-trust" },
      { label: "Our Mission", to: "/about/mission" },
      { label: "Achievements", to: "/about/achievements" },
      { label: "Donation", to: "/donate" },
    ],
  },
  {
    title: "Our Focus",
    links: [
      { label: "Education", to: "/education" },
      { label: "Dhyana & Yoga", to: "/dhyana-yoga" },
      { label: "Sports", to: "/sports" },
      { label: "Volunteer Registration", to: "/volunteer-registration" },
      { label: "Request Help", to: "/request-help" },
      { label: "Corporate Partnership", to: "/corporate-partnership" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Events", to: "/events/upcoming" },
      { label: "Gallery", to: "/events/gallery" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: org.social.facebook, Icon: Facebook },
  { label: "Instagram", href: org.social.instagram, Icon: Instagram },
  { label: "X", href: org.social.x, Icon: Twitter },
];

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden gradient-forest text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-primary-foreground shadow-soft">
              <img
                src="/assets/images/svrst-logo.png"
                alt="SVRST"
                width="48"
                height="48"
                className="size-full object-cover"
              />
            </span>
            <span className="font-display text-xl font-semibold">SVRST</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            {org.mission}
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-11 place-items-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-ember hover:text-saffron"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="eyebrow text-saffron">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="eyebrow text-saffron">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-saffron" />
              <a
                href={`tel:${org.phone.replace(/\s/g, "")}`}
                className="hover:text-primary-foreground"
              >
                {org.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-saffron" />
              <span>{org.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SVRST. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/policies/privacy" className="hover:text-primary-foreground">
              Privacy Policy
            </Link>
            <Link to="/policies/terms" className="hover:text-primary-foreground">
              Terms &amp; Conditions
            </Link>
            <Link to="/policies/donation" className="hover:text-primary-foreground">
              Donation Policy
            </Link>
            <Link to="/contact" className="hover:text-primary-foreground">
              Contact
            </Link>
            <a href={ERP_AUTH_URL} className="hover:text-primary-foreground">
              ERP login
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl border-t border-primary-foreground/10 px-4 py-5 text-xs text-primary-foreground/60 sm:px-6 lg:px-8">
          <p>
            Website powered by{" "}
            <a
              href="https://www.vistarxsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-foreground hover:text-saffron"
            >
              VistarX Solutions Pvt. Ltd.
            </a>
          </p>
          <p className="mt-2 max-w-3xl leading-relaxed">
            Technology and digital solutions for modern organisations.{" "}
            <a
              href="https://www.vistarxsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground"
            >
              www.vistarxsolutions.com
            </a>{" "}
            · contact@vistarxsolutions.com · +91 63603 29673 · GSTIN: 29AAMCV2786K1ZF
          </p>
        </div>
      </div>
    </footer>
  );
}

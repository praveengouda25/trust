import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";
import { org } from "@/data/site";

const columns = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" },
      { label: "About SVRST", to: "/about/svrst-trust" },
      { label: "Our Mission", to: "/about/mission" },
      { label: "Our Journey", to: "/about/journey" },
      { label: "Our Team", to: "/about/team" },
      { label: "Achievements", to: "/about/achievements" },
    ],
  },
  {
    title: "Our Work",
    links: [
      { label: "Education", to: "/work/education" },
      { label: "Healthcare", to: "/work/healthcare" },
      { label: "Food Support", to: "/work/food-support" },
      { label: "Women Empowerment", to: "/work/women-empowerment" },
      { label: "All Programmes", to: "/work" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Request Help", to: "/get-involved/request-help" },
      { label: "Volunteer", to: "/get-involved/volunteer" },
      { label: "Become a Member", to: "/get-involved/membership" },
      { label: "Corporate Partnership", to: "/get-involved/corporate-partnership" },
      { label: "Events", to: "/events/upcoming" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: org.social.facebook, Icon: Facebook },
  { label: "Instagram", href: org.social.instagram, Icon: Instagram },
  { label: "LinkedIn", href: org.social.linkedin, Icon: Linkedin },
  { label: "YouTube", href: org.social.youtube, Icon: Youtube },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden gradient-navy text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary-foreground/10 backdrop-blur">
              <Heart className="size-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-xl font-semibold">SVRST Trust</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-primary-foreground/70">{org.mission}</p>
          <div className="mt-6 flex gap-2">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-11 place-items-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-ember hover:text-ember"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="eyebrow text-ember">{col.title}</h2>
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
          <h2 className="eyebrow text-ember">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-ember" />
              <a href={`mailto:${org.email}`} className="hover:text-primary-foreground">
                {org.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-ember" />
              <a href={`tel:${org.phone.replace(/\s/g, "")}`} className="hover:text-primary-foreground">
                {org.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ember" />
              <span>{org.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SVRST Trust. All rights reserved.</p>
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
          </div>
        </div>
      </div>
    </footer>
  );
}

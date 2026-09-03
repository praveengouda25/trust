/**
 * White-label branding layer.
 *
 * The platform is generic. A deployment's visible
 * identity comes from the active trust record in the database; these values
 * are only the fallback used before a trust is configured.
 */
export const PLATFORM = {
  name: "SVRST ERP",
  tagline: "Hostel, student and welfare operations for NGO trusts",
  vendor: "VISTARX",
} as const;

export type Branding = {
  displayName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
};

export const defaultBranding: Branding = {
  displayName: PLATFORM.name,
  logoUrl: null,
  primaryColor: null,
  accentColor: null,
};

export function brandingFromTrust(
  trust: {
    display_name?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
    accent_color?: string | null;
  } | null,
): Branding {
  if (!trust) return defaultBranding;
  return {
    displayName: trust.display_name || defaultBranding.displayName,
    logoUrl: trust.logo_url ?? null,
    primaryColor: trust.primary_color ?? null,
    accentColor: trust.accent_color ?? null,
  };
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

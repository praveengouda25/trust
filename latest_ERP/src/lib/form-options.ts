/** Shared structured option lists used by every form in the ERP. */

export type Option = { value: string; label: string };

const opt = (v: string): Option => ({ value: v, label: v });

export const CLASS_GRADES: Option[] = [
  "Pre-KG",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "1st PUC",
  "2nd PUC",
  "Diploma",
  "Degree",
  "ITI",
  "Other",
].map(opt);

export const BLOOD_GROUPS: Option[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "NA"].map(
  opt,
);

export const STUDENT_CATEGORIES: Option[] = [
  "General",
  "SC",
  "ST",
  "OBC",
  "Minority",
  "Economically Weaker Section",
  "Orphan",
  "Scholarship",
  "Sponsored",
  "International",
  "Other",
  "NA",
].map(opt);

export const IDENTITY_TYPES: Option[] = [
  "Aadhaar",
  "PAN Card",
  "Passport",
  "Voter ID",
  "Driving License",
  "Birth Certificate",
  "Student ID",
  "Other",
].map(opt);

export type Country = { code: string; dial: string; flag: string; name: string; digits?: number };

/** Common dialling codes, India first because it is the primary deployment. */
export const COUNTRIES: Country[] = [
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India", digits: 10 },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States", digits: 10 },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada", digits: 10 },
  { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "MY", dial: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "LK", dial: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "NP", dial: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "BD", dial: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "KE", dial: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "China" },
  { code: "NZ", dial: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "RU", dial: "+7", flag: "🇷🇺", name: "Russia" },
];

/** Split a stored "+91 9876543210" value into dial code and national number. */
export function splitPhone(value: string | null | undefined): { dial: string; number: string } {
  const raw = (value ?? "").trim();
  if (!raw) return { dial: "+91", number: "" };
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => raw.startsWith(c.dial));
  if (!match) return { dial: "+91", number: raw.replace(/[^\d]/g, "") };
  return { dial: match.dial, number: raw.slice(match.dial.length).replace(/[^\d]/g, "") };
}

export function joinPhone(dial: string, number: string) {
  const digits = number.replace(/[^\d]/g, "");
  return digits ? `${dial} ${digits}` : "";
}

/** Returns an error message when the number does not match the country rule. */
export function phoneError(dial: string, number: string): string | null {
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  const country = COUNTRIES.find((c) => c.dial === dial);
  if (country?.digits && digits.length !== country.digits) {
    return `${country.name} numbers must be exactly ${country.digits} digits.`;
  }
  if (digits.length < 5 || digits.length > 15) return "Enter a valid phone number.";
  return null;
}

/**
 * Central content configuration for SVRST Trust.
 * Replace every value marked [Replace with official SVRST information]
 * with the organisation's verified details.
 */

export const PLACEHOLDER = "[Replace with official SVRST information]";

export const org = {
  name: "SVRST Trust",
  tagline: "Real people. Real impact. Real change.",
  mission:
    "SVRST Trust works alongside communities to widen access to education, healthcare, food support and livelihoods — so that opportunity is not decided by circumstance.",
  registration: PLACEHOLDER,
  email: "contact@svrsttrust.org",
  emailNote: PLACEHOLDER,
  phone: "+91 00000 00000",
  phoneNote: PLACEHOLDER,
  address: "Office address — " + PLACEHOLDER,
  hours: "Monday – Saturday, 10:00 – 18:00",
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    x: "#",
  },
} as const;

export type Cause = {
  slug: "education" | "healthcare" | "food-support" | "women-empowerment";
  label: string;
  short: string;
  blurb: string;
  cta: string;
  icon: "book" | "heart" | "utensils" | "sparkles";
  impact: string;
};

export const causes: Cause[] = [
  {
    slug: "education",
    label: "Education",
    short: "Opening doors through learning and opportunity.",
    blurb:
      "Learning support, school materials, coaching and mentoring so children stay in education and progress with confidence.",
    cta: "Support Education",
    icon: "book",
    impact: "Students supported",
  },
  {
    slug: "healthcare",
    label: "Healthcare",
    short: "Supporting healthier communities.",
    blurb:
      "Health camps, awareness drives and assistance that help families reach essential care without delay or debt.",
    cta: "Support Healthcare",
    icon: "heart",
    impact: "Health camp beneficiaries",
  },
  {
    slug: "food-support",
    label: "Food Support",
    short: "Standing with families in times of need.",
    blurb:
      "Cooked meals, ration kits and emergency food relief for families facing sudden hardship.",
    cta: "Help Provide Food",
    icon: "utensils",
    impact: "Meals & kits distributed",
  },
  {
    slug: "women-empowerment",
    label: "Women Empowerment",
    short: "Building confidence, skills and independence.",
    blurb:
      "Skill training, livelihood guidance and peer groups that help women earn, lead and decide for themselves.",
    cta: "Support Women Empowerment",
    icon: "sparkles",
    impact: "Women in skill programmes",
  },
];

/** Impact numbers — replace with verified figures before publishing. */
export const impactStats = [
  { value: 10000, suffix: "+", label: "Lives Reached", note: PLACEHOLDER },
  { value: 5000, suffix: "+", label: "Students Supported", note: PLACEHOLDER },
  { value: 100, suffix: "+", label: "Community Programmes", note: PLACEHOLDER },
  { value: 50, suffix: "+", label: "Volunteers & Partners", note: PLACEHOLDER },
];

export const whyTrustUs = [
  {
    title: "Community Focused",
    body: "Programmes are designed with the people they serve, not for them.",
    icon: "users",
  },
  {
    title: "Transparent Approach",
    body: "Clear records of what was given, to whom, and what changed.",
    icon: "shield",
  },
  {
    title: "Sustainable Impact",
    body: "Support that builds capability, not dependency.",
    icon: "sprout",
  },
  {
    title: "Dedicated Volunteers",
    body: "Local volunteers who know the community and stay with it.",
    icon: "handshake",
  },
  {
    title: "Inclusive Support",
    body: "Help is offered on need alone — without exception or preference.",
    icon: "heart-handshake",
  },
  {
    title: "Long-Term Vision",
    body: "We measure progress in years and generations, not events.",
    icon: "compass",
  },
] as const;

export const coreValues = [
  { title: "Integrity", body: "We do what we said we would do.", icon: "shield-check" },
  { title: "Compassion", body: "We begin by listening, always.", icon: "heart" },
  { title: "Inclusivity", body: "Every person deserves dignity and access.", icon: "users" },
  { title: "Transparency", body: "Open records, honest reporting.", icon: "eye" },
  { title: "Empowerment", body: "Support that creates independence.", icon: "sparkles" },
  { title: "Sustainability", body: "Change designed to outlast us.", icon: "sprout" },
] as const;

export const timeline = [
  {
    year: PLACEHOLDER,
    title: "Foundation & Beginning",
    body: "SVRST Trust is formed by a group of volunteers committed to community support. " + PLACEHOLDER,
  },
  {
    year: PLACEHOLDER,
    title: "Early Community Initiatives",
    body: "First neighbourhood-level education and welfare activities. " + PLACEHOLDER,
  },
  {
    year: PLACEHOLDER,
    title: "Expansion of Education Programmes",
    body: "Learning support extended to more children and schools. " + PLACEHOLDER,
  },
  {
    year: PLACEHOLDER,
    title: "Healthcare Initiatives",
    body: "Health camps and awareness sessions introduced. " + PLACEHOLDER,
  },
  {
    year: PLACEHOLDER,
    title: "Food Support Programmes",
    body: "Regular meal and ration distribution begins. " + PLACEHOLDER,
  },
  {
    year: PLACEHOLDER,
    title: "Women Empowerment Programmes",
    body: "Skill development and livelihood guidance launched. " + PLACEHOLDER,
  },
  {
    year: PLACEHOLDER,
    title: "Pandemic Response",
    body: "Emergency relief during a period of severe community hardship. " + PLACEHOLDER,
    challenge: "Families lost income and could not reach essential supplies or care.",
    response: "Volunteers organised food kits, essentials and information support.",
    impact: "Households received continuous support through the crisis period.",
  },
  {
    year: PLACEHOLDER,
    title: "Community Expansion",
    body: "Work extended to additional communities and partners. " + PLACEHOLDER,
  },
  {
    year: PLACEHOLDER,
    title: "Current Initiatives",
    body: "Ongoing education, healthcare, food and empowerment programmes. " + PLACEHOLDER,
  },
  {
    year: "Ahead",
    title: "Future Vision",
    body: "Deeper, longer-term programmes with measurable community outcomes.",
  },
];

export const team = [
  { name: PLACEHOLDER, role: "Trustee", bio: "Biography to be provided by SVRST Trust.", linkedin: "#" },
  { name: PLACEHOLDER, role: "Trustee", bio: "Biography to be provided by SVRST Trust.", linkedin: "#" },
  { name: PLACEHOLDER, role: "Programme Lead", bio: "Biography to be provided by SVRST Trust.", linkedin: "#" },
  { name: PLACEHOLDER, role: "Volunteer Coordinator", bio: "Biography to be provided by SVRST Trust.", linkedin: "#" },
  { name: PLACEHOLDER, role: "Community Outreach", bio: "Biography to be provided by SVRST Trust.", linkedin: "#" },
  { name: PLACEHOLDER, role: "Finance & Compliance", bio: "Biography to be provided by SVRST Trust.", linkedin: "#" },
];

export const achievements = [
  { title: "Programme Milestone", body: PLACEHOLDER, meta: "Programmes" },
  { title: "Community Recognition", body: PLACEHOLDER, meta: "Recognition" },
  { title: "Volunteer Network Growth", body: PLACEHOLDER, meta: "People" },
  { title: "Emergency Relief Response", body: PLACEHOLDER, meta: "Relief" },
];

export const recognitions = [
  { title: "Recognition / Award", issuer: PLACEHOLDER, year: PLACEHOLDER },
  { title: "Certificate", issuer: PLACEHOLDER, year: PLACEHOLDER },
  { title: "Appreciation", issuer: PLACEHOLDER, year: PLACEHOLDER },
];

export type Story = {
  name: string;
  place: string;
  cause: Cause["slug"];
  challenge: string;
  support: string;
  result: string;
  image: "education" | "healthcare" | "food" | "women" | "community";
};

export const stories: Story[] = [
  {
    name: "A student in our learning programme",
    place: PLACEHOLDER,
    cause: "education",
    challenge: "家 responsibilities and costs made continuing school uncertain.",
    support: "Learning materials, coaching support and regular mentoring.",
    result: "Returned to consistent attendance and improved in class.",
    image: "education",
  },
  {
    name: "An elder from a health camp",
    place: PLACEHOLDER,
    cause: "healthcare",
    challenge: "Routine check-ups were out of reach due to distance and cost.",
    support: "A local health camp, screening and follow-up guidance.",
    result: "Ongoing condition identified early and managed with care.",
    image: "healthcare",
  },
  {
    name: "A family supported during hardship",
    place: PLACEHOLDER,
    cause: "food-support",
    challenge: "A sudden loss of income left the household without essentials.",
    support: "Ration kits and cooked meals through the difficult weeks.",
    result: "The family stayed stable while returning to work.",
    image: "food",
  },
  {
    name: "A woman in our skills programme",
    place: PLACEHOLDER,
    cause: "women-empowerment",
    challenge: "No independent income and limited access to training.",
    support: "Tailoring and enterprise training with peer group support.",
    result: "Began earning independently and now mentors new learners.",
    image: "women",
  },
];

export type Event = {
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  seats?: number;
  status: "upcoming" | "past";
  cause: Cause["slug"];
  image: "education" | "healthcare" | "food" | "women" | "community";
  impact?: string;
};

export const events: Event[] = [
  {
    slug: "community-health-camp",
    title: "Community Health Camp",
    date: "Date to be confirmed",
    time: "09:00 – 14:00",
    location: PLACEHOLDER,
    description: "A free health screening camp with awareness sessions for families in the area.",
    seats: 120,
    status: "upcoming",
    cause: "healthcare",
    image: "healthcare",
  },
  {
    slug: "school-kit-distribution",
    title: "School Kit Distribution",
    date: "Date to be confirmed",
    time: "10:00 – 13:00",
    location: PLACEHOLDER,
    description: "Learning materials and school kits handed to students in our education programme.",
    seats: 200,
    status: "upcoming",
    cause: "education",
    image: "education",
  },
  {
    slug: "skills-workshop-for-women",
    title: "Skills Workshop for Women",
    date: "Date to be confirmed",
    time: "11:00 – 16:00",
    location: PLACEHOLDER,
    description: "A hands-on workshop covering tailoring, budgeting and enterprise basics.",
    seats: 60,
    status: "upcoming",
    cause: "women-empowerment",
    image: "women",
  },
  {
    slug: "monthly-meal-drive",
    title: "Monthly Meal Drive",
    date: "Date to be confirmed",
    time: "12:00 – 15:00",
    location: PLACEHOLDER,
    description: "Volunteers prepared and served meals with community partners.",
    status: "past",
    cause: "food-support",
    image: "food",
    impact: "Impact summary to be provided by SVRST Trust.",
  },
  {
    slug: "volunteer-orientation",
    title: "Volunteer Orientation",
    date: "Date to be confirmed",
    time: "16:00 – 18:00",
    location: PLACEHOLDER,
    description: "New volunteers were introduced to our programmes and field practices.",
    status: "past",
    cause: "education",
    image: "community",
    impact: "Impact summary to be provided by SVRST Trust.",
  },
  {
    slug: "community-awareness-walk",
    title: "Community Awareness Walk",
    date: "Date to be confirmed",
    time: "07:00 – 09:00",
    location: PLACEHOLDER,
    description: "A neighbourhood walk raising awareness of health and education support.",
    status: "past",
    cause: "healthcare",
    image: "community",
    impact: "Impact summary to be provided by SVRST Trust.",
  },
];

export const donationAmounts = [500, 1000, 2500, 5000, 10000];

export const donationCauses = [
  ...causes.map((c) => ({ value: c.slug, label: c.label })),
  { value: "general", label: "General Fund" },
];

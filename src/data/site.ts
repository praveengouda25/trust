/**
 * Central content configuration for SVRST.
 * Central content for the SVRST website.
 */

export const org = {
  name: "SVRST",
  tagline: "Mathrudhama Children's Home",
  mission:
    "SVRST provides children with a nurturing environment focused on education, dhyana, yoga, sports, values and character development. We cultivate discipline, inner peace and physical fitness alongside academic excellence.",
  phone: "+91 95913 15639",
  address:
    "No 347, Somashekhara Reddy Estate, Hulimangala Village, Jigani Hobli, Anekal Taluk, Bangalore - 560 105",
  social: {
    facebook: "https://www.facebook.com/svrst.mathrudhama.5",
    instagram: "https://www.instagram.com/mathrudhama/?hl=en",
    linkedin: "",
    youtube: "",
    x: "https://x.com/Mathrudhama",
  },
} as const;

export type Cause = {
  slug: "education" | "dhyana" | "yoga" | "sports" | "values";
  label: string;
  short: string;
  blurb: string;
  cta: string;
  icon: "book" | "sparkles" | "heart" | "trophy" | "shield";
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
    slug: "dhyana",
    label: "Dhyana",
    short: "Stillness. Awareness. Inner Growth.",
    blurb:
      "Meditation and mindfulness practices that cultivate concentration, inner discipline and peace.",
    cta: "Explore Dhyana",
    icon: "sparkles",
    impact: "Practitioners",
  },
  {
    slug: "yoga",
    label: "Yoga",
    short: "Balance. Discipline. Mind-Body Connection.",
    blurb:
      "Yoga practice for physical flexibility, mental clarity, discipline and healthy lifestyle.",
    cta: "Explore Yoga",
    icon: "heart",
    impact: "Students practicing",
  },
  {
    slug: "sports",
    label: "Sports",
    short: "Teamwork. Fitness. Achievement.",
    blurb:
      "Sports participation that builds teamwork, discipline, fitness, confidence and sportsmanship.",
    cta: "Support Sports",
    icon: "trophy",
    impact: "Students in sports",
  },
  {
    slug: "values",
    label: "Values & Culture",
    short: "Rooted in Values. Grounded in Culture.",
    blurb:
      "Devotional learning, Indian cultural values, respect, compassion, gratitude and self-awareness.",
    cta: "Learn More",
    icon: "shield",
    impact: "Students in values programmes",
  },
];

export const impactStats = [
  { value: 5000, suffix: "+", label: "Donors", note: "People who choose to stand with the work" },
  { value: 5, suffix: "", label: "Programmes", note: "Education, Dhyana, Yoga, Sports and Values" },
  { value: 1, suffix: "", label: "Children's home", note: "A nurturing environment for children" },
];

export const commitments = [
  {
    number: "01",
    title: "Child-Centred Care",
    body: "Every decision begins with children's safety, dignity and wellbeing.",
  },
  {
    number: "02",
    title: "Education & Growth",
    body: "We support learning, confidence and the skills children need to flourish.",
  },
  {
    number: "03",
    title: "Discipline & Values",
    body: "Daily discipline and values create a stronger foundation for life.",
  },
  {
    number: "04",
    title: "Dhyana & Inner Peace",
    body: "Meditation and mindfulness help children feel centered, respected and supported.",
  },
  {
    number: "05",
    title: "Physical Fitness",
    body: "Yoga and sports keep children healthy, active and confident.",
  },
  {
    number: "06",
    title: "Character Development",
    body: "We value clear communication, careful stewardship and trust.",
  },
] as const;

export const whyTrustUs = [
  {
    title: "Child Focused",
    body: "Programmes are designed with the children they serve, not for them.",
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
    title: "Dedicated Teachers",
    body: "Local teachers who know the children and stay with them.",
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
  {
    title: "Discipline",
    body: "We cultivate self-discipline in every aspect of learning.",
    icon: "shield-check",
  },
  { title: "Respect", body: "We begin by listening, always.", icon: "heart" },
  { title: "Compassion", body: "Every child deserves dignity and access.", icon: "users" },
  { title: "Integrity", body: "Open records, honest reporting.", icon: "eye" },
  { title: "Devotion", body: "Support that creates independence.", icon: "sparkles" },
  { title: "Excellence", body: "Change designed to outlast us.", icon: "sprout" },
] as const;

export const timeline = [
  {
    year: "Our beginning",
    title: "Foundation & Beginning",
    body: "SVRST grows from a commitment to care for children with dignity and consistency.",
  },
  {
    year: "Growing together",
    title: "Early Community Initiatives",
    body: "Support is shaped around the everyday needs of children, families and the surrounding community.",
  },
  {
    year: "Today",
    title: "Expansion of Education Programmes",
    body: "The campus brings together care, learning, dhyana, yoga and meaningful participation in one child-focused environment.",
  },
  {
    year: "Inner growth",
    title: "Dhyana & Yoga Initiatives",
    body: "Dhyana and yoga remain part of the practical support offered to children and families.",
  },
  {
    year: "Physical fitness",
    title: "Sports Programmes",
    body: "Sports programmes help children have the physical fitness they need for everyday life and learning.",
  },
  {
    year: "Community",
    title: "Values & Culture Programmes",
    body: "The work continues to value the wider community around every child.",
  },
  {
    year: "Shared effort",
    title: "Pandemic Response",
    body: "Supporters and volunteers respond with care when children and families face hardship.",
    challenge: "Families lost income and could not reach essential supplies or care.",
    response: "Volunteers organised food kits, essentials and information support.",
    impact: "Households received continuous support through the crisis period.",
  },
  {
    year: "Community reach",
    title: "Community Expansion",
    body: "The campus welcomes meaningful participation from people who want to support its mission.",
  },
  {
    year: "Ongoing",
    title: "Current Initiatives",
    body: "Care, learning, dhyana, yoga, sports and community support remain central to the work.",
  },
  {
    year: "Ahead",
    title: "Future Vision",
    body: "Deeper, longer-term programmes with measurable community outcomes.",
  },
];

export const team = [
  {
    name: "Community volunteers",
    role: "Care and programme support",
    bio: "People who contribute time, care and practical support to the campus.",
    linkedin: "",
  },
];

export const achievements = [
  {
    title: "A child-focused home",
    body: "A welcoming campus environment centred on safety, care and belonging.",
    meta: "Care",
  },
  {
    title: "Learning with dignity",
    body: "Education is treated as a foundation for confidence, choice and a brighter future.",
    meta: "Education",
  },
  {
    title: "Inner discipline",
    body: "Dhyana and yoga are part of the practical care children need to learn and thrive.",
    meta: "Wellbeing",
  },
  {
    title: "Community participation",
    body: "Supporters, volunteers and families all have a meaningful role in the work.",
    meta: "Community",
  },
];

export const recognitions: { title: string; issuer: string; year: string }[] = [];

export type Story = {
  name: string;
  place: string;
  cause: Cause["slug"];
  challenge: string;
  support: string;
  result: string;
  image: "storyStudent" | "storyFamily" | "foodDistribution" | "womenEnterprise" | "mentoring";
};

export const stories: Story[] = [
  {
    name: "A student in our learning programme",
    place: "SVRST",
    cause: "education",
    challenge: "Household responsibilities and costs made continuing school uncertain.",
    support: "Learning materials, coaching support and regular mentoring.",
    result: "Returned to consistent attendance and improved in class.",
    image: "storyStudent",
  },
  {
    name: "A child in our dhyana programme",
    place: "SVRST",
    cause: "dhyana",
    challenge: "Difficulty focusing and managing stress in daily life.",
    support: "Daily meditation practice and mindfulness guidance.",
    result: "Improved concentration and inner peace.",
    image: "storyFamily",
  },
  {
    name: "A student in our yoga programme",
    place: "SVRST",
    cause: "yoga",
    challenge: "Lack of physical fitness and flexibility.",
    support: "Regular yoga practice with experienced instructors.",
    result: "Improved physical health and mental clarity.",
    image: "foodDistribution",
  },
  {
    name: "A student in our sports programme",
    place: "SVRST",
    cause: "sports",
    challenge: "Limited opportunities for team participation and competition.",
    support: "Sports training, team practice and competition opportunities.",
    result: "Developed teamwork skills and achieved in competitions.",
    image: "womenEnterprise",
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
    slug: "annual-sports-day",
    title: "Annual Sports Day",
    date: "Event details available on request",
    time: "09:00 – 17:00",
    location: "SVRST Campus",
    description: "A day of sports competitions and physical activities for students.",
    seats: 200,
    status: "upcoming",
    cause: "sports",
    image: "community",
  },
  {
    slug: "dhyana-camp",
    title: "Dhyana Meditation Camp",
    date: "Event details available on request",
    time: "06:00 – 10:00",
    location: "SVRST Campus",
    description: "A meditation camp focused on inner peace and mindfulness.",
    seats: 100,
    status: "upcoming",
    cause: "dhyana",
    image: "education",
  },
  {
    slug: "yoga-workshop",
    title: "Yoga Workshop",
    date: "Event details available on request",
    time: "07:00 – 09:00",
    location: "SVRST Campus",
    description: "A hands-on yoga workshop covering asanas, pranayama and meditation.",
    seats: 80,
    status: "upcoming",
    cause: "yoga",
    image: "community",
  },
  {
    slug: "cultural-day",
    title: "Cultural Values Day",
    date: "Event details available on request",
    time: "10:00 – 16:00",
    location: "SVRST Campus",
    description: "A celebration of Indian cultural values, traditions and devotional learning.",
    seats: 150,
    status: "upcoming",
    cause: "values",
    image: "community",
  },
  {
    slug: "education-fair",
    title: "Education Fair",
    date: "Event details available on request",
    time: "10:00 – 14:00",
    location: "SVRST Campus",
    description: "Learning materials and educational resources displayed for students.",
    seats: 200,
    status: "past",
    cause: "education",
    image: "education",
    impact: "Impact summary to be provided by SVRST.",
  },
  {
    slug: "sports-competition",
    title: "Inter-School Sports Competition",
    date: "Event details available on request",
    time: "08:00 – 18:00",
    location: "SVRST Campus",
    description: "Students participated in various sports competitions with other schools.",
    status: "past",
    cause: "sports",
    image: "community",
    impact: "Impact summary to be provided by SVRST.",
  },
];

export const donationAmounts = [500, 1000, 2500, 5000, 10000];

export const donationCauses = [
  ...causes.map((c) => ({ value: c.slug, label: c.label })),
  { value: "general", label: "General Fund" },
];

import heroEducation from "@/assets/hero-education.jpg";
import heroHealthcare from "@/assets/hero-healthcare.jpg";
import heroFood from "@/assets/hero-food.jpg";
import heroWomen from "@/assets/hero-women.jpg";
import community from "@/assets/community.jpg";
import donateBg from "@/assets/donate-bg.jpg";
import educationClassroom from "@/assets/education-classroom.jpg";
import educationReading from "@/assets/education-reading.jpg";
import healthCheckup from "@/assets/health-checkup.jpg";
import healthAwareness from "@/assets/health-awareness.jpg";
import foodDistribution from "@/assets/food-distribution.jpg";
import foodKitchen from "@/assets/food-kitchen.jpg";
import womenDigital from "@/assets/women-digital.jpg";
import womenEnterprise from "@/assets/women-enterprise.jpg";
import eventKits from "@/assets/event-kits.jpg";
import eventWalk from "@/assets/event-walk.jpg";
import volunteers from "@/assets/volunteers.jpg";
import achievementsImg from "@/assets/achievements.jpg";
import mentoring from "@/assets/mentoring.jpg";
import teamLead from "@/assets/team-lead.jpg";
import storyStudent from "@/assets/story-student.jpg";
import storyFamily from "@/assets/story-family.jpg";

/**
 * Image inventory — each image has a single purpose so no section repeats
 * another section's visual.
 *
 * heroEducation / heroHealthcare / heroFood / heroWomen  → homepage hero slider only
 * educationClassroom, educationReading, mentoring        → education programme
 * healthCheckup, healthAwareness                         → healthcare programme
 * foodDistribution, foodKitchen                          → food support programme
 * womenDigital, womenEnterprise                          → women empowerment
 * eventKits, eventWalk, volunteers                       → events & volunteering
 * achievementsImg                                        → achievements
 * community                                              → journey / about
 * teamLead                                               → team portraits
 * storyStudent, storyFamily                              → success stories
 * donateBg                                               → donation page
 */
export const images = {
  heroEducation,
  heroHealthcare,
  heroFood,
  heroWomen,
  community,
  donateBg,
  educationClassroom,
  educationReading,
  healthCheckup,
  healthAwareness,
  foodDistribution,
  foodKitchen,
  womenDigital,
  womenEnterprise,
  eventKits,
  eventWalk,
  volunteers,
  achievements: achievementsImg,
  mentoring,
  teamLead,
  storyStudent,
  storyFamily,
  // Legacy aliases kept so older imports keep resolving.
  education: educationClassroom,
  healthcare: healthCheckup,
  food: foodDistribution,
  women: womenDigital,
} as const;

export type ImageKey = keyof typeof images;

/** Card/listing image for each programme (distinct from the hero slider images). */
export const causeImage: Record<string, string> = {
  education: educationClassroom,
  healthcare: healthCheckup,
  "food-support": foodDistribution,
  "women-empowerment": womenDigital,
};

/** Larger, different visual for each programme detail page hero. */
export const causeHeroImage: Record<string, string> = {
  education: educationReading,
  healthcare: healthAwareness,
  "food-support": foodKitchen,
  "women-empowerment": womenEnterprise,
};

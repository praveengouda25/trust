import education from "@/assets/hero-education.jpg";
import healthcare from "@/assets/hero-healthcare.jpg";
import food from "@/assets/hero-food.jpg";
import women from "@/assets/hero-women.jpg";
import community from "@/assets/community.jpg";
import donateBg from "@/assets/donate-bg.jpg";

export const images = { education, healthcare, food, women, community, donateBg };

export type ImageKey = keyof typeof images;

export const causeImage: Record<string, string> = {
  education,
  healthcare,
  "food-support": food,
  "women-empowerment": women,
};

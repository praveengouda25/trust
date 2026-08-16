import {
  Users,
  Shield,
  ShieldCheck,
  Sprout,
  Handshake,
  HeartHandshake,
  Compass,
  Heart,
  Eye,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  users: Users,
  shield: Shield,
  "shield-check": ShieldCheck,
  sprout: Sprout,
  handshake: Handshake,
  "heart-handshake": HeartHandshake,
  compass: Compass,
  heart: Heart,
  eye: Eye,
  sparkles: Sparkles,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Sparkles;
}

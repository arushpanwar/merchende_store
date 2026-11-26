import type { KitType, Size } from "@prisma/client";

export const KIT_LABELS: Record<KitType, string> = {
  HOME: "Home",
  AWAY: "Away",
  THIRD: "Third",
  SPECIAL: "Special",
};

export const ALL_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export function kitLabel(kit: KitType): string {
  return KIT_LABELS[kit];
}

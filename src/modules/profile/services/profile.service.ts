import { CURRENT_USER } from "@/modules/feed";
import type { ProfileData } from "../types";
export async function getProfile(): Promise<ProfileData> {
  await new Promise((resolve) => setTimeout(resolve, 240));
  return { ...CURRENT_USER, joinedAt: "August 2026", location: "Jakarta, Indonesia", website: "https://paybox.id", interests: "Product design, AI payments, Build in public", podcast: "", showPayBoxBadge: true, showRecentViews: true, privateProfile: false };
}

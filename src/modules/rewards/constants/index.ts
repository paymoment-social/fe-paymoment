import { CURRENT_USER, PEOPLE } from "@/modules/feed";
import type { RewardItem, RewardLeader } from "../types";

export const REWARDS_QUERY_KEY = ["paymoment", "rewards"] as const;
export const VERIFIED_BOX_THRESHOLD = 10;

export const LEADERS: RewardLeader[] = [
  { rank: 1, user: PEOPLE[0], box: 2340, trend: "same" },
  { rank: 2, user: PEOPLE[1], box: 1890, trend: "up" },
  { rank: 3, user: CURRENT_USER, box: 1250, trend: "up" },
  { rank: 4, user: PEOPLE[3], box: 980, trend: "down" },
  { rank: 5, user: PEOPLE[4], box: 720, trend: "same" },
];

export const REWARD_CATALOG: RewardItem[] = [
  {
    id: "verified",
    title: "Verified",
    description: "Unlock your permanent verified mark and stand out across PayMoment.",
    cost: VERIFIED_BOX_THRESHOLD,
    icon: "solar:verified-check-bold",
    available: true,
  },
  { id: "r2", title: "Creator spotlight", description: "Featured placement in Discover for 24 hours.", cost: 500, icon: "solar:stars-bold", available: true },
  { id: "r3", title: "Founding member badge", description: "Permanent profile badge for early contributors.", cost: 1600, icon: "solar:medal-star-bold", available: false },
];

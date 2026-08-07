import type { FeedAuthor } from "@/modules/feed";
export type RewardLeader = { rank: number; user: FeedAuthor; box: number; trend: "up" | "down" | "same" };
export type RewardItem = { id: string; title: string; description: string; cost: number; icon: string; available: boolean };
export type RewardsData = { leaders: RewardLeader[]; catalog: RewardItem[] };

import type { FeedAuthor } from "@/modules/feed";
export type PayNotification = { id: string; type: "like" | "reply" | "follow" | "reward" | "mention" | "repost" | "message" | "system"; user?: FeedAuthor; text: string; time: string; read: boolean; href?: string; rewardAmount?: number; rewardAction?: "earned" | "redeemed" };
export type NotificationPage = { notifications: PayNotification[]; nextCursor: string | null };
export type NotificationFilter = "all" | "likes" | "replies" | "mentions" | "follows" | "rewards" | "reposts";
export type NotificationPreferences = { likes: boolean; replies: boolean; mentions: boolean; follows: boolean; rewards: boolean; reposts: boolean; messages: boolean; emailDigest: boolean };

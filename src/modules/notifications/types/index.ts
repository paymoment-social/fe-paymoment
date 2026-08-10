import type { FeedAuthor } from "@/modules/feed";
export type PayNotification = { id: string; type: "like" | "reply" | "follow" | "reward" | "mention" | "repost" | "message" | "system"; user?: FeedAuthor; text: string; time: string; read: boolean; href?: string };
export type NotificationFilter = "all" | "mentions" | "rewards";
export type NotificationPreferences = { likes: boolean; replies: boolean; mentions: boolean; follows: boolean; rewards: boolean; reposts: boolean; messages: boolean; emailDigest: boolean };

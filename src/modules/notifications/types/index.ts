import type { FeedAuthor } from "@/modules/feed";
export type PayNotification = { id: string; type: "like" | "reply" | "follow" | "reward" | "mention"; user?: FeedAuthor; text: string; time: string; read: boolean };
export type NotificationFilter = "all" | "mentions" | "rewards";

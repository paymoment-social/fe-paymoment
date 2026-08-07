import { PEOPLE } from "@/modules/feed";
import type { PayNotification } from "../types";
export const NOTIFICATIONS_QUERY_KEY = ["paymoment", "notifications"] as const;
export const NOTIFICATION_FILTERS = ["all", "mentions", "rewards"] as const;
export const NOTIFICATIONS: PayNotification[] = [
  { id: "n1", type: "reward", text: "Your latest moment earned 24 Box.", time: "10m", read: false },
  { id: "n2", type: "like", user: PEOPLE[1], text: "liked your moment about agent payments.", time: "32m", read: false },
  { id: "n3", type: "reply", user: PEOPLE[0], text: "replied: This is the workflow I’ve been waiting for.", time: "1h", read: true },
  { id: "n4", type: "follow", user: PEOPLE[3], text: "started following you.", time: "3h", read: true },
];

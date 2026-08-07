import { PEOPLE } from "@/modules/feed";
import type { Conversation } from "../types";
export const MESSAGES_QUERY_KEY = ["paymoment", "messages"] as const;
export const CONVERSATIONS: Conversation[] = [
  { id: "c1", user: PEOPLE[1], unread: 2, messages: [
    { id: "m1", sender: "them", body: "The PayMoment concept looks sharp. Are you opening a beta?", time: "09:42" },
    { id: "m2", sender: "me", body: "Yes—small creator cohort first. I’ll send you an invite.", time: "09:45" },
    { id: "m3", sender: "them", body: "Perfect, count me in!", time: "09:46" },
  ]},
  { id: "c2", user: PEOPLE[0], unread: 0, messages: [{ id: "m4", sender: "them", body: "That new reward flow is much clearer now.", time: "Yesterday" }] },
  { id: "c3", user: PEOPLE[3], unread: 0, messages: [{ id: "m5", sender: "me", body: "Thanks for the UI notes!", time: "Mon" }] },
];

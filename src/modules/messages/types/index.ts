import type { FeedAuthor } from "@/modules/feed";
export type ChatMessage = { id: string; sender: "me" | "them"; body: string; time: string; attachment?: { name: string; kind: "image" | "file" } };
export type Conversation = { id: string; user: FeedAuthor; unread: number; messages: ChatMessage[] };

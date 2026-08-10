import type { FeedAuthor } from "@/modules/feed";

export type ChatAttachment = { id: string; url: string | null; mimeType: string; altText: string | null };
export type ChatMessage = { id: string; senderId: string; body: string; createdAt: string; attachments: ChatAttachment[] };
export type Conversation = { id: string; user: FeedAuthor; unread: boolean; lastMessage: { id: string; senderId: string; body: string; createdAt: string } | null };
export type MessageRequest = { id: string; status: "pending"; requester: FeedAuthor; createdAt: string };

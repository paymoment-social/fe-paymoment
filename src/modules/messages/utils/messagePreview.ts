import type { Conversation } from "../types";
export function messagePreview(conversation: Conversation) { const body = conversation.messages.at(-1)?.body ?? "Start a conversation"; return body.length > 42 ? `${body.slice(0, 42)}…` : body; }

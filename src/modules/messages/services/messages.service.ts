import { apiRequest, mutationHeaders } from "@/lib/api/client";
import { mapAuthor } from "@/modules/feed/services/feed.service";
import type { ChatMessage, Conversation, MessageRequest } from "../types";

type ApiProfile = Parameters<typeof mapAuthor>[0];
type ApiAttachment = { id: string; url: string | null; mime_type: string; alt_text: string | null };
type ApiMessage = { id: string; sender_id: string; body: string; created_at: string; attachments: ApiAttachment[] };
type ApiConversation = { id: string; participant: ApiProfile | null; unread: boolean; last_message: { id: string; sender_id: string; body: string; created_at: string } | null };
type DataResponse<T> = { data: T };
type PageResponse<T> = { data: T[]; meta: { next_cursor: string | null; has_more: boolean } };

function mapMessage(message: ApiMessage): ChatMessage {
  return { id: message.id, senderId: message.sender_id, body: message.body, createdAt: message.created_at, attachments: message.attachments.map((attachment) => ({ id: attachment.id, url: attachment.url, mimeType: attachment.mime_type, altText: attachment.alt_text })) };
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await apiRequest<DataResponse<{ conversations: ApiConversation[] }>>("/api/v1/conversations");
  return response.data.conversations.filter((item) => item.participant).map((item) => ({ id: item.id, user: mapAuthor(item.participant!), unread: item.unread, lastMessage: item.last_message ? { id: item.last_message.id, senderId: item.last_message.sender_id, body: item.last_message.body, createdAt: item.last_message.created_at } : null }));
}

export async function getConversationMessages(conversationId: string, cursor?: string) {
  const query = new URLSearchParams({ limit: "50" });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest<PageResponse<ApiMessage>>(`/api/v1/conversations/${conversationId}/messages?${query}`);
  return { messages: response.data.map(mapMessage), nextCursor: response.meta.next_cursor };
}

export async function createConversation(recipientId: string) {
  const response = await apiRequest<DataResponse<{ conversation: { id: string } }>>("/api/v1/conversations", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ recipient_id: recipientId }) });
  return response.data.conversation;
}

export async function createMessageRequest(recipientId: string) {
  const response = await apiRequest<DataResponse<{ request: { id: string; recipient_id: string; status: "pending"; created_at: string } }>>("/api/v1/message-requests", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ recipient_id: recipientId }) });
  return response.data.request;
}

export async function sendConversationMessage(input: { conversationId: string; body: string; mediaAssetIds: string[] }) {
  const response = await apiRequest<DataResponse<{ message: ApiMessage }>>(`/api/v1/conversations/${input.conversationId}/messages`, { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ body: input.body, media_asset_ids: input.mediaAssetIds, client_message_id: crypto.randomUUID() }) });
  return mapMessage(response.data.message);
}

export async function markConversationRead(conversationId: string) {
  await apiRequest<DataResponse<{ conversation_id: string }>>(`/api/v1/conversations/${conversationId}/read`, { method: "PUT", headers: mutationHeaders() });
}

type ApiMessageRequest = { id: string; status: "pending"; requester: ApiProfile | null; created_at: string };
export async function getIncomingMessageRequests(): Promise<MessageRequest[]> {
  const response = await apiRequest<DataResponse<{ requests: ApiMessageRequest[] }>>("/api/v1/message-requests/incoming");
  return response.data.requests.filter((request) => request.requester).map((request) => ({ id: request.id, status: request.status, requester: mapAuthor(request.requester!), createdAt: request.created_at }));
}
export async function respondToMessageRequest(id: string, decision: "accept" | "decline") {
  const response = await apiRequest<DataResponse<{ request: { id: string; status: "accepted" | "declined"; conversation_id: string | null } }>>(`/api/v1/message-requests/${id}`, { method: "PUT", headers: mutationHeaders(), body: JSON.stringify({ decision }) });
  return response.data.request;
}

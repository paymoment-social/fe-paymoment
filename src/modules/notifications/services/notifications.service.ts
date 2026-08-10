import { apiRequest, mutationHeaders } from "@/lib/api/client";
import { mapAuthor } from "@/modules/feed/services/feed.service";
import type { NotificationFilter, NotificationPreferences, PayNotification } from "../types";

type ApiActor = Parameters<typeof mapAuthor>[0];
type ApiNotification = { id: string; type: PayNotification["type"] | "repost" | "message" | "system"; actor: ApiActor | null; post_id: string | null; reply_id: string | null; conversation_id: string | null; message_id: string | null; payload: Record<string, unknown>; read_at: string | null; created_at: string };

function relativeTime(value: string) { const elapsed = Date.now() - new Date(value).getTime(); return elapsed < 60_000 ? "now" : elapsed < 3_600_000 ? `${Math.floor(elapsed / 60_000)}m` : elapsed < 86_400_000 ? `${Math.floor(elapsed / 3_600_000)}h` : `${Math.floor(elapsed / 86_400_000)}d`; }
function textFor(type: ApiNotification["type"], payload: Record<string, unknown>) { return typeof payload.text === "string" ? payload.text : type === "like" ? "liked your Moment." : type === "reply" ? "replied to your Moment." : type === "mention" ? "mentioned you in a Moment." : type === "follow" ? "started following you." : type === "reward" ? "sent you a reward update." : type === "repost" ? "reposted your Moment." : type === "message" ? "sent you a message." : "sent you an update."; }
function notificationHref(item: ApiNotification) {
  if (item.conversation_id) return `/messages?conversation=${encodeURIComponent(item.conversation_id)}`;
  if (item.post_id) return `/post/${encodeURIComponent(item.post_id)}${item.reply_id ? `?reply=${encodeURIComponent(item.reply_id)}` : ""}`;
  if (item.type === "reward") return "/rewards";
  return undefined;
}
function mapNotification(item: ApiNotification): PayNotification { return { id: item.id, type: item.type, user: item.actor ? mapAuthor(item.actor) : undefined, text: textFor(item.type, item.payload), time: relativeTime(item.created_at), read: Boolean(item.read_at), href: notificationHref(item) }; }

export async function getNotifications(filter: NotificationFilter) { const response = await apiRequest<{ data: ApiNotification[] }>(`/api/v1/notifications?filter=${filter}&limit=50`); return response.data.map(mapNotification); }
export async function markNotificationRead(id: string) { await apiRequest(`/api/v1/notifications/${id}/read`, { method: "PUT", headers: mutationHeaders() }); }
export async function markAllNotificationsRead() { await apiRequest(`/api/v1/notifications/read-all`, { method: "PUT", headers: mutationHeaders() }); }
export async function getUnreadNotificationCount() { const response = await apiRequest<{ data: { count: number } }>("/api/v1/notifications/unread-count"); return response.data.count; }
export async function getNotificationPreferences() { const response = await apiRequest<{ data: { preferences: { likes: boolean; replies: boolean; mentions: boolean; follows: boolean; rewards: boolean; reposts: boolean; messages: boolean; emailDigest: boolean } } }>("/api/v1/notifications/preferences"); return response.data.preferences; }
export async function updateNotificationPreferences(input: Partial<NotificationPreferences>) { const response = await apiRequest<{ data: { preferences: NotificationPreferences } }>("/api/v1/notifications/preferences", { method: "PUT", headers: mutationHeaders(), body: JSON.stringify({ ...input, ...(input.emailDigest !== undefined ? { email_digest: input.emailDigest } : {}) }) }); return response.data.preferences; }

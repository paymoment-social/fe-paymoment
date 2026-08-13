import { apiRequest, mutationHeaders } from "@/lib/api/client";
import { mapAuthor } from "@/modules/feed/services/feed.service";
import type { NotificationFilter, NotificationPage, NotificationPreferences, PayNotification } from "../types";

type ApiActor = Parameters<typeof mapAuthor>[0];
type ApiNotification = { id: string; type: PayNotification["type"] | "repost" | "message" | "system"; actor: ApiActor | null; post_id: string | null; reply_id: string | null; conversation_id: string | null; message_id: string | null; payload: Record<string, unknown>; read_at: string | null; created_at: string };

function relativeTime(value: string) { const elapsed = Date.now() - new Date(value).getTime(); return elapsed < 60_000 ? "now" : elapsed < 3_600_000 ? `${Math.floor(elapsed / 60_000)}m` : elapsed < 86_400_000 ? `${Math.floor(elapsed / 3_600_000)}h` : `${Math.floor(elapsed / 86_400_000)}d`; }
function textFor(type: ApiNotification["type"], payload: Record<string, unknown>) {
  if (typeof payload.text === "string") return payload.text;
  if (type === "reward") {
    const amount = typeof payload.amount === "number" ? Math.abs(payload.amount) : undefined;
    const label = typeof payload.label === "string" ? payload.label : "your PayMoment activity";
    if (payload.action === "earned" && amount) return `You earned +${amount.toLocaleString()} BOX from ${label}.`;
    if (payload.action === "redeemed" && amount) return `You redeemed ${label} for ${amount.toLocaleString()} BOX.`;
    return "Your BOX reward balance was updated.";
  }
  if (type === "follow") return payload.action === "requested" ? "requested to follow you." : payload.action === "accepted" ? "accepted your follow request." : payload.action === "declined" ? "declined your follow request." : "started following you.";
  return type === "like" ? "liked your Moment." : type === "reply" ? "replied to your Moment." : type === "mention" ? "mentioned you in a Moment." : type === "repost" ? "reposted your Moment." : type === "message" ? "sent you a message." : "sent you an update.";
}
function notificationHref(item: ApiNotification) {
  if (item.conversation_id) return `/messages?conversation=${encodeURIComponent(item.conversation_id)}`;
  if (item.post_id) return `/post/${encodeURIComponent(item.post_id)}${item.reply_id ? `?reply=${encodeURIComponent(item.reply_id)}` : ""}`;
  if (item.type === "reward") return "/rewards";
  return undefined;
}
function mapNotification(item: ApiNotification): PayNotification {
  const followAction = item.type === "follow" && (item.payload.action === "requested" || item.payload.action === "following" || item.payload.action === "accepted" || item.payload.action === "declined") ? item.payload.action : undefined;
  const actor = item.actor ? mapAuthor(item.actor) : undefined;
  if (actor && followAction === "accepted") actor.relationship = "following";
  if (actor && followAction === "declined") actor.relationship = "none";
  return {
    id: item.id,
    type: item.type,
    user: actor,
    text: textFor(item.type, item.payload),
    time: relativeTime(item.created_at),
    read: Boolean(item.read_at),
    href: notificationHref(item),
    rewardAmount: item.type === "reward" && typeof item.payload.amount === "number" ? item.payload.amount : undefined,
    rewardAction: item.type === "reward" && (item.payload.action === "earned" || item.payload.action === "redeemed") ? item.payload.action : undefined,
    followAction,
  };
}

export async function getNotifications(filter: NotificationFilter, cursor?: string, limit = 30): Promise<NotificationPage> {
  const query = new URLSearchParams({ filter, limit: String(limit) });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest<{ data: ApiNotification[]; meta: { next_cursor: string | null } }>(`/api/v1/notifications?${query}`);
  return { notifications: (response.data ?? []).map(mapNotification), nextCursor: response.meta.next_cursor };
}
export async function markNotificationRead(id: string) { await apiRequest(`/api/v1/notifications/${id}/read`, { method: "PUT", headers: mutationHeaders() }); }
export async function markAllNotificationsRead() { await apiRequest(`/api/v1/notifications/read-all`, { method: "PUT", headers: mutationHeaders() }); }
export async function respondFollowRequest(followerId: string, accepted: boolean) { await apiRequest(`/api/v1/users/follow-requests/${encodeURIComponent(followerId)}`, { method: accepted ? "PUT" : "DELETE", headers: mutationHeaders() }); }
export async function getUnreadNotificationCount() { const response = await apiRequest<{ data: { count: number } }>("/api/v1/notifications/unread-count"); return response.data.count; }
export async function getNotificationPreferences() { const response = await apiRequest<{ data: { preferences: { likes: boolean; replies: boolean; mentions: boolean; follows: boolean; rewards: boolean; reposts: boolean; messages: boolean; emailDigest: boolean } } }>("/api/v1/notifications/preferences"); return response.data.preferences; }
export async function updateNotificationPreferences(input: Partial<NotificationPreferences>) { const response = await apiRequest<{ data: { preferences: NotificationPreferences } }>("/api/v1/notifications/preferences", { method: "PUT", headers: mutationHeaders(), body: JSON.stringify({ ...input, ...(input.emailDigest !== undefined ? { email_digest: input.emailDigest } : {}) }) }); return response.data.preferences; }

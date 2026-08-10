import { apiRequest } from "@/lib/api/client";
import { mapApiPost } from "@/modules/feed/services/feed.service";
import type { FeedPost } from "@/modules/feed";

type ApiPost = Parameters<typeof mapApiPost>[0];

export async function getLikedPosts(cursor?: string): Promise<{ posts: FeedPost[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ limit: "20" });
  if (cursor) params.set("cursor", cursor);
  const response = await apiRequest<{ data: ApiPost[]; meta: { next_cursor: string | null } }>(`/api/v1/likes?${params}`);
  return { posts: (response.data ?? []).map(mapApiPost), nextCursor: response.meta.next_cursor };
}

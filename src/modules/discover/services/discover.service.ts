import { apiRequest } from "@/lib/api/client";
import { mapApiPost, mapAuthor } from "@/modules/feed/services/feed.service";
import type { DiscoverPage, DiscoverFilter } from "../types";

type ApiProfile = Parameters<typeof mapAuthor>[0];
type ApiPost = Parameters<typeof mapApiPost>[0];

export async function getDiscoverData(query: string, type: DiscoverFilter, cursor?: string): Promise<DiscoverPage> {
  const params = new URLSearchParams({ q: query, type, limit: "20" });
  if (cursor) params.set("cursor", cursor);
  const response = await apiRequest<{ data: { people: ApiProfile[]; moments: ApiPost[]; articles: ApiPost[]; topics: DiscoverPage["topics"]; page: { next_cursor: string | null; has_more: boolean } } }>(`/api/v1/discover?${params}`);
  return { people: response.data.people.map(mapAuthor), moments: response.data.moments.map(mapApiPost), articles: response.data.articles.map(mapApiPost), topics: response.data.topics, nextCursor: response.data.page.next_cursor, hasMore: response.data.page.has_more };
}

export type DiscoverSuggestion = { type: "person" | "topic"; value: string; label: string };
export async function getDiscoverSuggestions(query: string): Promise<DiscoverSuggestion[]> {
  const params = new URLSearchParams({ q: query, limit: "6" });
  const response = await apiRequest<{ data: { suggestions: DiscoverSuggestion[] } }>(`/api/v1/discover/suggestions?${params}`);
  return response.data.suggestions;
}

export async function getTrendingTopics(): Promise<DiscoverPage["topics"]> {
  const response = await apiRequest<{ data: { topics: DiscoverPage["topics"] } }>("/api/v1/discover/topics/trending?limit=5");
  return response.data.topics;
}

import type { FeedAuthor, FeedPost } from "@/modules/feed";

export type DiscoverData = { people: FeedAuthor[]; moments: FeedPost[]; articles: FeedPost[]; topics: { label: string; slug: string; posts: number }[] };
export type DiscoverPage = DiscoverData & { nextCursor: string | null; hasMore: boolean };
export type DiscoverFilter = "all" | "moments" | "articles" | "people" | "topics";

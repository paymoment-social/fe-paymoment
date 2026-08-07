import type { FeedAuthor, FeedPost } from "@/modules/feed";

export type DiscoverData = { people: FeedAuthor[]; moments: FeedPost[]; topics: { label: string; posts: string }[] };
export type DiscoverFilter = "all" | "moments" | "people" | "topics";

import type { FeedPost } from "@/modules/feed";
import type { BookmarkFilter } from "../types";
export function filterBookmarks(posts: FeedPost[], filter: BookmarkFilter) { if (filter === "media") return posts.filter((post) => post.media?.length || post.card); if (filter === "text") return posts.filter((post) => !post.media?.length && !post.card); return posts; }

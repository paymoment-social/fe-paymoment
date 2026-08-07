import type { FeedPost } from "@/modules/feed";
export function resolveBookmarkedPosts(posts: FeedPost[], bookmarkedIds: string[]) { return posts.filter((post) => bookmarkedIds.includes(post.id)); }

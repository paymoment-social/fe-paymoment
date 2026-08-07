"use client";
import { useFeed, useFeedStore } from "@/modules/feed";
import { useBookmarksContext } from "../context/BookmarksContext";
import { resolveBookmarkedPosts } from "../services/bookmarks.service";
import { filterBookmarks } from "../utils/filterBookmarks";
export function useBookmarks() { const feed = useFeed(); const ids = useFeedStore((state) => state.bookmarkedIds); const { filter } = useBookmarksContext(); const saved = feed.data ? filterBookmarks(resolveBookmarkedPosts(feed.data, ids), filter) : undefined; return { ...feed, data: saved }; }

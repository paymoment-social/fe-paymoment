"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useBookmarksContext } from "../context/BookmarksContext";
import { getBookmarks } from "../services/bookmarks.service";

export function useBookmarks() {
  const { filter } = useBookmarksContext();
  const query = useInfiniteQuery({
    queryKey: ["paymoment", "bookmarks", filter],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getBookmarks(filter, pageParam),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  return { ...query, data: query.data?.pages.flatMap((page) => page.posts) };
}

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getLikedPosts } from "../services/likes.service";

export function useLikes() {
  const query = useInfiniteQuery({
    queryKey: ["paymoment", "likes"],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getLikedPosts(pageParam),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  return { ...query, data: query.data?.pages.flatMap((page) => page.posts) };
}

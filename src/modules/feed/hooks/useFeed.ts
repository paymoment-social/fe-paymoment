"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FEED_QUERY_KEY } from "../constants";
import { getFeedPosts, getNewFeedPostCount, getPost } from "../services/feed.service";

export const postQueryKey = (postId: string) => ["paymoment", "post", postId] as const;

export function useFeed(mode: "latest" | "top" | "for_you" = "latest") {
  const query = useInfiniteQuery({
    queryKey: [...FEED_QUERY_KEY, mode],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getFeedPosts(pageParam, mode),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return { ...query, data: query.data?.pages.flatMap((page) => page.posts) };
}

export function useFeedUpdateCount(mode: "latest" | "top" | "for_you", since?: string) {
  return useQuery({
    queryKey: [...FEED_QUERY_KEY, "updates", mode, since],
    queryFn: () => getNewFeedPostCount(since!),
    enabled: mode === "latest" && Boolean(since),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
  });
}

export function usePost(postId: string) {
  return useQuery({ queryKey: postQueryKey(postId), queryFn: () => getPost(postId), enabled: Boolean(postId) });
}

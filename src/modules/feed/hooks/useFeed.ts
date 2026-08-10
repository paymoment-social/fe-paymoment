"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FEED_QUERY_KEY } from "../constants";
import { getFeedPosts, getPost } from "../services/feed.service";

export const postQueryKey = (postId: string) => ["paymoment", "post", postId] as const;

export function useFeed(mode: "latest" | "top" | "for_you" = "latest") {
  const query = useInfiniteQuery({
    queryKey: [...FEED_QUERY_KEY, mode],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getFeedPosts(pageParam, mode),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  return { ...query, data: query.data?.pages.flatMap((page) => page.posts) };
}

export function useFeedHead(mode: "latest" | "top" | "for_you" = "latest") {
  return useQuery({
    queryKey: [...FEED_QUERY_KEY, "head", mode],
    queryFn: () => getFeedPosts(undefined, mode, 100),
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
  });
}

export function usePost(postId: string) {
  return useQuery({ queryKey: postQueryKey(postId), queryFn: () => getPost(postId), enabled: Boolean(postId) });
}

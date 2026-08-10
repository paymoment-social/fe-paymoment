"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { FEED_QUERY_KEY } from "../constants";
import { getFeedPosts, getNewFeedPostCount, getPost } from "../services/feed.service";

export const postQueryKey = (postId: string) => ["paymoment", "post", postId] as const;

type FeedMode = "latest" | "top" | "for_you";
type FeedPage = Awaited<ReturnType<typeof getFeedPosts>>;

export function useFeed(mode: FeedMode = "latest") {
  const queryClient = useQueryClient();
  const queryKey = [...FEED_QUERY_KEY, mode] as const;
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getFeedPosts(pageParam, mode),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const topRefresh = useMutation({
    mutationFn: () => getFeedPosts(undefined, mode),
    onSuccess: (firstPage) => {
      queryClient.setQueryData<InfiniteData<FeedPage>>(queryKey, { pages: [firstPage], pageParams: [undefined] });
      queryClient.removeQueries({ queryKey: ["paymoment", "feed-updates", mode] });
    },
  });
  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.posts),
    refreshFromTop: topRefresh.mutateAsync,
    isRefreshingFromTop: topRefresh.isPending,
    refreshFromTopError: topRefresh.error,
  };
}

export function useFeedUpdateCount(mode: FeedMode, since?: string) {
  return useQuery({
    // Keep this outside FEED_QUERY_KEY. Mutations update the infinite feed
    // cache by prefix and must never treat this numeric result as feed pages.
    queryKey: ["paymoment", "feed-updates", mode, since],
    queryFn: () => getNewFeedPostCount(since!),
    enabled: Boolean(since),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
  });
}

export function usePost(postId: string) {
  return useQuery({ queryKey: postQueryKey(postId), queryFn: () => getPost(postId), enabled: Boolean(postId) });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { FEED_QUERY_KEY } from "../constants";
import { getFeedPosts } from "../services/feed.service";
import { useFeedStore } from "../store/useFeedStore";

export function useFeed() {
  const query = useQuery({ queryKey: FEED_QUERY_KEY, queryFn: getFeedPosts });
  const localPosts = useFeedStore((state) => state.localPosts);
  return { ...query, data: query.data ? [...localPosts, ...query.data] : undefined };
}

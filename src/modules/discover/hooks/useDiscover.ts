"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { DISCOVER_QUERY_KEY } from "../constants";
import { useDiscoverContext } from "../context/DiscoverContext";
import { getDiscoverData, getDiscoverSuggestions, getTrendingTopics } from "../services/discover.service";

export function useDiscover() {
  const { query, filter } = useDiscoverContext();
  const result = useInfiniteQuery({ queryKey: [...DISCOVER_QUERY_KEY, query, filter], initialPageParam: undefined as string | undefined, queryFn: ({ pageParam }) => getDiscoverData(query, filter, pageParam), getNextPageParam: (page) => page.nextCursor ?? undefined, staleTime: 15_000 });
  return { ...result, data: result.data ? { people: result.data.pages.flatMap((page) => page.people), moments: result.data.pages.flatMap((page) => page.moments), articles: result.data.pages.flatMap((page) => page.articles), topics: result.data.pages.flatMap((page) => page.topics) } : undefined };
}

export function useDiscoverSuggestions(query: string) {
  return useQuery({ queryKey: [...DISCOVER_QUERY_KEY, "suggestions", query], queryFn: () => getDiscoverSuggestions(query), enabled: query.trim().length >= 2, staleTime: 30_000 });
}

export function useTrendingTopics() {
  return useQuery({ queryKey: [...DISCOVER_QUERY_KEY, "trending"], queryFn: getTrendingTopics, staleTime: 60_000 });
}

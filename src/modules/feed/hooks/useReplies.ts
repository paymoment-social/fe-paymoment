"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getReplies } from "../services/feed.service";

export const repliesQueryKey = (postId: string, parentId?: string) => ["paymoment", "posts", postId, "replies", parentId ?? "root"] as const;

export function useReplies(postId: string, parentId?: string) {
  const query = useInfiniteQuery({
    queryKey: repliesQueryKey(postId, parentId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getReplies(postId, pageParam, parentId),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  return { ...query, data: query.data?.pages.flatMap((page) => page.replies) };
}

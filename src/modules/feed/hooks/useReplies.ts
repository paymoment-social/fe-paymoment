"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getReplies } from "../services/feed.service";

export const repliesQueryKey = (postId: string, parentId?: string) => ["paymoment", "posts", postId, "replies", parentId ?? "root"] as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useReplies(postId: string, parentId?: string) {
  const query = useInfiniteQuery({
    queryKey: repliesQueryKey(postId, parentId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getReplies(postId, pageParam, parentId),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: !parentId || UUID_PATTERN.test(parentId),
  });
  return { ...query, data: query.data?.pages.flatMap((page) => page.replies) };
}

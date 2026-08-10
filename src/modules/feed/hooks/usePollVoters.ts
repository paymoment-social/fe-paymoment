"use client";

import { useQuery } from "@tanstack/react-query";
import { getPollVoters } from "../services/feed.service";

export function usePollVoters(postId: string, enabled: boolean) {
  return useQuery({ queryKey: ["paymoment", "polls", postId, "voters"], queryFn: () => getPollVoters(postId), enabled });
}

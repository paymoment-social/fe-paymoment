"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPublicProfile, getPublicProfilePosts } from "../services/profile.service";

export function usePublicProfile(username: string) {
  return useQuery({ queryKey: ["paymoment", "profile", "public", username.toLowerCase()], queryFn: () => getPublicProfile(username), enabled: Boolean(username) });
}


export function usePublicProfilePosts(username: string) {
  return useInfiniteQuery({ queryKey: ["paymoment", "profile", "public", username.toLowerCase(), "posts"], queryFn: ({ pageParam }) => getPublicProfilePosts(username, pageParam), initialPageParam: undefined as string | undefined, getNextPageParam: (page) => page.nextCursor ?? undefined, enabled: Boolean(username) });
}

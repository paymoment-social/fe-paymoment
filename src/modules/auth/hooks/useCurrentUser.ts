"use client";

import type { FeedAuthor } from "@/modules/feed/types";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { useSession } from "./useSession";

export function useCurrentUser(): FeedAuthor {
  const profile = useProfile();
  const session = useSession();
  if (profile.data) return profile.data;
  return {
    id: session.data?.id ?? "",
    name: session.data?.display_name ?? "PayMoment user",
    handle: session.data?.username ?? "",
    avatar: session.data?.avatar_url ?? "",
    verified: session.data?.entitlement.verified ?? false,
    followers: 0,
    following: 0,
    box: session.data?.entitlement.points_balance ?? 0,
  };
}

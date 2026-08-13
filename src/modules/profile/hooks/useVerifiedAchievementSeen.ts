"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "../constants";
import { markVerifiedAchievementSeen } from "../services/profile.service";
import type { ProfileData } from "../types";

export function useVerifiedAchievementSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markVerifiedAchievementSeen,
    onSuccess: (seenAt) => {
      queryClient.setQueryData<ProfileData>(PROFILE_QUERY_KEY, (current) => current ? { ...current, verifiedAchievementSeenAt: seenAt } : current);
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "../constants";
import { updateProfile } from "../services/profile.service";
import type { ProfileData } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (next: ProfileData) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
      const previous = queryClient.getQueryData<ProfileData>(PROFILE_QUERY_KEY);
      queryClient.setQueryData(PROFILE_QUERY_KEY, next);
      return { previous };
    },
    onError: (_error, _next, context) => queryClient.setQueryData(PROFILE_QUERY_KEY, context?.previous),
    onSuccess: (saved) => queryClient.setQueryData(PROFILE_QUERY_KEY, saved),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["paymoment", "session"] }),
  });
}

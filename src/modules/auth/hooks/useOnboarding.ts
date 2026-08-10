"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding, getInterests, getUsernameAvailability } from "../services/onboarding.service";

export function useInterests() {
  return useQuery({ queryKey: ["paymoment", "interests"], queryFn: getInterests, staleTime: 60 * 60_000 });
}

export function useUsernameAvailability(username: string, enabled: boolean) {
  return useQuery({ queryKey: ["paymoment", "username-availability", username.toLowerCase()], queryFn: () => getUsernameAvailability(username), enabled, staleTime: 30_000, retry: false });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: completeOnboarding, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paymoment", "session"] }) });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicProfile } from "../services/profile.service";

export function usePublicProfile(username: string) {
  return useQuery({ queryKey: ["paymoment", "profile", "public", username.toLowerCase()], queryFn: () => getPublicProfile(username), enabled: Boolean(username) });
}

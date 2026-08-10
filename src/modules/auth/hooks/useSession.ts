"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession } from "../services/auth.service";

export const SESSION_QUERY_KEY = ["paymoment", "session"] as const;

export function useSession() {
  return useQuery({ queryKey: SESSION_QUERY_KEY, queryFn: getSession, staleTime: 60_000, retry: false });
}

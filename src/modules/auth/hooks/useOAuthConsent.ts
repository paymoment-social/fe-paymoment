"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { decideOAuthConsent, getOAuthConsentRequest } from "../services/agent.service";
import type { ConnectionDuration } from "../services/agent.service";

export function useOAuthConsentRequest(requestId: string) {
  return useQuery({
    queryKey: ["paymoment", "oauth-consent", requestId],
    queryFn: () => getOAuthConsentRequest(requestId),
    enabled: Boolean(requestId),
    staleTime: 30_000,
    retry: false,
  });
}

export function useOAuthConsentDecision(requestId: string) {
  return useMutation({
    mutationFn: ({ decision, expiresInDays }: { decision: "approve" | "deny"; expiresInDays: ConnectionDuration }) => decideOAuthConsent(requestId, decision, expiresInDays),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentConnections, revokeAgentConnection } from "../services/agent.service";

export const AGENT_CONNECTIONS_QUERY_KEY = ["paymoment", "agent-connections"] as const;

export function useAgentConnections() {
  return useQuery({ queryKey: AGENT_CONNECTIONS_QUERY_KEY, queryFn: getAgentConnections, staleTime: 30_000, retry: false });
}

export function useRevokeAgentConnection() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: revokeAgentConnection, onSuccess: () => queryClient.invalidateQueries({ queryKey: AGENT_CONNECTIONS_QUERY_KEY }) });
}

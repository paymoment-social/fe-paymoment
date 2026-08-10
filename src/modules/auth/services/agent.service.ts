import { apiRequest } from "@/lib/api/client";

export type AgentConnection = {
  clientId: string;
  name: string;
  scopes: string[];
  status: "active" | "revoked";
  grantedAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  tokenExpiresAt: string | null;
};

export function getAgentConnections() {
  return apiRequest<{ data: { connections: AgentConnection[] } }>("/api/v1/mcp/connections").then((response) => response.data.connections);
}

export function revokeAgentConnection(clientId: string) {
  return apiRequest<{ data: { revoked: true } }>(`/api/v1/mcp/connections/${encodeURIComponent(clientId)}`, { method: "DELETE" });
}

import { apiRequest } from "@/lib/api/client";

export type ConnectionDuration = "never" | 1 | 7 | 30 | 90;

export type AgentConnection = {
  clientId: string;
  name: string;
  scopes: string[];
  status: "active" | "expired" | "revoked";
  grantedAt: string;
  expiresAt: string | null;
  updatedAt: string;
  lastUsedAt: string | null;
  tokenExpiresAt: string | null;
};

export type OAuthConsentRequest = {
  requestId: string;
  client: { name: string };
  permissions: Array<{ scope: string; title: string; description: string }>;
  expiration: { options: ConnectionDuration[]; default: ConnectionDuration };
};

export function getAgentConnections() {
  return apiRequest<{ data: { connections: AgentConnection[] } }>("/api/v1/mcp/connections").then((response) => response.data.connections);
}

export function revokeAgentConnection(clientId: string) {
  return apiRequest<{ data: { revoked: true } }>(`/api/v1/mcp/connections/${encodeURIComponent(clientId)}`, { method: "DELETE" });
}

export function getOAuthConsentRequest(requestId: string) {
  return apiRequest<{ data: { request_id: string; client: OAuthConsentRequest["client"]; permissions: OAuthConsentRequest["permissions"]; expiration: { options: ConnectionDuration[]; default: ConnectionDuration } } }>(`/api/v1/mcp/oauth-requests/${encodeURIComponent(requestId)}`)
    .then((response) => ({ requestId: response.data.request_id, client: response.data.client, permissions: response.data.permissions, expiration: response.data.expiration }));
}

export function decideOAuthConsent(requestId: string, decision: "approve" | "deny", expiresInDays: ConnectionDuration) {
  return apiRequest<{ data: { redirect_url: string } }>(`/api/v1/mcp/oauth-requests/${encodeURIComponent(requestId)}`, {
    method: "POST",
    body: JSON.stringify({ decision, expires_in_days: expiresInDays }),
  }).then((response) => response.data.redirect_url);
}

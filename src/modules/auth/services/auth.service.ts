import { apiRequest } from "@/lib/api/client";
import type { SessionResponse } from "../types";

export function getSession() {
  return apiRequest<SessionResponse>("/api/v1/auth/session").then((response) => response.data.user);
}

export function logout() {
  return apiRequest<{ data: { logged_out: true } }>("/api/v1/auth/logout", { method: "POST" });
}

import { apiRequest, mutationHeaders } from "@/lib/api/client";

export type ReportReason = "spam" | "harassment" | "hate" | "violence" | "sexual_content" | "impersonation" | "self_harm" | "other";
export type UserReport = { id: string; target_type: "user" | "post" | "reply" | "message"; reason: ReportReason; status: "open" | "reviewing" | "resolved" | "dismissed"; created_at: string; resolved_at: string | null };
export type ModerationStatus = UserReport["status"];
export type ModerationReport = UserReport & { reporter_id: string; target_id: string; details: string | null; reviewed_by_id: string | null; resolution: string | null; updated_at: string };

export async function getMyReports(): Promise<UserReport[]> {
  const response = await apiRequest<{ data: { reports: UserReport[] } }>("/api/v1/reports/mine");
  return response.data.reports;
}

export async function submitPostReport(postId: string, reason: ReportReason, details: string) {
  const response = await apiRequest<{ data: { report: { id: string; status: string } } }>("/api/v1/reports", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ target_type: "post", target_id: postId, reason, ...(details.trim() ? { details: details.trim() } : {}) }) });
  return response.data.report;
}

export async function getModerationReports(status: ModerationStatus): Promise<ModerationReport[]> {
  const response = await apiRequest<{ data: { reports: ModerationReport[] } }>(`/api/v1/reports/moderation?status=${status}&limit=50`);
  return response.data.reports;
}

export async function reviewModerationReport(id: string, input: { action: "reviewing" | "resolved" | "dismissed"; resolution?: string; moderate_target: boolean }) {
  const response = await apiRequest<{ data: { report: Pick<ModerationReport, "id" | "status" | "resolution" | "resolved_at"> & { moderated: boolean } } }>(`/api/v1/reports/${id}/moderation`, {
    method: "PATCH",
    headers: mutationHeaders(),
    body: JSON.stringify(input),
  });
  return response.data.report;
}

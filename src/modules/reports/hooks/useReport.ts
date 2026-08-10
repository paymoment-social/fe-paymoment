"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getModerationReports, getMyReports, reviewModerationReport, submitPostReport, type ModerationStatus, type ReportReason } from "../services/reports.service";

export function usePostReport() { return useMutation({ mutationFn: ({ postId, reason, details }: { postId: string; reason: ReportReason; details: string }) => submitPostReport(postId, reason, details) }); }
export function useMyReports() { return useQuery({ queryKey: ["reports", "mine"], queryFn: getMyReports, staleTime: 30_000 }); }
export function useModerationReports(status: ModerationStatus) { return useQuery({ queryKey: ["reports", "moderation", status], queryFn: () => getModerationReports(status), staleTime: 15_000 }); }
export function useReviewModerationReport() { return useMutation({ mutationFn: ({ id, ...input }: { id: string; action: "reviewing" | "resolved" | "dismissed"; resolution?: string; moderate_target: boolean }) => reviewModerationReport(id, input) }); }

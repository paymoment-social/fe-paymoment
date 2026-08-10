"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePostReport } from "../hooks/useReport";
import type { ReportReason } from "../services/reports.service";

const reasons: Array<[ReportReason, string]> = [["spam", "Spam or scam"], ["harassment", "Harassment"], ["hate", "Hateful content"], ["violence", "Violence or threats"], ["sexual_content", "Sexual content"], ["impersonation", "Impersonation"], ["self_harm", "Self-harm"], ["other", "Other"]];
export function ReportPostDialog({ postId, open, onOpenChange }: { postId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const report = usePostReport();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const error = report.isError ? report.error.message : null;
  return <Dialog open={open} onOpenChange={(next) => { if (!next) { setReason(""); setDetails(""); } onOpenChange(next); }}><DialogContent className="max-w-md bg-popover"><DialogHeader><DialogTitle>Report Moment</DialogTitle><DialogDescription>Reports are reviewed to help keep PayMoment safe.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!reason) return; report.mutate({ postId, reason, details }, { onSuccess: () => onOpenChange(false) }); }}><fieldset className="space-y-2"><legend className="text-sm font-medium">What is the issue?</legend>{reasons.map(([value, label]) => <label key={value} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-secondary"><input type="radio" name={`report-${postId}`} value={value} checked={reason === value} onChange={() => setReason(value)} className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring" /><span className="text-sm">{label}</span></label>)}</fieldset><div className="space-y-1.5"><label htmlFor={`report-details-${postId}`} className="text-sm font-medium">Details <span className="text-muted-foreground">(optional)</span></label><Input id={`report-details-${postId}`} value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} placeholder="Add context that may help review" autoComplete="off" /></div>{error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" className="h-10" disabled={!reason || report.isPending} aria-busy={report.isPending}>{report.isPending ? "Sending..." : "Submit report"}</Button></div></form></DialogContent></Dialog>;
}

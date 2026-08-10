"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { useModerationReports, useReviewModerationReport } from "../hooks/useReport";
import type { ModerationStatus } from "../services/reports.service";

const statuses: ModerationStatus[] = ["open", "reviewing", "resolved", "dismissed"];
const readable = (value: string) => value.replaceAll("_", " ");

export function ModerationView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = searchParams.get("status");
  const status: ModerationStatus = statuses.includes(requested as ModerationStatus) ? requested as ModerationStatus : "open";
  const reports = useModerationReports(status);
  const review = useReviewModerationReport();
  const [resolution, setResolution] = useState<Record<string, string>>({});
  const [enforce, setEnforce] = useState<Record<string, boolean>>({});

  function setStatus(next: ModerationStatus) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", next);
    router.replace(`${pathname}?${params.toString()}`);
  }
  async function submit(id: string, action: "reviewing" | "resolved" | "dismissed") {
    const note = resolution[id]?.trim();
    if (action === "resolved" && !note) return toast.error("Add a resolution before resolving this report.");
    try {
      await review.mutateAsync({ id, action, resolution: note || undefined, moderate_target: enforce[id] ?? false });
      await reports.refetch();
      toast.success(action === "reviewing" ? "Report is now under review." : "Report updated.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not update the report. Try again.");
    }
  }

  return <section aria-labelledby="moderation-title" className="space-y-4">
    <div className="rounded-xl border border-border/70 bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="moderation-title" className="text-lg font-semibold">Report queue</h2><p className="mt-1 text-sm text-muted-foreground">Review reports carefully. Every decision is recorded in the audit log.</p></div><label className="text-sm font-medium">Status<select value={status} onChange={(event) => setStatus(event.target.value as ModerationStatus)} className="ml-2 h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></label></div></div>
    {reports.isLoading ? <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl bg-secondary" />)}</div> : reports.isError ? <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5"><h3 className="font-medium">Could not load the report queue.</h3><p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void reports.refetch()}>Try again</Button></div> : !reports.data?.length ? <div className="rounded-xl border border-dashed border-border p-8 text-center"><Icon icon="solar:check-circle-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h3 className="mt-3 font-semibold">No {status} reports</h3><p className="mt-1 text-sm text-muted-foreground">The queue is clear for this status.</p></div> : <ul className="space-y-3">{reports.data.map((report) => <li key={report.id} className="rounded-xl border border-border/70 bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold capitalize">{readable(report.reason)} report</p><p className="mt-1 font-mono text-xs text-muted-foreground">Target: {report.target_type} · {report.target_id}</p></div><time className="text-xs text-muted-foreground" dateTime={report.created_at}>{new Date(report.created_at).toLocaleString()}</time></div>{report.details && <p className="mt-3 rounded-lg bg-secondary/70 p-3 text-sm leading-6">{report.details}</p>}{["open", "reviewing"].includes(report.status) && <div className="mt-4 space-y-3 border-t border-border/70 pt-4"><label className="block text-sm font-medium">Resolution<textarea value={resolution[report.id] ?? ""} onChange={(event) => setResolution((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={2000} rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Explain the decision if you resolve this report." /></label><label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={enforce[report.id] ?? false} onChange={(event) => setEnforce((current) => ({ ...current, [report.id]: event.target.checked }))} className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring" />Apply enforcement to the reported target when resolving</label><div className="flex flex-wrap gap-2"><Button variant="outline" className="min-h-10" disabled={review.isPending} aria-busy={review.isPending} onClick={() => void submit(report.id, "reviewing")}>Mark reviewing</Button><Button variant="outline" className="min-h-10" disabled={review.isPending} aria-busy={review.isPending} onClick={() => void submit(report.id, "dismissed")}>Dismiss</Button><Button className="min-h-10" disabled={review.isPending} aria-busy={review.isPending} onClick={() => void submit(report.id, "resolved")}>Resolve</Button></div></div>}</li>)}</ul>}
  </section>;
}

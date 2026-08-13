"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useMyReports } from "@/modules/reports/hooks/useReport";
import type { ProfileData } from "../types";

type PrivacyKey = "showPayBoxBadge" | "showRecentViews" | "allowMessages";
const options: Array<{ key: PrivacyKey; title: string; description: string }> = [
  { key: "showPayBoxBadge", title: "Show PayMoment badge", description: "Display your PayMoment connection on your profile." },
  { key: "showRecentViews", title: "Show recent views", description: "Allow eligible profile view activity to be shown." },
  { key: "allowMessages", title: "Allow message requests", description: "Let people ask permission to start a private conversation." },
];

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const profile = useProfile();
  const reports = useMyReports();
  const update = useUpdateProfile();
  const [changes, setChanges] = useState<Partial<Pick<ProfileData, PrivacyKey>>>({});
  const draft = profile.data ? { ...profile.data, ...changes } : undefined;
  const save = async () => {
    if (!draft) return;
    try { await update.mutateAsync(draft); toast.success("Settings saved"); onOpenChange(false); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Settings could not be saved. Try again."); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85vh] max-w-md overflow-y-auto bg-popover"><DialogHeader><DialogTitle>Settings</DialogTitle><DialogDescription>Control how your profile and private messages work.</DialogDescription></DialogHeader>{profile.isLoading ? <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : profile.isError ? <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"><p className="font-medium">Could not load settings.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void profile.refetch()}>Try again</Button></div> : !draft ? null : <div className="space-y-1">{options.map((option) => <label key={option.key} className="flex min-h-16 cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-secondary"><input type="checkbox" checked={draft[option.key]} onChange={(event) => setChanges((current) => ({ ...current, [option.key]: event.target.checked }))} className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{option.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span></span></label>)}<Button className="mt-4 h-11 w-full" disabled={update.isPending} aria-busy={update.isPending} onClick={() => void save()}>{update.isPending ? "Saving..." : "Save settings"}</Button><section className="mt-6 border-t pt-4" aria-labelledby="report-history-title"><h3 id="report-history-title" className="text-sm font-medium">Your reports</h3><p className="mt-1 text-xs text-muted-foreground">We keep your report details private while it is being reviewed.</p>{reports.isLoading ? <div className="mt-3 space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : reports.isError ? <div role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs"><p>Could not load your reports.</p><Button variant="outline" className="mt-2 h-10" onClick={() => void reports.refetch()}>Try again</Button></div> : reports.data?.length ? <ul className="mt-3 space-y-2">{reports.data.map((report) => <li key={report.id} className="rounded-lg border border-border/70 p-3 text-xs"><div className="flex items-center justify-between gap-2"><span className="capitalize text-muted-foreground">{report.target_type} report</span><span className="font-medium capitalize">{report.status}</span></div><p className="mt-1 capitalize">{report.reason.replaceAll("_", " ")}</p><time className="mt-1 block text-muted-foreground" dateTime={report.created_at}>{new Date(report.created_at).toLocaleDateString()}</time></li>)}</ul> : <p className="mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">You have not submitted any reports.</p>}</section></div>}</DialogContent></Dialog>;
}

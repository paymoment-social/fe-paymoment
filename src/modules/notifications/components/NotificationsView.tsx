"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthorAvatar } from "@/modules/feed";
import { useUserFollow } from "@/modules/feed/hooks/usePostMutations";
import { NOTIFICATION_FILTERS } from "../constants";
import { useNotificationsContext } from "../context/NotificationsContext";
import { useNotificationPreferences, useNotificationRead, useNotifications, useNotificationsReadAll, useUpdateNotificationPreferences } from "../hooks/useNotifications";
import type { NotificationPreferences } from "../types";
import { notificationIcon } from "../utils/notificationIcon";

export function NotificationsView() {
  const result = useNotifications();
  const { filter, setFilter } = useNotificationsContext();
  const markRead = useNotificationRead();
  const markAllRead = useNotificationsReadAll();
  const follow = useUserFollow();
  const router = useRouter();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  if (result.isLoading) return <div className="space-y-2" aria-label="Loading notifications">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}</div>;
  if (result.isError) return <section className="rounded-xl border border-destructive/30 bg-card p-5"><p className="font-medium">Could not load notifications</p><p className="mt-1 text-sm text-muted-foreground">Your activity is safe. Try again in a moment.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void result.refetch()}>Try again</Button></section>;
  const items = result.data ?? [];
  const unread = items.filter((item) => !item.read).length;
  return <div className="space-y-3">
    <div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Activity</h2><p className="text-sm text-muted-foreground">{unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You are all caught up"}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" className="size-10" aria-label="Notification preferences" onClick={() => setPreferencesOpen(true)}><Icon icon="solar:settings-linear" className="size-5" /></Button><Button variant="ghost" className="h-10 text-primary" disabled={!unread || markAllRead.isPending} onClick={() => markAllRead.mutate()}>Mark all read</Button></div></div>
    <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}><TabsList className="grid h-11 w-full grid-cols-3 bg-card/70">{NOTIFICATION_FILTERS.map((item) => <TabsTrigger key={item} value={item} className="capitalize">{item}</TabsTrigger>)}</TabsList></Tabs>
    <section className="overflow-hidden rounded-xl border bg-card/55">{items.length ? items.map((item) => { const following = item.user?.relationship === "following"; return <article key={item.id} className={`flex gap-3 border-b p-4 last:border-0 ${item.read ? "" : "bg-primary/5"}`}><button type="button" onClick={() => { if (!item.read) markRead.mutate(item.id); if (item.href) router.push(item.href); }} className="flex min-w-0 flex-1 gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={item.href ? `Open notification from ${item.user?.name ?? "PayMoment"}` : `Mark notification from ${item.user?.name ?? "PayMoment"} as read`}>{item.user ? <AuthorAvatar author={item.user} /> : <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Icon icon="solar:box-bold" className="size-5" aria-hidden="true" /></div>}<div className="min-w-0 flex-1"><p className="text-sm leading-6">{item.user && <span className="font-semibold">{item.user.name} </span>}{item.text}</p><p className="mt-1 text-xs text-muted-foreground">{item.time}</p></div>{!item.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</button><div className="flex items-center gap-1"><Icon icon={notificationIcon[item.type]} className="size-5 text-primary" aria-hidden="true" />{item.type === "follow" && item.user && <Button variant={following ? "outline" : "default"} size="sm" className="ml-2 h-10" disabled={follow.isPending} onClick={() => follow.mutate({ userId: item.user!.id, enabled: !following })}>{following ? "Following" : "Follow"}</Button>}</div></article>; }) : <div className="p-12 text-center"><Icon icon="solar:bell-off-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h3 className="mt-3 font-semibold">Nothing here yet</h3><p className="text-sm text-muted-foreground">New {filter === "all" ? "activity" : filter} will appear here.</p></div>}</section>
    <NotificationPreferencesDialog open={preferencesOpen} onOpenChange={setPreferencesOpen} />
  </div>;
}

const preferenceLabels: Array<[keyof NotificationPreferences, string]> = [["likes", "Likes"], ["replies", "Replies"], ["mentions", "Mentions"], ["follows", "Follows"], ["rewards", "Rewards"], ["reposts", "Reposts"], ["messages", "Messages"], ["emailDigest", "Email digest"]];
function NotificationPreferencesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const preferences = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const [changes, setChanges] = useState<Partial<NotificationPreferences>>({});
  const error = preferences.isError ? preferences.error.message : update.isError ? update.error.message : null;
  return <Dialog open={open} onOpenChange={(next) => { if (!next) setChanges({}); onOpenChange(next); }}><DialogContent className="max-w-md bg-popover"><DialogHeader><DialogTitle>Notification preferences</DialogTitle><DialogDescription>Choose the activity updates you want to receive.</DialogDescription></DialogHeader>{preferences.isLoading || !preferences.data ? <div className="space-y-2 py-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-11 w-full" />)}</div> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); update.mutate({ ...preferences.data, ...changes }, { onSuccess: () => onOpenChange(false) }); }}><fieldset className="space-y-1"><legend className="sr-only">Notification delivery preferences</legend>{preferenceLabels.map(([key, label]) => <label key={key} className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg px-2 hover:bg-secondary"><span className="text-sm font-medium">{label}</span><input type="checkbox" checked={changes[key] ?? preferences.data[key]} onChange={(event) => setChanges({ ...changes, [key]: event.target.checked })} className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring" /></label>)}</fieldset>{error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" className="h-10" disabled={update.isPending} aria-busy={update.isPending}>{update.isPending ? "Saving..." : "Save preferences"}</Button></div></form>}</DialogContent></Dialog>;
}

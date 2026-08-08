"use client";

import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthorAvatar, useFeedStore } from "@/modules/feed";
import { NOTIFICATION_FILTERS } from "../constants";
import { useNotificationsContext } from "../context/NotificationsContext";
import { useNotifications } from "../hooks/useNotifications";
import { notificationIcon } from "../utils/notificationIcon";

export function NotificationsView() {
  const result = useNotifications();
  const { extraNotifications, readIds, filter, setFilter, markRead, markAllRead } = useNotificationsContext();
  const following = useFeedStore((state) => state.followingIds);
  const toggleFollow = useFeedStore((state) => state.toggleFollow);
  if (result.isLoading) return <div className="space-y-2" aria-label="Loading notifications">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}</div>;
  if (result.isError) return <section className="rounded-xl border border-destructive/30 bg-card p-5"><p className="font-medium">Couldn’t load notifications</p><p className="mt-1 text-sm text-muted-foreground">Your activity is safe. Try again in a moment.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void result.refetch()}>Try again</Button></section>;
  const allItems = [...extraNotifications, ...(result.data ?? [])];
  const items = allItems.filter((item) => filter === "all" || (filter === "rewards" ? item.type === "reward" : filter === "mentions" ? item.type === "mention" : item.type === "reply" || item.type === "like"));
  const unread = allItems.filter((item) => !item.read && !readIds.includes(item.id)).length;
  return <div className="space-y-3">
    <div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Activity</h2><p className="text-sm text-muted-foreground">{unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You’re all caught up"}</p></div><Button variant="ghost" className="h-10 text-primary" disabled={!unread} onClick={() => markAllRead(allItems.map((item) => item.id))}>Mark all read</Button></div>
    <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}><TabsList className="grid h-11 w-full grid-cols-3 bg-card/70">{NOTIFICATION_FILTERS.map((item) => <TabsTrigger key={item} value={item} className="capitalize">{item}</TabsTrigger>)}</TabsList></Tabs>
    <section className="overflow-hidden rounded-xl border bg-card/55">{items.length ? items.map((item) => { const read = item.read || readIds.includes(item.id); const isFollowing = item.user ? following.includes(item.user.id) : false; return <article key={item.id} className={`flex gap-3 border-b p-4 last:border-0 ${read ? "" : "bg-primary/5"}`}><button type="button" onClick={() => markRead(item.id)} className="flex min-w-0 flex-1 gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Mark notification from ${item.user?.name ?? "PayMoment"} as read`}>{item.user ? <AuthorAvatar author={item.user} /> : <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Icon icon="solar:box-bold" className="size-5" aria-hidden="true" /></div>}<div className="min-w-0 flex-1"><p className="text-sm leading-6">{item.user && <span className="font-semibold">{item.user.name} </span>}{item.text}</p><p className="mt-1 text-xs text-muted-foreground">{item.time}</p></div>{!read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</button><div className="flex items-center gap-1"><Icon icon={notificationIcon[item.type]} className="size-5 text-primary" aria-hidden="true" />{item.type === "follow" && item.user && <Button variant={isFollowing ? "outline" : "default"} size="sm" className="ml-2 h-10" onClick={() => toggleFollow(item.user!.id)}>{isFollowing ? "Following" : "Follow"}</Button>}{item.type === "reply" && <Button variant="ghost" size="sm" className="ml-1 h-10" onClick={() => toast.info("Opening conversation thread")}>Reply</Button>}</div></article>; }) : <div className="p-12 text-center"><Icon icon="solar:bell-off-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h3 className="mt-3 font-semibold">Nothing here yet</h3><p className="text-sm text-muted-foreground">New {filter === "all" ? "activity" : filter} will appear here.</p></div>}</section>
  </div>;
}

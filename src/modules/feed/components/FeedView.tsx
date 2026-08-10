"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeed, useFeedUpdateCount } from "../hooks/useFeed";
import { useComposer } from "../context/ComposerContext";
import { Composer } from "./Composer";
import { PostCard } from "./PostCard";

export function FeedView({ mode = "latest" }: { mode?: "latest" | "top" | "for_you" }) {
  const feed = useFeed(mode);
  const { setOpen } = useComposer();
  const visiblePosts = feed.data ?? [];
  const newestVisibleAt = visiblePosts.reduce<string | undefined>((newest, post) => {
    if (!post.createdAtValue || Number.isNaN(Date.parse(post.createdAtValue))) return newest;
    if (!newest || Date.parse(post.createdAtValue) > Date.parse(newest)) return post.createdAtValue;
    return newest;
  }, undefined);
  const feedUpdates = useFeedUpdateCount(mode, newestVisibleAt);
  const newPostCount = feedUpdates.data ?? 0;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = feed;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "640px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (feed.isLoading) return <FeedSkeleton />;
  if (feed.isError) {
    return (
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 text-destructive"><Icon icon="solar:danger-triangle-linear" className="size-5" aria-hidden="true" /><h2 className="font-semibold">Couldn’t load your feed</h2></div>
        <p className="mt-2 text-sm text-muted-foreground">Check your connection and try once more.</p>
        <Button variant="outline" className="mt-4 h-10" onClick={() => void feed.refetch()}>Try again</Button>
      </section>
    );
  }
  if (!feed.data?.length) {
    return (
      <section className="rounded-xl border bg-card p-10 text-center">
        <Icon icon="solar:pen-new-square-linear" className="mx-auto size-10 text-primary" aria-hidden="true" />
        <h2 className="mt-4 font-semibold">Your feed is ready for a first moment</h2>
        <p className="mt-1 text-sm text-muted-foreground">Share what you’re building or learning today.</p>
        <Button className="mt-5 h-10" onClick={() => setOpen(true)}>Create a moment</Button>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {newPostCount > 0 && <Button type="button" variant="outline" className="sticky top-14 z-10 mx-auto flex h-10 rounded-full border-primary/40 bg-background/95 px-4 text-xs text-primary shadow-sm backdrop-blur" disabled={feed.isRefreshingFromTop} aria-busy={feed.isRefreshingFromTop} onClick={() => void feed.refreshFromTop().then(() => window.scrollTo({ top: 0, behavior: "smooth" })).catch(() => undefined)}>{feed.isRefreshingFromTop ? "Refreshing..." : feed.refreshFromTopError ? "Try showing new posts again" : `Show ${newPostCount} new post${newPostCount === 1 ? "" : "s"}`}</Button>}
      <Composer compact />
      {feed.data.map((post) => <PostCard key={post.id} post={post} />)}
      {hasNextPage && <div ref={loadMoreRef} className="min-h-24 py-3" aria-live="polite">
        {isFetchingNextPage && <FeedPageSkeleton />}
        {feed.isFetchNextPageError && <div className="flex justify-center"><Button variant="outline" className="h-10 rounded-full" onClick={() => void fetchNextPage()}>Try loading again</Button></div>}
      </div>}
      {!hasNextPage && <p className="py-5 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>}
    </div>
  );
}

function FeedPageSkeleton() {
  return <div className="space-y-3" aria-label="Loading more moments" aria-busy="true">
    {[0, 1].map((item) => <div key={item} className="space-y-3 rounded-xl border bg-card/45 p-4 sm:p-5">
      <div className="flex gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-20" /></div></div>
      <Skeleton className="h-14 w-full" />
    </div>)}
  </div>;
}

function FeedSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading moments">
      <Skeleton className="h-36 rounded-xl" />
      {[0, 1].map((item) => (
        <div key={item} className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex gap-3"><Skeleton className="size-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div></div>
          <Skeleton className="h-16 w-full" /><Skeleton className="h-60 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

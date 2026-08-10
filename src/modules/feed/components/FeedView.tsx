"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeed } from "../hooks/useFeed";
import { useComposer } from "../context/ComposerContext";
import { Composer } from "./Composer";
import { PostCard } from "./PostCard";

export function FeedView({ mode = "latest" }: { mode?: "latest" | "top" | "for_you" }) {
  const feed = useFeed(mode);
  const { setOpen } = useComposer();

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
      <Composer compact />
      {feed.data.map((post) => <PostCard key={post.id} post={post} />)}
      {feed.hasNextPage && <div className="flex justify-center py-3"><Button variant="outline" className="h-10 rounded-full" disabled={feed.isFetchingNextPage} onClick={() => void feed.fetchNextPage()}>{feed.isFetchingNextPage ? "Loading moments..." : "Load more moments"}</Button></div>}
    </div>
  );
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

"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/modules/feed";
import { useLikes } from "../hooks/useLikes";

export function LikesView() {
  const result = useLikes();
  if (result.isLoading) return <section className="space-y-3" aria-busy="true">{[0, 1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl bg-secondary" />)}</section>;
  if (result.isError) return <section role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5"><p className="font-medium">Liked moments could not be loaded.</p><p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p><Button variant="outline" className="mt-3 min-h-10" onClick={() => void result.refetch()}>Try again</Button></section>;
  if (!result.data?.length) return <section className="rounded-xl border bg-card p-12 text-center"><Icon icon="solar:heart-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h2 className="mt-3 font-semibold">No liked moments yet</h2><p className="mt-1 text-sm text-muted-foreground">When you like a Moment, it will appear here.</p><Button render={<Link href="/" />} variant="outline" className="mt-5 min-h-10">Explore Moments</Button></section>;
  return <div className="space-y-3">{result.data.map((post) => <PostCard key={post.id} post={post} />)}{result.hasNextPage && <div className="flex justify-center"><Button variant="outline" className="min-h-10 rounded-full" disabled={result.isFetchingNextPage} aria-busy={result.isFetchingNextPage} onClick={() => void result.fetchNextPage()}>{result.isFetchingNextPage ? "Loading..." : "Load more"}</Button></div>}</div>;
}

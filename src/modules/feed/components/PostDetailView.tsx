"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { usePost } from "../hooks/useFeed";
import { recordPostView } from "../services/feed.service";
import { PostCard } from "./PostCard";
import { ReplyComposer } from "./ReplyComposer";
import { ReplyList } from "./ReplyList";

export function PostDetailView({ postId }: { postId: string }) {
  const postQuery = usePost(postId);
  const post = postQuery.data;

  useEffect(() => {
    if (!postId) return;
    void recordPostView(postId).catch(() => undefined);
  }, [postId]);

  if (postQuery.isLoading) return <div className="space-y-4 py-6"><Skeleton className="h-14 w-full" /><Skeleton className="h-[30rem] rounded-xl" /><Skeleton className="h-24 rounded-xl" /></div>;
  if (postQuery.isError) return <main className="grid min-h-[60vh] place-items-center px-4"><section className="max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"><Icon icon="solar:danger-triangle-linear" className="mx-auto size-10 text-destructive" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold">Could not load this moment</h1><p className="mt-2 text-sm text-muted-foreground">Check your connection and try again.</p><Button variant="outline" className="mt-5 h-10" onClick={() => void postQuery.refetch()}>Try again</Button></section></main>;
  if (!post) return <main className="grid min-h-screen place-items-center px-4"><section className="max-w-md rounded-xl border bg-card p-8 text-center"><Icon icon="solar:document-text-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold">Moment not found</h1><p className="mt-2 text-sm text-muted-foreground">It may have been removed or the link is incomplete.</p><Link href="/" className={cn(buttonVariants(), "mt-5 h-10")}>Back to feed</Link></section></main>;

  return <main className="min-h-screen py-4 sm:py-5"><header className="mb-3 flex h-12 items-center gap-3"><Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-10 rounded-full")} aria-label="Back to feed"><Icon icon="solar:arrow-left-linear" className="size-5" aria-hidden="true" /></Link><div className="min-w-0"><h1 className="text-lg font-semibold leading-5">Moment</h1><p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{(post.views ?? 0).toLocaleString("en")} views</p></div><Button variant="ghost" size="icon" className="ml-auto size-10 rounded-full" aria-label="Moment actions"><Icon icon="solar:menu-dots-circle-linear" className="size-5" aria-hidden="true" /></Button></header><section className="overflow-hidden rounded-2xl border bg-card/40"><PostCard post={post} variant="detail" /><ReplyComposer postId={post.id} handle={`@${post.author.handle}`} /><div className="border-t px-5 py-3 text-sm font-semibold">Replies</div><ReplyList postId={post.id} /></section></main>;
}

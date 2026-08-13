"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { AuthorAvatar, PostCard, VerifiedMark } from "@/modules/feed";
import { useUserFollow } from "@/modules/feed/hooks/usePostMutations";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { usePublicProfile, usePublicProfilePosts } from "../hooks/usePublicProfile";
import { formatProfileCount } from "../utils/formatProfileCount";

export function PublicProfileView({ username }: { username: string }) {
  const profile = usePublicProfile(username);
  const profilePosts = usePublicProfilePosts(username);
  const currentUser = useCurrentUser();
  const follow = useUserFollow();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = profilePosts;
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    }, { rootMargin: "480px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  if (profile.isLoading) return <main className="w-full space-y-4 py-6"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-24 rounded-xl" /></main>;
  if (profile.isError) {
    const notFound = profile.error instanceof ApiError && profile.error.status === 404;
    return <main className="grid min-h-[70vh] place-items-center py-6"><section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center"><Icon icon={notFound ? "solar:user-block-linear" : "solar:cloud-cross-linear"} className="mx-auto size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold">{notFound ? "Profile not found" : "Could not load this profile"}</h1><p className="mt-2 text-sm text-muted-foreground">{notFound ? "This account may be private, unavailable, or no longer exists." : "Check your connection and try again."}</p>{notFound ? <Button render={<Link href="/discover" />} variant="outline" className="mt-5 h-10">Discover people</Button> : <Button variant="outline" className="mt-5 h-10" onClick={() => void profile.refetch()}>Try again</Button>}</section></main>;
  }
  const data = profile.data;
  if (!data) return null;
  const isSelf = data.id === currentUser.id;
  const following = data.relationship === "following";
  const pending = data.relationship === "pending";
  const isLocked = data.privateProfile && !isSelf && !following;
  const posts = profilePosts.data?.pages.flatMap((page) => page.posts).map((post) => (
    post.activityType === "repost" && !post.repostedBy ? { ...post, repostedBy: data } : post
  )) ?? [];
  const coverStyle = data.coverUrl ? { backgroundImage: `url(${data.coverUrl})`, backgroundPosition: data.coverPosition } : undefined;
  if (isLocked) return <main className="w-full py-6"><Link href="/discover" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon icon="solar:arrow-left-linear" className="size-4" aria-hidden="true" />Discover</Link><section className="mt-4 overflow-hidden rounded-xl border bg-card/55"><div className="h-32 bg-gradient-to-br from-primary/35 via-primary/10 to-transparent bg-cover bg-no-repeat" style={coverStyle} /><div className="px-5 pb-8 text-center"><div className="-mt-10 flex justify-center"><AuthorAvatar author={data} className="size-24 border-4 border-card" /></div><div className="mt-4 flex items-center justify-center gap-1.5"><h1 className="text-xl font-semibold">{data.name}</h1>{data.verified && <VerifiedMark />}</div><p className="text-sm text-muted-foreground">@{data.handle}</p><div className="mx-auto mt-6 max-w-sm rounded-xl border bg-background/40 p-6"><Icon icon="solar:lock-keyhole-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h2 className="mt-3 font-semibold">This account is private</h2><p className="mt-1 text-sm text-muted-foreground">Follow this account to see their Moments.</p><Button variant={pending ? "outline" : "default"} className="mt-4 h-10 rounded-full px-5" disabled={follow.isPending || pending} onClick={() => follow.mutate({ userId: data.id, enabled: true }, { onSuccess: (result) => toast.success(result.requested ? "Follow request sent" : "Following"), onError: (error) => toast.error(error.message) })}>{pending ? "Requested" : "Follow"}</Button></div></div></section></main>;
  return <main className="w-full py-6"><Link href="/discover" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon icon="solar:arrow-left-linear" className="size-4" aria-hidden="true" />Discover</Link><section className="mt-4 overflow-hidden rounded-xl border bg-card/55"><div className="h-32 bg-gradient-to-br from-primary/35 via-primary/10 to-transparent bg-cover bg-no-repeat" style={coverStyle} /><div className="px-5 pb-6"><div className="-mt-10 flex items-end justify-between gap-4"><AuthorAvatar author={data} className="size-24 border-4 border-card" />{isSelf ? <Button render={<Link href="/profile" />} variant="outline" className="h-10 rounded-full px-5">Edit profile</Button> : <Button variant={following || pending ? "outline" : "default"} className="h-10 rounded-full px-5" disabled={follow.isPending || data.relationship === "blocked"} aria-busy={follow.isPending} onClick={() => follow.mutate({ userId: data.id, enabled: !following && !pending }, { onSuccess: (result) => toast.success(result.requested ? "Follow request sent" : result.following ? "Following" : "Unfollowed"), onError: (error) => toast.error(error.message) })}>{pending ? "Requested" : following ? "Following" : "Follow"}</Button>}</div><div className="mt-4 flex items-center gap-1.5"><h1 className="text-xl font-semibold">{data.name}</h1>{data.verified && <VerifiedMark />}</div><p className="text-sm text-muted-foreground">@{data.handle}</p>{data.bio && <p className="mt-4 max-w-xl text-sm leading-6">{data.bio}</p>}{data.interests && <p className="mt-3 text-sm text-primary">{data.interests.split(",").map((interest) => `#${interest.trim().replace(/\s+/g, "")}`).join("  ")}</p>}<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">{data.location && <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" aria-hidden="true" />{data.location}</span>}{data.website && <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon icon="solar:link-linear" aria-hidden="true" />Website</a>}<span className="flex items-center gap-1"><Icon icon="solar:calendar-linear" aria-hidden="true" />Joined {data.joinedAt}</span></div><div className="mt-4 flex gap-5 text-sm"><span><strong className="font-mono tabular-nums">{formatProfileCount(data.following)}</strong> <span className="text-muted-foreground">Following</span></span><span><strong className="font-mono tabular-nums">{formatProfileCount(data.followers)}</strong> <span className="text-muted-foreground">Followers</span></span></div></div></section><section className="mt-4 space-y-3" aria-label={`${data.name}'s moments`}>{profilePosts.isLoading ? [0, 1, 2].map((item) => <Skeleton key={item} className="h-48 rounded-xl" />) : profilePosts.isError ? <div className="rounded-xl border border-destructive/30 bg-card p-5"><p className="font-medium">Could not load moments</p><Button variant="outline" className="mt-3 h-10" onClick={() => void profilePosts.refetch()}>Try again</Button></div> : posts.length ? <>{posts.map((post) => <PostCard key={post.id} post={post} />)}{hasNextPage && <div ref={loadMoreRef} className="min-h-24 py-3" aria-live="polite">{isFetchingNextPage && <ProfileActivitySkeleton />}{profilePosts.isFetchNextPageError && <div className="flex flex-col items-center gap-2"><p className="text-center text-xs text-destructive" role="alert">Could not load more moments.</p><Button variant="outline" className="h-10 rounded-full" onClick={() => void fetchNextPage()}>Try again</Button></div>}</div>}{!hasNextPage && <p className="py-3 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>}</> : <div className="rounded-xl border bg-card/55 p-10 text-center"><Icon icon="solar:notes-linear" className="mx-auto size-9 text-primary" aria-hidden="true" /><h2 className="mt-3 font-semibold">No moments yet</h2><p className="mt-1 text-sm text-muted-foreground">Published moments from this profile will appear here.</p></div>}</section></main>;
}

function ProfileActivitySkeleton() {
  return <div className="space-y-3" aria-label="Loading more moments" aria-busy="true">
    {[0, 1].map((item) => <div key={item} className="space-y-3 rounded-xl border bg-card/45 p-4 sm:p-5"><div className="flex gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-20" /></div></div><Skeleton className="h-14 w-full" /></div>)}
  </div>;
}

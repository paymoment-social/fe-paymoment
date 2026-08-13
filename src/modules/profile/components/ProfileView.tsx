"use client";

import { Icon } from "@iconify/react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorAvatar, PostCard, VerifiedMark } from "@/modules/feed";
import { useProfile } from "../hooks/useProfile";
import { usePublicProfilePosts } from "../hooks/usePublicProfile";
import { formatProfileCount } from "../utils/formatProfileCount";
import { normalizeWebsiteUrl } from "../utils/normalizeWebsiteUrl";
import { EditProfileDialog } from "./EditProfileDialog";

export function ProfileView() {
  const profile = useProfile();
  const profilePosts = usePublicProfilePosts(profile.data?.handle ?? "");
  const [editing, setEditing] = useState(false);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = profilePosts;
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    }, { rootMargin: "480px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (profile.isLoading) return <Skeleton className="h-80 rounded-xl" />;
  if (!profile.data) return <section className="rounded-xl border p-5"><p>Couldn&apos;t load your profile.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void profile.refetch()}>Try again</Button></section>;

  const data = profile.data;
  const verified = Boolean(data.verified);
  const ownMoments = profilePosts.data?.pages.flatMap((page) => page.posts) ?? [];
  const websiteUrl = normalizeWebsiteUrl(data.website);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border bg-card/55">
        <div className="group relative h-32 bg-gradient-to-br from-primary/35 via-primary/10 to-transparent bg-cover bg-no-repeat" style={{ backgroundImage: data.coverUrl ? `url(${data.coverUrl})` : undefined, backgroundPosition: data.coverPosition }}>
          <Button type="button" variant="secondary" className="absolute right-3 top-3 h-9 rounded-full bg-background/80 px-3 text-xs opacity-100 shadow-sm backdrop-blur transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100" onClick={() => setEditing(true)}>
            <Icon icon="solar:gallery-edit-linear" className="size-4" aria-hidden="true" /> Edit cover
          </Button>
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <AuthorAvatar author={data} className="size-24 border-4 border-card" />
            <Button variant="outline" className="h-10 rounded-full px-5" onClick={() => setEditing(true)}>Edit profile</Button>
          </div>
          <div className="mt-4 flex items-center gap-1.5"><h2 className="text-xl font-semibold">{data.name}</h2>{verified && <VerifiedMark />}</div>
          <p className="text-sm text-muted-foreground">@{data.handle}</p>
          <p className="mt-4 max-w-xl text-sm leading-6">{data.bio}</p>
          {data.interests && <p className="mt-3 text-sm text-primary">{data.interests.split(",").map((item) => `#${item.trim().replace(/\s+/g, "")}`).join("  ")}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" aria-hidden="true" />{data.location}</span>
            {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex min-w-0 items-center gap-1 rounded-sm text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon icon="solar:link-linear" aria-hidden="true" /><span className="truncate">{data.website}</span></a>}
            <span className="flex items-center gap-1"><Icon icon="solar:calendar-linear" aria-hidden="true" />Joined {data.joinedAt}</span>
            {data.privateProfile && <span className="flex items-center gap-1"><Icon icon="solar:lock-keyhole-linear" aria-hidden="true" />Private</span>}
          </div>
          <div className="mt-4 flex gap-5 text-sm"><span><strong className="font-mono tabular-nums">{formatProfileCount(data.following)}</strong> <span className="text-muted-foreground">Following</span></span><span><strong className="font-mono tabular-nums">{formatProfileCount(data.followers)}</strong> <span className="text-muted-foreground">Followers</span></span></div>
        </div>
      </section>

      <div className="space-y-3">
        {profilePosts.isLoading ? [0, 1, 2].map((item) => <Skeleton key={item} className="h-48 rounded-xl" />) : profilePosts.isError ? <section className="rounded-xl border border-destructive/30 bg-card p-5"><p className="font-medium">Could not load your profile activity.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void profilePosts.refetch()}>Try again</Button></section> : ownMoments.map((post) => <PostCard key={`${post.id}-${post.activityType ?? "post"}-${post.activityAt ?? ""}`} post={post} profileContext />)}
        {!profilePosts.isLoading && !profilePosts.isError && ownMoments.length === 0 && <section className="rounded-xl border bg-card p-10 text-center"><Icon icon="solar:pen-new-square-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h3 className="mt-3 font-semibold">Your Moments will live here</h3><p className="text-sm text-muted-foreground">Create your first Moment from the feed.</p></section>}
        {hasNextPage && <div ref={loadMoreRef} className="min-h-24 py-3" aria-live="polite">{isFetchingNextPage && <ProfileActivitySkeleton />}{profilePosts.isFetchNextPageError && <div className="flex flex-col items-center gap-2"><p className="text-center text-xs text-destructive" role="alert">Could not load more activity.</p><Button variant="outline" className="h-10 rounded-full" onClick={() => void fetchNextPage()}>Try again</Button></div>}</div>}
        {!hasNextPage && ownMoments.length > 0 && <p className="py-3 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>}
      </div>

      {editing && <EditProfileDialog profile={data} open={editing} onOpenChange={setEditing} />}
    </div>
  );
}

function ProfileActivitySkeleton() {
  return <div className="space-y-3" aria-label="Loading more activity" aria-busy="true">
    {[0, 1].map((item) => <div key={item} className="space-y-3 rounded-xl border bg-card/45 p-4 sm:p-5">
      <div className="flex gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-20" /></div></div>
      <Skeleton className="h-14 w-full" />
    </div>)}
  </div>;
}

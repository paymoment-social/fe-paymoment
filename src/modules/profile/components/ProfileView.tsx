"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorAvatar, PostCard, VerifiedMark } from "@/modules/feed";
import { useProfile } from "../hooks/useProfile";
import { usePublicProfilePosts } from "../hooks/usePublicProfile";
import { formatProfileCount } from "../utils/formatProfileCount";
import { EditProfileDialog } from "./EditProfileDialog";

export function ProfileView() {
  const profile = useProfile();
  const profilePosts = usePublicProfilePosts(profile.data?.handle ?? "");
  const [editing, setEditing] = useState(false);

  if (profile.isLoading) return <Skeleton className="h-80 rounded-xl" />;
  if (!profile.data) return <section className="rounded-xl border p-5"><p>Couldn&apos;t load your profile.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void profile.refetch()}>Try again</Button></section>;

  const data = profile.data;
  const verified = Boolean(data.verified);
  const ownMoments = profilePosts.data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border bg-card/55">
        <div className="h-32 bg-gradient-to-br from-primary/35 via-primary/10 to-transparent" />
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
            <span className="flex items-center gap-1"><Icon icon="solar:link-linear" aria-hidden="true" />{data.website}</span>
            <span className="flex items-center gap-1"><Icon icon="solar:calendar-linear" aria-hidden="true" />Joined {data.joinedAt}</span>
            {data.privateProfile && <span className="flex items-center gap-1"><Icon icon="solar:lock-keyhole-linear" aria-hidden="true" />Private</span>}
          </div>
          <div className="mt-4 flex gap-5 text-sm"><span><strong className="font-mono tabular-nums">{formatProfileCount(data.following)}</strong> <span className="text-muted-foreground">Following</span></span><span><strong className="font-mono tabular-nums">{formatProfileCount(data.followers)}</strong> <span className="text-muted-foreground">Followers</span></span></div>
        </div>
      </section>

      <div className="space-y-3">
        {profilePosts.isLoading ? [0, 1, 2].map((item) => <Skeleton key={item} className="h-48 rounded-xl" />) : profilePosts.isError ? <section className="rounded-xl border border-destructive/30 bg-card p-5"><p className="font-medium">Could not load your profile activity.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void profilePosts.refetch()}>Try again</Button></section> : ownMoments.map((post) => <PostCard key={`${post.id}-${post.activityType ?? "post"}-${post.activityAt ?? ""}`} post={post} />)}
        {!profilePosts.isLoading && !profilePosts.isError && ownMoments.length === 0 && <section className="rounded-xl border bg-card p-10 text-center"><Icon icon="solar:pen-new-square-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h3 className="mt-3 font-semibold">Your Moments will live here</h3><p className="text-sm text-muted-foreground">Create your first Moment from the feed.</p></section>}
        {profilePosts.hasNextPage && <div className="flex justify-center"><Button variant="outline" className="h-10 rounded-full" disabled={profilePosts.isFetchingNextPage} onClick={() => void profilePosts.fetchNextPage()}>{profilePosts.isFetchingNextPage ? "Loading..." : "Load more activity"}</Button></div>}
      </div>

      {editing && <EditProfileDialog profile={data} open={editing} onOpenChange={setEditing} />}
    </div>
  );
}

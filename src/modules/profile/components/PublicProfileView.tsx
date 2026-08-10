"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { AuthorAvatar, VerifiedMark } from "@/modules/feed";
import { useUserFollow } from "@/modules/feed/hooks/usePostMutations";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { usePublicProfile } from "../hooks/usePublicProfile";
import { formatProfileCount } from "../utils/formatProfileCount";

export function PublicProfileView({ username }: { username: string }) {
  const profile = usePublicProfile(username);
  const currentUser = useCurrentUser();
  const follow = useUserFollow();
  if (profile.isLoading) return <main className="mx-auto min-h-dvh w-full max-w-3xl space-y-4 px-4 py-6"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-24 rounded-xl" /></main>;
  if (profile.isError) {
    const notFound = profile.error instanceof ApiError && profile.error.status === 404;
    return <main className="grid min-h-dvh place-items-center px-4"><section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center"><Icon icon={notFound ? "solar:user-block-linear" : "solar:cloud-cross-linear"} className="mx-auto size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold">{notFound ? "Profile not found" : "Could not load this profile"}</h1><p className="mt-2 text-sm text-muted-foreground">{notFound ? "This account may be private, unavailable, or no longer exists." : "Check your connection and try again."}</p>{notFound ? <Button render={<Link href="/discover" />} variant="outline" className="mt-5 h-10">Discover people</Button> : <Button variant="outline" className="mt-5 h-10" onClick={() => void profile.refetch()}>Try again</Button>}</section></main>;
  }
  const data = profile.data;
  if (!data) return null;
  const isSelf = data.id === currentUser.id;
  const following = data.relationship === "following";
  const pending = data.relationship === "pending";
  return <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6 sm:px-6"><Link href="/discover" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon icon="solar:arrow-left-linear" className="size-4" aria-hidden="true" />Discover</Link><section className="mt-4 overflow-hidden rounded-xl border bg-card/55"><div className="h-32 bg-gradient-to-br from-primary/35 via-primary/10 to-transparent" /><div className="px-5 pb-6"><div className="-mt-10 flex items-end justify-between gap-4"><AuthorAvatar author={data} className="size-24 border-4 border-card" />{isSelf ? <Button render={<Link href="/profile" />} variant="outline" className="h-10 rounded-full px-5">Edit profile</Button> : <Button variant={following ? "outline" : "default"} className="h-10 rounded-full px-5" disabled={follow.isPending || data.relationship === "blocked"} aria-busy={follow.isPending} onClick={() => follow.mutate({ userId: data.id, enabled: !following }, { onSuccess: (result) => { void profile.refetch(); toast.success(result.requested ? "Follow request sent" : result.following ? "Following" : "Unfollowed"); }, onError: (error) => toast.error(error.message) })}>{pending ? "Requested" : following ? "Following" : "Follow"}</Button>}</div><div className="mt-4 flex items-center gap-1.5"><h1 className="text-xl font-semibold">{data.name}</h1>{data.verified && <VerifiedMark />}</div><p className="text-sm text-muted-foreground">@{data.handle}</p>{data.bio && <p className="mt-4 max-w-xl text-sm leading-6">{data.bio}</p>}{data.interests && <p className="mt-3 text-sm text-primary">{data.interests.split(",").map((interest) => `#${interest.trim().replace(/\s+/g, "")}`).join("  ")}</p>}<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">{data.location && <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" aria-hidden="true" />{data.location}</span>}{data.website && <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon icon="solar:link-linear" aria-hidden="true" />Website</a>}<span className="flex items-center gap-1"><Icon icon="solar:calendar-linear" aria-hidden="true" />Joined {data.joinedAt}</span></div><div className="mt-4 flex gap-5 text-sm"><span><strong className="font-mono tabular-nums">{formatProfileCount(data.following)}</strong> <span className="text-muted-foreground">Following</span></span><span><strong className="font-mono tabular-nums">{formatProfileCount(data.followers)}</strong> <span className="text-muted-foreground">Followers</span></span></div></div></section></main>;
}

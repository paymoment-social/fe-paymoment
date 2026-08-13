"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { ReportPostDialog } from "@/modules/reports/components/ReportPostDialog";
import { useClaimMomentReward } from "@/modules/rewards/hooks/useRewards";
import { useDeleteMoment, usePollVote, usePostPin, usePostReaction, useUserFollow } from "../hooks/usePostMutations";
import { usePollVoters } from "../hooks/usePollVoters";
import { recordPostShare } from "../services/feed.service";
import type { FeedPost } from "../types";
import { formatEngagement } from "../utils/formatEngagement";
import { getPostUrlMeta, tokenizePostBody } from "../utils/postTokens";
import { AuthorAvatar, VerifiedMark } from "./AuthorAvatar";
import { QuoteComposer } from "./QuoteComposer";
import { QuotedPostCard } from "./QuotedPostCard";
import { RepostMenu } from "./RepostMenu";

export function PostCard({ post, variant = "feed", profileContext = false }: { post: FeedPost; variant?: "feed" | "detail"; profileContext?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(Boolean(post.rewardClaimed));
  const liked = Boolean(post.liked);
  const bookmarked = Boolean(post.bookmarked);
  const following = post.author.relationship === "following";
  const likeMutation = usePostReaction("like");
  const bookmarkMutation = usePostReaction("bookmark");
  const followMutation = useUserFollow();
  const deleteMutation = useDeleteMoment();
  const pinMutation = usePostPin();
  const rewardMutation = useClaimMomentReward();
  const rewardIsClaimed = rewardClaimed || Boolean(post.rewardClaimed);
  const isVerified = post.author.id === currentUser.id ? currentUser.verified : post.author.verified;
  const inProfileContext = profileContext || pathname === "/profile" || pathname.startsWith("/u/");

  async function shareMoment() {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: `@${post.author.handle} on PayMoment`, text: post.body, url });
      await recordPostShare(post.id, "native");
    } else {
      await navigator.clipboard.writeText(url);
      await recordPostShare(post.id, "copy");
      toast.success("Moment link copied");
    }
  }

  return (
    <article className={cn("overflow-hidden p-4 sm:p-5", variant === "feed" ? "rounded-xl border bg-card/55" : "bg-transparent")}>
      {post.activityType === "repost" && post.repostedBy && (
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon icon="solar:repeat-linear" className="size-4 text-primary" aria-hidden="true" />
          <Link href={`/u/${encodeURIComponent(post.repostedBy.handle)}`} className="rounded-sm text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {post.repostedBy.id === currentUser.id ? "You reposted" : `${post.repostedBy.name} reposted`}
          </Link>
          <span>· {post.activityAt ? relativePostTime(post.activityAt) : "now"}</span>
        </div>
      )}
      {inProfileContext && post.pinned && (
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-primary">
          <Icon icon="solar:pin-bold" className="size-4" aria-hidden="true" />
          <span>Pinned</span>
        </div>
      )}
      <header className="flex items-start gap-3">
        <Link href={`/u/${encodeURIComponent(post.author.handle)}`} className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Open profile for ${post.author.handle}`}>
          <AuthorAvatar author={post.author} />
          <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold">{post.author.name}</p>
            {isVerified && <VerifiedMark />}
            <span className="text-xs text-muted-foreground">· {post.createdAt}</span>
            <Icon icon="solar:earth-linear" className="size-3.5 text-muted-foreground" aria-label="Public moment" />
          </div>
            <p className="text-xs text-muted-foreground">@{post.author.handle}</p>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-10 rounded-full" aria-label="More actions" />}>
            <Icon icon="solar:menu-dots-bold" className="size-5 text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {post.author.id !== currentUser.id && <DropdownMenuItem disabled={followMutation.isPending} onClick={() => followMutation.mutate({ userId: post.author.id, enabled: !following }, { onSuccess: (result) => toast.success(result.requested ? "Follow request sent" : result.following ? "Following" : "Unfollowed"), onError: (error) => toast.error(error.message) })}>
              <Icon icon={following ? "solar:user-minus-linear" : "solar:user-plus-linear"} aria-hidden="true" />
              {following ? "Unfollow" : "Follow"} @{post.author.handle}
            </DropdownMenuItem>}
            <DropdownMenuItem onClick={() => bookmarkMutation.mutate({ postId: post.id, enabled: !bookmarked }, { onSuccess: () => toast.success(bookmarked ? "Removed from bookmarks" : "Saved to bookmarks"), onError: (error) => toast.error(error.message) })} disabled={bookmarkMutation.isPending}>
              <Icon icon="solar:bookmark-linear" aria-hidden="true" /> Save moment
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setReportOpen(true)}>
              <Icon icon="solar:flag-linear" aria-hidden="true" /> Report moment
            </DropdownMenuItem>
            {post.article && post.author.id === currentUser.id && isVerified && (
              <DropdownMenuItem onClick={() => router.push(`/article/${post.id}/edit`)}>
                <Icon icon="solar:pen-new-square-linear" aria-hidden="true" /> Edit article
              </DropdownMenuItem>
            )}
            {post.isOwner && <DropdownMenuItem disabled={deleteMutation.isPending} className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Icon icon="solar:trash-bin-trash-linear" aria-hidden="true" /> Delete moment
            </DropdownMenuItem>}
            {inProfileContext && post.isOwner && <DropdownMenuItem disabled={pinMutation.isPending} onClick={() => pinMutation.mutate({ postId: post.id, pinned: !post.pinned }, { onSuccess: () => toast.success(post.pinned ? "Removed from profile" : "Pinned to profile"), onError: (error) => toast.error(error.message) })}>
              <Icon icon={post.pinned ? "solar:pin-cross-linear" : "solar:pin-linear"} aria-hidden="true" /> {post.pinned ? "Unpin from profile" : "Pin to profile"}
            </DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <PostContent post={post} variant={variant} />
      {post.quotedPost && <QuotedPostCard post={post.quotedPost} />}

      <footer className="mt-3 flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <ActionButton icon={liked ? "solar:heart-bold" : "solar:heart-linear"} label={liked ? "Unlike" : "Like"} count={post.likes} active={liked} pending={likeMutation.isPending} onClick={() => likeMutation.mutate({ postId: post.id, enabled: !liked }, { onError: (error) => toast.error(error.message) })} />
          <ActionButton icon="solar:chat-round-linear" label="View replies" count={post.replies} onClick={() => router.push(`/post/${post.id}#reply-composer`)} />
          <RepostMenu post={post} onQuote={() => setQuoteOpen(true)} />
          <ActionButton icon="solar:plain-linear" label="Share" onClick={() => void shareMoment()} />
        </div>
        <div className="flex items-center gap-2">
          {post.views ? <span className="hidden text-xs text-muted-foreground sm:inline">{formatEngagement(post.views)} views</span> : null}
          {post.isOwner && <Button type="button" variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 text-primary hover:bg-primary/10 hover:text-primary" disabled={rewardIsClaimed || rewardMutation.isPending} aria-label={rewardIsClaimed ? "Moment reward claimed" : "Claim 10 Box reward"} onClick={() => rewardMutation.mutate(post.id, { onSuccess: (result) => { setRewardClaimed(true); toast.success(result.data.claimed ? "+10 Box claimed" : "Reward already claimed"); }, onError: (error) => toast.error(error.message) })}>
            <Icon icon={rewardIsClaimed ? "solar:check-circle-bold" : "solar:box-bold-duotone"} className="size-4" aria-hidden="true" />
            <span className="font-mono text-xs tabular-nums">{rewardMutation.isPending ? "Claiming..." : rewardIsClaimed ? "Claimed" : "+10 BOX"}</span>
          </Button>}
        </div>
      </footer>

      <QuoteComposer post={post} open={quoteOpen} onOpenChange={setQuoteOpen} />
      <ReportPostDialog postId={post.id} open={reportOpen} onOpenChange={setReportOpen} />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-popover">
          <DialogHeader>
            <DialogTitle>Delete this Moment?</DialogTitle>
            <DialogDescription>This action cannot be undone. Your Moment and its replies will no longer be visible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteMutation.isPending}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={deleteMutation.isPending} aria-busy={deleteMutation.isPending} onClick={() => deleteMutation.mutate(post.id, { onSuccess: () => { setDeleteOpen(false); toast.success("Moment deleted"); router.push("/"); }, onError: (error) => toast.error(error.message) })}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Moment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function relativePostTime(value: string) {
  const milliseconds = Date.now() - new Date(value).getTime();
  if (milliseconds < 60_000) return "now";
  if (milliseconds < 3_600_000) return `${Math.floor(milliseconds / 60_000)}m`;
  if (milliseconds < 86_400_000) return `${Math.floor(milliseconds / 3_600_000)}h`;
  return `${Math.floor(milliseconds / 86_400_000)}d`;
}

function PostContent({ post, variant }: { post: FeedPost; variant: "feed" | "detail" }) {
  return (
    <>
      {!post.article && (
        <div className="mt-3 whitespace-pre-line text-base leading-6 text-foreground">
          {tokenizePostBody(post.body).map((token, index) => {
            if (token.kind === "text") return <span key={`${token.value}-${index}`}>{token.value}</span>;
            if (token.kind === "url") {
              const meta = getPostUrlMeta(token.value);
              return <a key={`${token.value}-${index}`} href={token.value} target="_blank" rel="noreferrer" title={meta.label} className="inline break-all rounded-sm font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${meta.label}: ${token.value}`}>{token.value}<Icon icon={meta.isExplorer ? "solar:compass-linear" : "solar:arrow-right-up-linear"} className="ml-1 inline-block size-3.5 align-[-0.125em]" aria-hidden="true" /></a>;
            }
            const href = token.kind === "mention"
              ? `/u/${encodeURIComponent(token.value.slice(1))}`
              : `/discover?q=${encodeURIComponent(token.value)}`;
            return <Link key={`${token.value}-${index}`} href={href} className={cn("rounded-sm font-medium underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", token.kind === "mention" ? "text-primary" : "text-violet-300")} aria-label={token.kind === "mention" ? `Open profile ${token.value}` : `Discover moments tagged ${token.value}`}>{token.value}</Link>;
          })}
          {post.tag && <p className="mt-3"><Link href={`/discover?q=${encodeURIComponent(post.tag)}`} className="rounded-sm text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{post.tag}</Link></p>}
        </div>
      )}
      {post.media && <PostMedia media={post.media} mediaTypes={post.mediaTypes} />}
      {post.article && <ArticlePreview article={post.article} expanded={variant === "detail"} />}
      {post.poll && <PollPreview post={post} />}
      {post.card && (
        <div className="mt-4 overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-primary/10 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold"><Icon icon="solar:box-bold" className="size-4" aria-hidden="true" /> PayMoment</div>
          <p className="mt-8 text-xs text-primary">{post.card.eyebrow}</p>
          <h3 className="mt-1 max-w-md text-xl font-medium leading-tight sm:text-2xl">{post.card.title}</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{post.card.description}</p>
        </div>
      )}
    </>
  );
}

function ArticlePreview({ article, expanded }: { article: NonNullable<FeedPost["article"]>; expanded: boolean }) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/10">
      {article.banner?.image && <div className="h-32 border-b border-border/60 bg-cover bg-no-repeat sm:h-44" style={{ backgroundColor: article.banner.color, backgroundImage: `url(${article.banner.image})`, backgroundPosition: article.banner.position }} aria-label="Article banner" />}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold"><Icon icon="solar:box-bold" className="size-4 text-primary" aria-hidden="true" /> PayMoment</div>
        <p className="mt-8 text-sm text-primary">{article.eyebrow}</p>
        <h3 className="mt-1 max-w-xl text-2xl font-medium leading-tight sm:text-3xl">{article.title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{article.description}</p>
        {expanded ? (
          <div className="article-content mt-6 overflow-x-auto border-t border-border/70 pt-5 text-[15px] leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_img]:my-5 [&_img]:max-h-[32rem] [&_img]:w-full [&_img]:rounded-xl [&_img]:object-cover [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_strong]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
        ) : (
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">Read article <Icon icon="solar:arrow-right-linear" className="size-4" aria-hidden="true" /></div>
        )}
      </div>
    </section>
  );
}

function PollPreview({ post }: { post: FeedPost }) {
  const pollVote = usePollVote();
  const [showVoters, setShowVoters] = useState(false);
  const poll = post.poll!;
  const voters = usePollVoters(post.id, showVoters && poll.voterVisibility === "public");
  const totalVotes = poll.totalVotes;
  const votedOption = poll.options.find((option) => option.id === poll.viewerOptionId);

  return (
    <section className="mt-4 rounded-2xl border bg-background/45 p-4 sm:p-5">
      <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Icon icon="solar:chart-square-linear" className="size-5" aria-hidden="true" /></span><div><h3 className="font-semibold leading-6">{poll.question}</h3><p className="mt-1 text-xs text-muted-foreground">{totalVotes ? `${totalVotes} vote${totalVotes === 1 ? "" : "s"}` : "Be the first to vote"}</p></div></div>
      <div className="mt-4 space-y-2">{poll.options.map((option) => { const percentage = totalVotes ? Math.round((option.voteCount / totalVotes) * 100) : 0; const selected = votedOption?.id === option.id; return <button key={option.id} type="button" disabled={poll.status === "closed" || pollVote.isPending} onClick={() => pollVote.mutate({ postId: post.id, optionId: selected && poll.allowVoteChange ? undefined : option.id }, { onError: (error) => toast.error(error.message) })} className="relative min-h-12 w-full overflow-hidden rounded-xl border border-border/80 p-3 text-left transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70" aria-pressed={selected}><span className="absolute inset-y-0 left-0 bg-primary/10 transition-all" style={{ width: `${percentage}%` }} /><span className="relative flex items-center justify-between gap-3 text-sm"><span className="font-medium">{option.label}</span><span className={cn("tabular-nums text-xs", selected ? "font-semibold text-primary" : "text-muted-foreground")}>{percentage}%</span></span></button>; })}</div>
      {poll.voterVisibility === "public" && totalVotes > 0 && <div className="mt-3"><Button type="button" variant="ghost" className="h-9 rounded-full px-3 text-xs text-primary" onClick={() => setShowVoters((value) => !value)}>{showVoters ? "Hide voters" : "View voters"}</Button>{showVoters && <div className="mt-2 flex min-w-0 items-center gap-3 overflow-hidden border-t pt-3" aria-label="Poll voters">{voters.isLoading ? <p className="text-xs text-muted-foreground">Loading voters...</p> : voters.isError ? <p role="alert" className="text-xs text-destructive">Voters could not be loaded.</p> : <><div className="flex min-w-0 shrink overflow-hidden py-1 pl-1">{(voters.data ?? []).slice(0, 10).map((voter) => <div key={`${voter.optionId}-${voter.user.id}`} className="relative -ml-2 shrink-0 first:ml-0 rounded-full border-2 border-background" title={voter.user.name}><AuthorAvatar author={voter.user} className="size-8" /></div>)}</div>{Math.max(0, totalVotes - Math.min(voters.data?.length ?? 0, 10)) > 0 && <span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground">+{Math.max(0, totalVotes - Math.min(voters.data?.length ?? 0, 10))} people</span>}</>}</div>}</div>}
      {poll.voterVisibility === "anonymous" && <p className="mt-4 text-xs text-muted-foreground">Votes are anonymous for this poll.</p>}
    </section>
  );
}

function ActionButton({ icon, label, count, active, pending = false, onClick }: { icon: string; label: string; count?: number; active?: boolean; pending?: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" className={cn("h-10 min-w-10 gap-1.5 rounded-none border-0 bg-transparent px-2 text-muted-foreground hover:bg-transparent hover:text-foreground", active && "text-rose-400 hover:text-rose-300")} aria-label={label} aria-busy={pending} disabled={pending} onClick={onClick}>
      <Icon icon={icon} className="size-5" aria-hidden="true" />
      {count !== undefined && <span className="hidden text-xs tabular-nums sm:inline">{formatEngagement(count)}</span>}
    </Button>
  );
}

function PostMedia({ media, mediaTypes }: { media: string[]; mediaTypes?: string[] }) {
  return (
    <div className={cn("mt-4 grid overflow-hidden rounded-xl border bg-muted", media.length > 1 && "grid-cols-2", media.length > 2 && "grid-rows-2")}>
      {media.map((source, index) => (
        <div key={source} className={cn("relative min-h-44 overflow-hidden border-border", media.length === 1 && "aspect-[16/9]", media.length === 3 && index === 0 && "row-span-2 min-h-80")}>
          {(mediaTypes?.[index] ?? "").startsWith("video/") ? <video src={source} controls playsInline preload="metadata" className="absolute inset-0 size-full object-cover" aria-label={`Moment video ${index + 1}`} /> : <Image src={source} alt={`Moment attachment ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.02]" unoptimized={source.startsWith("data:")} />}
        </div>
      ))}
    </div>
  );
}

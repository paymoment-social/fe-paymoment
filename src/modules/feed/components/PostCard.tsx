"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useBoxStore } from "@/modules/rewards/store/useBoxStore";
import { CURRENT_USER } from "../constants";
import { useFeedStore } from "../store/useFeedStore";
import type { FeedPost } from "../types";
import { formatEngagement } from "../utils/formatEngagement";
import { AuthorAvatar, VerifiedMark } from "./AuthorAvatar";
import { QuoteComposer } from "./QuoteComposer";
import { QuotedPostCard } from "./QuotedPostCard";
import { RepostMenu } from "./RepostMenu";

export function PostCard({ post, variant = "feed" }: { post: FeedPost; variant?: "feed" | "detail" }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const liked = useFeedStore((state) => state.likedIds.includes(post.id));
  const bookmarked = useFeedStore((state) => state.bookmarkedIds.includes(post.id));
  const following = useFeedStore((state) => state.followingIds.includes(post.author.id));
  const toggleLike = useFeedStore((state) => state.toggleLike);
  const toggleBookmark = useFeedStore((state) => state.toggleBookmark);
  const toggleFollow = useFeedStore((state) => state.toggleFollow);
  const localReplyCount = useFeedStore((state) => state.repliesByPost?.[post.id]?.length ?? 0);
  const boxBalance = useBoxStore((state) => state.balance);
  const rewardClaimed = useBoxStore((state) => state.claimedMomentIds.includes(post.id));
  const claimMoment = useBoxStore((state) => state.claimMoment);
  const isVerified = post.author.id === CURRENT_USER.id ? boxBalance >= 10 : post.author.verified;

  async function shareMoment() {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) await navigator.share({ title: `@${post.author.handle} on PayMoment`, text: post.body, url });
    else {
      await navigator.clipboard.writeText(url);
      toast.success("Moment link copied");
    }
  }

  return (
    <article className={cn("overflow-hidden p-4 sm:p-5", variant === "feed" ? "rounded-xl border bg-card/55" : "bg-transparent")}>
      <header className="flex items-start gap-3">
        <Link href={`/post/${post.id}`} className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Open moment by ${post.author.handle}`}>
          <AuthorAvatar author={post.author} />
          <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold">{post.author.handle}</p>
            {isVerified && <VerifiedMark />}
            <span className="text-xs text-muted-foreground">· {post.createdAt}</span>
            <Icon icon="solar:earth-linear" className="size-3.5 text-muted-foreground" aria-label="Public moment" />
          </div>
            <p className="text-xs text-muted-foreground">{post.author.name}</p>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-10 rounded-full" aria-label="More actions" />}>
            <Icon icon="solar:menu-dots-bold" className="size-5 text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => toggleFollow(post.author.id)}>
              <Icon icon={following ? "solar:user-minus-linear" : "solar:user-plus-linear"} aria-hidden="true" />
              {following ? "Unfollow" : "Follow"} @{post.author.handle}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { toggleBookmark(post.id); toast.success(bookmarked ? "Removed from bookmarks" : "Saved to bookmarks"); }}>
              <Icon icon="solar:bookmark-linear" aria-hidden="true" /> Save moment
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Icon icon="solar:flag-linear" aria-hidden="true" /> Report moment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {variant === "feed" ? (
        <Link href={`/post/${post.id}`} className="group/post block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Open moment by ${post.author.handle}`}>
          <PostContent post={post} />
        </Link>
      ) : <PostContent post={post} />}
      {post.quotedPost && <QuotedPostCard post={post.quotedPost} />}

      <footer className="mt-3 flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <ActionButton icon={liked ? "solar:heart-bold" : "solar:heart-linear"} label={liked ? "Unlike" : "Like"} count={post.likes + (liked ? 1 : 0)} active={liked} onClick={() => toggleLike(post.id)} />
          <ActionButton icon="solar:chat-round-linear" label="View replies" count={post.replies + localReplyCount} onClick={() => router.push(`/post/${post.id}#reply-composer`)} />
          <RepostMenu post={post} onQuote={() => setQuoteOpen(true)} />
          <ActionButton icon="solar:plain-linear" label="Share" onClick={() => void shareMoment()} />
        </div>
        <motion.div whileTap={reduceMotion ? undefined : { scale: 0.96 }}>
          <Button
            variant="ghost"
            className="h-9 rounded-full border-0 bg-primary/5 px-3 text-primary hover:bg-primary/10 disabled:opacity-70"
            disabled={rewardClaimed}
            aria-label={rewardClaimed ? "Reward from this Moment claimed" : `Claim ${post.reward} Box`}
            onClick={() => {
              claimMoment(post.id, post.reward);
              toast.success(`${post.reward} Box added`, { description: `Your balance is now ${new Intl.NumberFormat("en-US").format(boxBalance + post.reward)} Box.` });
            }}
          >
            <Icon icon={rewardClaimed ? "solar:check-circle-bold" : "solar:box-bold"} className="size-4" aria-hidden="true" />
            {rewardClaimed ? "Claimed" : `+${post.reward} Box`}
          </Button>
        </motion.div>
      </footer>

      <QuoteComposer post={post} open={quoteOpen} onOpenChange={setQuoteOpen} />
    </article>
  );
}

function PostContent({ post }: { post: FeedPost }) {
  return (
    <>
      <div className="mt-3 whitespace-pre-line text-base leading-6 text-foreground">
        {post.body}
        {post.tag && <p className="mt-3 text-primary">{post.tag}</p>}
      </div>
      {post.media && <PostMedia media={post.media} />}
      {post.card && (
        <div className="mt-4 overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-primary/10 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold"><Icon icon="solar:box-bold" className="size-4" aria-hidden="true" /> PayBox</div>
          <p className="mt-8 text-xs text-primary">{post.card.eyebrow}</p>
          <h3 className="mt-1 max-w-md text-xl font-medium leading-tight sm:text-2xl">{post.card.title}</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{post.card.description}</p>
        </div>
      )}
    </>
  );
}

function ActionButton({ icon, label, count, active, onClick }: { icon: string; label: string; count?: number; active?: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" className={cn("h-10 min-w-10 gap-1.5 rounded-none border-0 bg-transparent px-2 text-muted-foreground hover:bg-transparent hover:text-foreground", active && "text-rose-400 hover:text-rose-300")} aria-label={label} onClick={onClick}>
      <Icon icon={icon} className="size-5" aria-hidden="true" />
      {count !== undefined && <span className="hidden text-xs tabular-nums sm:inline">{formatEngagement(count)}</span>}
    </Button>
  );
}

function PostMedia({ media }: { media: string[] }) {
  return (
    <div className={cn("mt-4 grid overflow-hidden rounded-xl border bg-muted", media.length > 1 && "grid-cols-2", media.length > 2 && "grid-rows-2")}>
      {media.map((source, index) => (
        <div key={source} className={cn("relative min-h-44 overflow-hidden border-border", media.length === 1 && "aspect-[16/9]", media.length === 3 && index === 0 && "row-span-2 min-h-80")}>
          <Image src={source} alt={`Moment attachment ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.02]" unoptimized={source.startsWith("data:")} />
        </div>
      ))}
    </div>
  );
}

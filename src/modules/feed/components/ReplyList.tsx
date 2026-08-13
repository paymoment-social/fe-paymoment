"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { useReplies } from "../hooks/useReplies";
import { useReplyLike } from "../hooks/usePostMutations";
import type { FeedReply } from "../types";
import { AuthorAvatar, VerifiedMark } from "./AuthorAvatar";
import { ReplyComposer } from "./ReplyComposer";
import { getPostUrlMeta, tokenizePostBody } from "../utils/postTokens";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ReplyList({ postId }: { postId: string }) {
  const replies = useReplies(postId);

  if (replies.isLoading) return <div className="border-t px-5 py-6 text-sm text-muted-foreground">Loading replies...</div>;
  if (replies.isError) return <div role="alert" className="border-t px-5 py-6 text-sm text-destructive">Replies could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void replies.refetch()}>Try again</button></div>;
  if (!replies.data?.length) return <div className="flex min-h-16 items-center justify-between border-t px-5 text-sm"><p className="font-medium text-muted-foreground">No replies yet</p><span className="text-muted-foreground">Be the first to reply</span></div>;

  return <section aria-label="Replies">{replies.data.map((reply) => <ReplyThread key={reply.id} postId={postId} reply={reply} />)}{replies.hasNextPage && <div className="border-t p-4 text-center"><Button variant="outline" className="h-9 rounded-full" disabled={replies.isFetchingNextPage} onClick={() => void replies.fetchNextPage()}>{replies.isFetchingNextPage ? "Loading..." : "Load more replies"}</Button></div>}</section>;
}

function ReplyThread({ postId, reply, depth = 0 }: { postId: string; reply: FeedReply; depth?: number }) {
  const [replying, setReplying] = useState(false);
  const children = useReplies(postId, reply.id);
  const likeReply = useReplyLike(postId, reply.parentId);
  const persisted = UUID_PATTERN.test(reply.id);

  return <>
    <article className="flex gap-3 border-t p-5" style={{ marginLeft: depth ? `${Math.min(depth, 2) * 2}rem` : undefined }}>
      <AuthorAvatar author={reply.author} className="size-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5"><span className="truncate text-sm font-semibold">{reply.author.handle}</span>{reply.author.verified && <VerifiedMark />}<span className="text-xs text-muted-foreground">· {reply.createdAt}</span></div>
        <p className="mt-1 whitespace-pre-line text-[15px] leading-6">{tokenizePostBody(reply.body).map((token, index) => {
          if (token.kind === "text") return <span key={`${token.value}-${index}`}>{token.value}</span>;
          if (token.kind === "url") {
            const meta = getPostUrlMeta(token.value);
            return <a key={`${token.value}-${index}`} href={token.value} target="_blank" rel="noreferrer" title={meta.label} className="inline break-all rounded-sm font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${meta.label}: ${token.value}`}>{token.value}<Icon icon={meta.isExplorer ? "solar:compass-linear" : "solar:arrow-right-up-linear"} className="ml-1 inline-block size-3.5 align-[-0.125em]" aria-hidden="true" /></a>;
          }
          const href = token.kind === "mention"
            ? `/u/${encodeURIComponent(token.value.slice(1))}`
            : `/discover?q=${encodeURIComponent(token.value)}`;
          return <Link key={`${token.value}-${index}`} href={href} className={`rounded-sm font-medium underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${token.kind === "mention" ? "text-primary" : "text-violet-300"}`} aria-label={token.kind === "mention" ? `Open profile ${token.value}` : `Discover moments tagged ${token.value}`}>{token.value}</Link>;
        })}</p>
        {reply.media && <Image src={reply.media} alt="Reply attachment" width={560} height={360} unoptimized className="mt-3 max-h-64 w-auto rounded-xl border object-cover" />}
        <div className="mt-2 flex gap-1">
          <Button variant="ghost" size="icon" className={reply.liked ? "size-9 text-rose-400" : "size-9"} aria-label={reply.liked ? "Unlike reply" : "Like reply"} disabled={!persisted || likeReply.isPending} onClick={() => likeReply.mutate({ replyId: reply.id, enabled: !reply.liked })}><Icon icon={reply.liked ? "solar:heart-bold" : "solar:heart-linear"} className="size-5" aria-hidden="true" /><span className="sr-only">{reply.likes} likes</span></Button>
          <Button variant={replying ? "secondary" : "ghost"} size="sm" className="h-9 gap-1.5 rounded-full px-3 text-xs" aria-expanded={replying} disabled={!persisted} onClick={() => setReplying((value) => !value)}><Icon icon="solar:chat-round-linear" className="size-4" aria-hidden="true" />Reply</Button>
        </div>
        {replying && <ReplyComposer postId={postId} parentId={reply.id} handle={`@${reply.author.handle}`} onSubmitted={() => setReplying(false)} />}
      </div>
    </article>
    {children.data?.map((child) => <ReplyThread key={child.id} postId={postId} reply={child} depth={depth + 1} />)}
  </>;
}

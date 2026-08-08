"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { SEED_REPLIES } from "../constants";
import { useFeedStore } from "../store/useFeedStore";
import type { FeedReply } from "../types";
import { AuthorAvatar, VerifiedMark } from "./AuthorAvatar";
import { ReplyComposer } from "./ReplyComposer";

export function ReplyList({ postId }: { postId: string }) {
  const repliesByPost = useFeedStore((state) => state.repliesByPost);
  const replies = useMemo(() => [...(SEED_REPLIES[postId] ?? []), ...(repliesByPost?.[postId] ?? [])], [postId, repliesByPost]);
  const childrenByParent = useMemo(() => replies.reduce<Record<string, FeedReply[]>>((groups, reply) => { if (reply.parentId) groups[reply.parentId] = [...(groups[reply.parentId] ?? []), reply]; return groups; }, {}), [replies]);
  const topLevel = replies.filter((reply) => !reply.parentId);

  if (!replies.length) return <div className="flex min-h-16 items-center justify-between border-t px-5 text-sm"><p className="font-medium text-muted-foreground">No replies yet</p><span className="text-muted-foreground">Be the first to reply</span></div>;
  return <section aria-label="Replies">{topLevel.map((reply) => <ReplyThread key={reply.id} postId={postId} reply={reply} childrenByParent={childrenByParent} />)}</section>;
}

function ReplyThread({ postId, reply, childrenByParent, depth = 0 }: { postId: string; reply: FeedReply; childrenByParent: Record<string, FeedReply[]>; depth?: number }) {
  const [replying, setReplying] = useState(false);
  const children = childrenByParent[reply.id] ?? [];
  return <>
    <article className="flex gap-3 border-t p-5" style={{ marginLeft: depth ? `${Math.min(depth, 2) * 2}rem` : undefined }}>
      <AuthorAvatar author={reply.author} className="size-10 shrink-0" />
      <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="truncate text-sm font-semibold">{reply.author.handle}</span>{reply.author.verified && <VerifiedMark />}<span className="text-xs text-muted-foreground">· {reply.createdAt}</span></div><p className="mt-1 whitespace-pre-line text-[15px] leading-6">{reply.body}</p>{reply.media && <Image src={reply.media} alt="Reply attachment" width={560} height={360} unoptimized className="mt-3 max-h-64 w-auto rounded-xl border object-cover" />}<div className="mt-2 flex gap-1"><Button variant="ghost" size="icon" className="size-9" aria-label="Like reply"><Icon icon="solar:heart-linear" className="size-5" aria-hidden="true" /></Button><Button variant={replying ? "secondary" : "ghost"} size="sm" className="h-9 gap-1.5 rounded-full px-3 text-xs" aria-expanded={replying} onClick={() => setReplying((value) => !value)}><Icon icon="solar:chat-round-linear" className="size-4" aria-hidden="true" />Reply</Button></div>{replying && <ReplyComposer postId={postId} parentId={reply.id} handle={`@${reply.author.handle}`} onSubmitted={() => setReplying(false)} />}</div>
    </article>
    {children.map((child) => <ReplyThread key={child.id} postId={postId} reply={child} childrenByParent={childrenByParent} depth={depth + 1} />)}
  </>;
}

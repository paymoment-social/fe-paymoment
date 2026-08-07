"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { SEED_REPLIES } from "../constants";
import { useFeedStore } from "../store/useFeedStore";
import { AuthorAvatar, VerifiedMark } from "./AuthorAvatar";

export function ReplyList({ postId }: { postId: string }) {
  const repliesByPost = useFeedStore((state) => state.repliesByPost);
  const localReplies = repliesByPost?.[postId] ?? [];
  const replies = [...(SEED_REPLIES[postId] ?? []), ...localReplies];
  if (!replies.length) return <div className="flex min-h-16 items-center justify-between border-t px-5 text-sm"><p className="font-medium text-muted-foreground">No replies yet</p><span className="text-muted-foreground">Be the first to reply</span></div>;
  return <section aria-label="Replies">{replies.map((reply) => <article key={reply.id} className="flex gap-3 border-t p-5"><AuthorAvatar author={reply.author} className="size-10" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="truncate text-sm font-semibold">{reply.author.handle}</span>{reply.author.verified && <VerifiedMark />}<span className="text-xs text-muted-foreground">· {reply.createdAt}</span></div><p className="mt-1 whitespace-pre-line text-[15px] leading-6">{reply.body}</p>{reply.media && <Image src={reply.media} alt="Reply attachment" width={560} height={360} unoptimized className="mt-3 max-h-64 w-auto rounded-xl border object-cover" />}<div className="mt-2 flex gap-2"><Button variant="ghost" size="icon" className="size-10" aria-label="Like reply"><Icon icon="solar:heart-linear" className="size-5" aria-hidden="true" /></Button><Button variant="ghost" size="icon" className="size-10" aria-label="Reply"><Icon icon="solar:chat-round-linear" className="size-5" aria-hidden="true" /></Button></div></div></article>)}</section>;
}

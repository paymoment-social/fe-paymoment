import Link from "next/link";
import { AuthorAvatar, VerifiedMark } from "./AuthorAvatar";
import type { FeedPost } from "../types";

export function QuotedPostCard({ post }: { post: FeedPost }) {
  return (
    <Link href={`/post/${post.id}`} className="mt-3 block rounded-xl border bg-background/45 p-4 transition-colors hover:bg-accent/35 focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Open quoted moment by ${post.author.handle}`}>
      <div className="flex items-center gap-2">
        <AuthorAvatar author={post.author} className="size-7" />
        <span className="truncate text-sm font-semibold">{post.author.handle}</span>
        {post.author.verified && <VerifiedMark />}
        <span className="text-xs text-muted-foreground">· {post.createdAt}</span>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-5 text-foreground">{post.body}</p>
      {post.tag && <p className="mt-2 text-sm text-primary">{post.tag}</p>}
    </Link>
  );
}

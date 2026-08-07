"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CURRENT_USER } from "../constants";
import { useFeedStore } from "../store/useFeedStore";
import type { FeedPost } from "../types";
import { AuthorAvatar } from "./AuthorAvatar";
import { QuotedPostCard } from "./QuotedPostCard";

export function QuoteComposer({ post, open, onOpenChange }: { post: FeedPost; open: boolean; onOpenChange: (open: boolean) => void }) {
  const addPost = useFeedStore((state) => state.addPost);
  const form = useForm({ defaultValues: { body: "" }, onSubmit: async ({ value }) => {
    const body = value.body.trim();
    if (!body) return;
    addPost({ id: `quote-${crypto.randomUUID()}`, author: CURRENT_USER, body, createdAt: "now", likes: 0, replies: 0, reposts: 0, reward: 5, quotedPost: post });
    form.reset(); onOpenChange(false); toast.success("Quote posted");
  }});
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-popover sm:max-w-xl"><DialogHeader><DialogTitle>Quote moment</DialogTitle><DialogDescription>Add your perspective before sharing this moment.</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(); }} className="space-y-4"><div className="flex items-start gap-3"><AuthorAvatar author={CURRENT_USER} className="size-10" /><form.Field name="body">{(field) => <div className="min-w-0 flex-1"><label htmlFor={`quote-${post.id}`} className="sr-only">Add your comment</label><textarea id={`quote-${post.id}`} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} placeholder="Add your comment…" maxLength={500} rows={3} className="min-h-20 w-full resize-none rounded-lg bg-transparent p-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /><p className="text-right text-xs tabular-nums text-muted-foreground">{field.state.value.length}/500</p></div>}</form.Field></div><QuotedPostCard post={post} /><div className="flex justify-end"><form.Subscribe selector={(state) => [state.values.body, state.isSubmitting]}>{([body, submitting]) => <Button type="submit" className="h-10 rounded-full px-6" disabled={!String(body).trim() || Boolean(submitting)} aria-busy={Boolean(submitting)}>{submitting ? "Posting…" : "Quote"}</Button>}</form.Subscribe></div></form></DialogContent></Dialog>;
}

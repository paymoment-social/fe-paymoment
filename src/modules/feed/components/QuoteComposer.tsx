"use client";

import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { useCreateMoment } from "../hooks/usePostMutations";
import { uploadFeedMedia } from "../services/feed.service";
import type { FeedPost } from "../types";
import { AuthorAvatar } from "./AuthorAvatar";
import { QuotedPostCard } from "./QuotedPostCard";

export function QuoteComposer({ post, open, onOpenChange }: { post: FeedPost; open: boolean; onOpenChange: (open: boolean) => void }) {
  const currentUser = useCurrentUser();
  const createMoment = useCreateMoment();
  const [submitError, setSubmitError] = useState<string>();
  const [mediaFile, setMediaFile] = useState<File>();
  const [mediaPreview, setMediaPreview] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: { body: "" },
    onSubmit: async ({ value }) => {
      const body = value.body.trim();
      if (!body && !mediaFile) return;
      setSubmitError(undefined);
      try {
        const uploaded = mediaFile ? await uploadFeedMedia(mediaFile, "post") : undefined;
        await createMoment.mutateAsync({ body, quotedPostId: post.id, mediaAssetIds: uploaded ? [uploaded.id] : [] });
        form.reset();
        setMediaFile(undefined);
        setMediaPreview(undefined);
        onOpenChange(false);
        toast.success("Quote posted");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Your quote could not be posted.";
        setSubmitError(message);
        toast.error(message);
      }
    },
  });

  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5 MB");
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quote moment</DialogTitle>
          <DialogDescription>Add your perspective before sharing this moment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(); }} className="space-y-4">
          <div className="flex items-start gap-3">
            <AuthorAvatar author={currentUser} className="size-10" />
            <form.Field name="body">
              {(field) => (
                <div className="min-w-0 flex-1">
                  <label htmlFor={`quote-${post.id}`} className="sr-only">Add your comment</label>
                  <textarea id={`quote-${post.id}`} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} placeholder="Add your comment..." maxLength={500} rows={3} className="min-h-20 w-full resize-none rounded-lg bg-transparent p-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(event) => { chooseImage(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                      <Button type="button" variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground" aria-label="Add image" onClick={() => fileInput.current?.click()}><Icon icon="solar:gallery-linear" className="size-5" aria-hidden="true" /></Button>
                      <EmojiPickerPopover className="size-10" onEmoji={(emoji) => field.handleChange(`${field.state.value}${emoji}`)} />
                    </div>
                    <p className="text-xs tabular-nums text-muted-foreground">{field.state.value.length}/500</p>
                  </div>
                </div>
              )}
            </form.Field>
          </div>
          {mediaPreview && <div className="relative ml-13 overflow-hidden rounded-xl border bg-muted"><Image src={mediaPreview} alt="Quote image preview" width={720} height={420} unoptimized className="max-h-64 w-full object-cover" /><Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2 size-9 rounded-full" aria-label="Remove image" onClick={() => { setMediaFile(undefined); setMediaPreview(undefined); }}><Icon icon="solar:close-circle-bold" className="size-5" aria-hidden="true" /></Button></div>}
          <QuotedPostCard post={post} />
          {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
          <div className="flex justify-end">
            <form.Subscribe selector={(state) => [state.values.body, state.isSubmitting]}>
              {([body, submitting]) => <Button type="submit" className="h-10 rounded-full px-6" disabled={(!String(body).trim() && !mediaFile) || Boolean(submitting) || createMoment.isPending} aria-busy={Boolean(submitting) || createMoment.isPending}>{submitting || createMoment.isPending ? "Posting..." : "Quote"}</Button>}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

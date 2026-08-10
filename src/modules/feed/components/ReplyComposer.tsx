"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useForm } from "@tanstack/react-form";
import { type CSSProperties, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { useCreateReply } from "../hooks/usePostMutations";
import { uploadFeedMedia } from "../services/feed.service";
import { AuthorAvatar } from "./AuthorAvatar";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const compactEmojiPickerStyle = {
  "--epr-horizontal-padding": "8px",
  "--epr-picker-border-radius": "14px",
  "--epr-header-padding": "10px 8px",
  "--epr-search-input-height": "34px",
  "--epr-search-input-padding": "0 28px",
  "--epr-category-navigation-button-size": "28px",
  "--epr-category-padding": "0 8px",
  "--epr-category-label-height": "32px",
  "--epr-emoji-size": "22px",
  "--epr-emoji-padding": "1px",
  "--epr-preview-height": "50px",
} as CSSProperties;

type ReplyComposerProps = {
  postId: string;
  parentId?: string;
  handle: string;
  onSubmitted?: () => void;
};

export function ReplyComposer({ postId, parentId, handle, onSubmitted }: ReplyComposerProps) {
  const currentUser = useCurrentUser();
  const createReply = useCreateReply(postId, parentId);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [media, setMedia] = useState<string>();
  const [mediaFile, setMediaFile] = useState<File>();
  const [showEmoji, setShowEmoji] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const form = useForm({
    defaultValues: { body: "" },
    onSubmit: async ({ value }) => {
      const body = value.body.trim();
      if (!body && !mediaFile) return;
      setSubmitError(undefined);
      try {
        const uploaded = mediaFile ? await uploadFeedMedia(mediaFile, "reply") : undefined;
        await createReply.mutateAsync({ body, mediaAssetIds: uploaded ? [uploaded.id] : [] });
        form.reset();
        setMedia(undefined);
        setMediaFile(undefined);
        onSubmitted?.();
        toast.success("Reply posted");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Your reply could not be posted.";
        setSubmitError(message);
        toast.error(message);
      }
    },
  });

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setMedia(String(reader.result));
    reader.readAsDataURL(file);
    setMediaFile(file);
  }

  return (
    <form
      id="reply-composer"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="scroll-mt-20 border-t p-4"
    >
      <div className="flex items-start gap-3">
        <AuthorAvatar author={currentUser} className="size-10" />
        <div className="min-w-0 flex-1">
          <form.Field name="body">
            {(field) => (
              <>
                <label htmlFor={`detail-reply-${postId}-${parentId ?? "root"}`} className="sr-only">
                  Reply to {handle}
                </label>
                <textarea
                  ref={textarea}
                  id={`detail-reply-${postId}-${parentId ?? "root"}`}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  rows={2}
                  maxLength={500}
                  placeholder={`Reply to ${handle}...`}
                  className="min-h-12 w-full resize-none rounded-md bg-transparent px-2 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </>
            )}
          </form.Field>

          {media && (
            <div className="relative mt-2 w-fit overflow-hidden rounded-xl border">
              <Image src={media} alt="Reply upload preview" width={180} height={120} unoptimized className="h-24 w-36 object-cover" />
              <Button type="button" size="icon" variant="secondary" className="absolute right-1 top-1 size-10 rounded-full" aria-label="Remove image" onClick={() => { setMedia(undefined); setMediaFile(undefined); }}>
                <Icon icon="solar:close-circle-bold" className="size-5" aria-hidden="true" />
              </Button>
            </div>
          )}

          {submitError && <p role="alert" className="mt-2 text-sm text-destructive">{submitError}</p>}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex">
              <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
              <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="Add image" onClick={() => fileInput.current?.click()}>
                <Icon icon="solar:gallery-linear" className="size-5" aria-hidden="true" />
              </Button>
              <div className="relative">
                <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="Add emoji" aria-expanded={showEmoji} onClick={() => setShowEmoji((value) => !value)}>
                  <Icon icon="solar:smile-circle-linear" className="size-5" aria-hidden="true" />
                </Button>
                {showEmoji && (
                  <div className="absolute bottom-11 left-0 z-50 overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
                    <EmojiPicker
                      theme={"dark" as never}
                      width="min(360px, calc(100vw - 2rem))"
                      height={350}
                      lazyLoadEmojis
                      skinTonesDisabled
                      previewConfig={{ showPreview: false }}
                      searchPlaceHolder="Search emoji"
                      style={compactEmojiPickerStyle}
                      onEmojiClick={(emoji) => {
                        form.setFieldValue("body", `${form.getFieldValue("body")}${emoji.emoji}`);
                        setShowEmoji(false);
                        textarea.current?.focus();
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <form.Subscribe selector={(state) => [state.values.body, state.isSubmitting]}>
              {([body, submitting]) => (
                <Button type="submit" className="h-10 rounded-full px-5" disabled={(!String(body).trim() && !mediaFile) || Boolean(submitting) || createReply.isPending} aria-busy={Boolean(submitting) || createReply.isPending}>
                  {submitting || createReply.isPending ? "Replying..." : "Reply"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  );
}

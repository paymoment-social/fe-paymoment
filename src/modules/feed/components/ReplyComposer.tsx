"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CURRENT_USER } from "../constants";
import { useFeedStore } from "../store/useFeedStore";
import { AuthorAvatar } from "./AuthorAvatar";

type ReplyComposerProps = {
  postId: string;
  handle: string;
  onSubmitted?: () => void;
};

export function ReplyComposer({ postId, handle, onSubmitted }: ReplyComposerProps) {
  const addReply = useFeedStore((state) => state.addReply);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [media, setMedia] = useState<string>();

  const form = useForm({
    defaultValues: { body: "" },
    onSubmit: async ({ value }) => {
      const body = value.body.trim();
      if (!body) return;

      addReply({
        id: `reply-${crypto.randomUUID()}`,
        postId,
        author: CURRENT_USER,
        body,
        media,
        createdAt: "now",
        likes: 0,
      });
      form.reset();
      setMedia(undefined);
      onSubmitted?.();
      toast.success("Reply posted");
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
        <AuthorAvatar author={CURRENT_USER} className="size-10" />
        <div className="min-w-0 flex-1">
          <form.Field name="body">
            {(field) => (
              <>
                <label htmlFor={`detail-reply-${postId}`} className="sr-only">
                  Reply to {handle}
                </label>
                <textarea
                  ref={textarea}
                  id={`detail-reply-${postId}`}
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
              <Button type="button" size="icon" variant="secondary" className="absolute right-1 top-1 size-10 rounded-full" aria-label="Remove image" onClick={() => setMedia(undefined)}>
                <Icon icon="solar:close-circle-bold" className="size-5" aria-hidden="true" />
              </Button>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <div className="flex">
              <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
              <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="Add image" onClick={() => fileInput.current?.click()}>
                <Icon icon="solar:gallery-linear" className="size-5" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="Add GIF" onClick={() => toast.info("GIF search is ready for API integration")}>
                <Icon icon="solar:video-library-linear" className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <form.Subscribe selector={(state) => [state.values.body, state.isSubmitting]}>
              {([body, submitting]) => (
                <Button type="submit" className="h-10 rounded-full px-5" disabled={!String(body).trim() || Boolean(submitting)} aria-busy={Boolean(submitting)}>
                  {submitting ? "Replying..." : "Reply"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  );
}

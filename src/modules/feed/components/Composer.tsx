"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CURRENT_USER } from "../constants";
import { useComposer } from "../context/ComposerContext";
import { useFeedStore } from "../store/useFeedStore";
import { AuthorAvatar } from "./AuthorAvatar";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const tools = [
  { icon: "solar:gallery-linear", label: "Add image", action: "image" },
  { icon: "solar:video-library-linear", label: "Add GIF", action: "gif" },
  { icon: "solar:chart-square-linear", label: "Add poll", action: "poll" },
  { icon: "solar:smile-circle-linear", label: "Add emoji", action: "emoji" },
] as const;

export function Composer({ compact = false }: { compact?: boolean }) {
  const { open, setOpen } = useComposer();
  const addPost = useFeedStore((state) => state.addPost);
  const fileInput = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<string>();
  const [showEmoji, setShowEmoji] = useState(false);
  const form = useForm({
    defaultValues: { body: "" },
    onSubmit: async ({ value }) => {
      const body = value.body.trim();
      if (!body) return;
      addPost({
        id: `local-${crypto.randomUUID()}`,
        author: CURRENT_USER,
        body,
        createdAt: "now",
        likes: 0,
        replies: 0,
        reposts: 0,
        reward: 5,
        media: media ? [media] : undefined,
      });
      form.reset();
      setMedia(undefined);
      setOpen(false);
      toast.success("Moment posted", { description: "+5 Box added to your pending rewards." });
    },
  });

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setMedia(String(reader.result));
    reader.readAsDataURL(file);
  }

  const composerBody = (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="flex items-start gap-3">
        <AuthorAvatar author={CURRENT_USER} />
        <form.Field name="body">
          {(field) => (
            <div className="min-w-0 flex-1">
              <label htmlFor="moment-body" className="sr-only">What’s your PayBox moment?</label>
              <textarea
                id="moment-body"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="What’s your PayBox moment?"
                maxLength={500}
                rows={compact ? 2 : 5}
                className="min-h-16 w-full resize-none bg-transparent py-2 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0"
              />
              {!compact && <p className="text-right text-xs tabular-nums text-muted-foreground">{field.state.value.length}/500</p>}
            </div>
          )}
        </form.Field>
      </div>

      {media && (
        <div className="relative ml-14 overflow-hidden rounded-xl border bg-muted">
          <Image src={media} alt="Selected upload preview" width={720} height={420} unoptimized className="max-h-72 w-full object-cover" />
          <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2 size-10 rounded-full" aria-label="Remove image" onClick={() => setMedia(undefined)}>
            <Icon icon="solar:close-circle-bold" className="size-5" aria-hidden="true" />
          </Button>
        </div>
      )}

      <div className="relative flex items-center justify-between gap-3 pl-12">
        <input ref={fileInput} type="file" accept="image/*" className="sr-only" aria-label="Upload image" onChange={(event) => chooseFile(event.target.files?.[0])} />
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.action}
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 text-muted-foreground hover:text-foreground"
              aria-label={tool.label}
              onClick={() => {
                if (tool.action === "image") fileInput.current?.click();
                else if (tool.action === "emoji") setShowEmoji((value) => !value);
                else toast.info(`${tool.label} is ready for backend integration`);
              }}
            >
              <Icon icon={tool.icon} className="size-5" aria-hidden="true" />
            </Button>
          ))}
        </div>
        <form.Subscribe selector={(state) => [state.values.body, state.isSubmitting]}>
          {([body, isSubmitting]) => (
            <Button type="submit" disabled={!String(body).trim() || Boolean(isSubmitting)} className="h-10 min-w-20 rounded-xl bg-foreground px-5 text-background hover:bg-foreground/90">
              {isSubmitting ? "Posting…" : "Post"}
            </Button>
          )}
        </form.Subscribe>
        {showEmoji && (
          <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[70] mx-auto w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-popover shadow-xl sm:absolute sm:inset-x-auto sm:bottom-12 sm:left-12 sm:mx-0">
            <EmojiPicker
              theme={"dark" as never}
              width="100%"
              height={300}
              lazyLoadEmojis
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
              searchPlaceHolder="Search emoji"
              onEmojiClick={(emoji) => {
                const current = form.getFieldValue("body");
                form.setFieldValue("body", `${current}${emoji.emoji}`);
                setShowEmoji(false);
              }}
            />
          </div>
        )}
      </div>
    </form>
  );

  if (compact) return <section className="rounded-xl border bg-card/50 p-4">{composerBody}</section>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border bg-popover sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a moment</DialogTitle>
          <DialogDescription>Share an update and earn Box when the community engages.</DialogDescription>
        </DialogHeader>
        {composerBody}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { type CSSProperties, useDeferredValue, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { getDiscoverData } from "@/modules/discover/services/discover.service";
import { useComposer } from "../context/ComposerContext";
import { useCreateMoment } from "../hooks/usePostMutations";
import { uploadFeedMedia } from "../services/feed.service";
import { AuthorAvatar } from "./AuthorAvatar";
import { PollComposerDialog, type PollDraft } from "./PollComposerDialog";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const compactEmojiPickerStyle = {
  "--epr-horizontal-padding": "8px",
  "--epr-picker-border-radius": "14px",
  "--epr-header-padding": "10px 8px",
  "--epr-search-input-height": "34px",
  "--epr-search-input-padding": "0 28px",
  "--epr-search-input-border-radius": "999px",
  "--epr-category-navigation-button-size": "28px",
  "--epr-category-padding": "0 8px",
  "--epr-category-label-height": "32px",
  "--epr-emoji-size": "22px",
  "--epr-emoji-padding": "1px",
  "--epr-preview-height": "50px",
} as CSSProperties;

const tools = [
  { icon: "solar:gallery-linear", label: "Add image or video", action: "image" },
  { icon: "solar:chart-square-linear", label: "Add poll", action: "poll" },
  { icon: "solar:smile-circle-linear", label: "Add emoji", action: "emoji" },
  { icon: "solar:document-text-linear", label: "Write article", action: "article" },
] as const;

function mentionQuery(value: string) {
  return value.match(/(?:^|\s)@([a-zA-Z0-9_.-]*)$/)?.[1] ?? null;
}

function MentionSuggestions({ value, onSelect }: { value: string; onSelect: (handle: string) => void }) {
  const query = mentionQuery(value)?.toLowerCase() ?? "";
  const deferredQuery = useDeferredValue(query);
  const suggestions = useQuery({ queryKey: ["paymoment", "composer-mentions", deferredQuery], queryFn: () => getDiscoverData(deferredQuery, "people"), enabled: query.length >= 1, staleTime: 30_000 });
  const people = suggestions.data?.people ?? [];
  if (!query || suggestions.isLoading || people.length === 0) return null;
  return <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl">{people.slice(0, 5).map((person) => <button key={person.id} type="button" className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(person.handle)}><AuthorAvatar author={person} className="size-8" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{person.name}</span><span className="block truncate text-xs text-muted-foreground">@{person.handle}</span></span>{person.verified && <Icon icon="solar:verified-check-bold" className="size-4 text-primary" aria-hidden="true" />}</button>)}</div>;
}

export function Composer({ compact = false }: { compact?: boolean }) {
  const { open, setOpen } = useComposer();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const createMoment = useCreateMoment();
  const verified = Boolean(currentUser.verified);
  const fileInput = useRef<HTMLInputElement>(null);
  const emojiTrigger = useRef<HTMLButtonElement>(null);
  const emojiPicker = useRef<HTMLDivElement>(null);
  const [mediaFile, setMediaFile] = useState<File>();
  const [media, setMedia] = useState<string>();
  const [showEmoji, setShowEmoji] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [poll, setPoll] = useState<PollDraft>();
  const [submitError, setSubmitError] = useState<string>();
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const form = useForm({
    defaultValues: { body: "" },
    onSubmit: async ({ value }) => {
      const body = value.body.trim();
      if (!body && !mediaFile && !poll) return;
      setSubmitError(undefined);
      try {
        const uploaded = mediaFile ? await uploadFeedMedia(mediaFile, "post") : undefined;
        await createMoment.mutateAsync({ body, mediaAssetIds: uploaded ? [uploaded.id] : [], poll: poll ? { question: poll.question, options: poll.options.map((option) => option.label) } : undefined });
        form.reset();
        setMediaFile(undefined);
        setMedia(undefined);
        setPoll(undefined);
        setOpen(false);
        toast.success("Moment posted");
      } catch (error) {
        const message = error instanceof Error ? error.message : "The Moment could not be posted.";
        setSubmitError(message);
        toast.error(message);
      }
    },
  });

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Choose an image or video file");
      return;
    }
    const maxBytes = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(file.type.startsWith("video/") ? "Video must be smaller than 50 MB" : "Image must be smaller than 10 MB");
      return;
    }
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = () => setMedia(String(reader.result));
    reader.readAsDataURL(file);
  }

  function updateEmojiPickerPosition() {
    const trigger = emojiTrigger.current;
    if (!trigger) return;

    const viewportPadding = 8;
    const pickerWidth = Math.min(360, window.innerWidth - viewportPadding * 2);
    const pickerHeight = 360;
    const triggerRect = trigger.getBoundingClientRect();
    const left = Math.min(
      Math.max(viewportPadding, triggerRect.left + triggerRect.width / 2 - pickerWidth / 2),
      window.innerWidth - pickerWidth - viewportPadding,
    );
    const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
    const canOpenAbove = triggerRect.top - viewportPadding >= pickerHeight;
    const top = canOpenAbove && spaceBelow < pickerHeight
      ? triggerRect.top - pickerHeight - viewportPadding
      : Math.min(triggerRect.bottom + viewportPadding, window.innerHeight - pickerHeight - viewportPadding);

    setEmojiPickerPosition({ top: Math.max(viewportPadding, top), left });
  }

  useEffect(() => {
    if (!showEmoji) return;
    const frame = window.requestAnimationFrame(updateEmojiPickerPosition);
    const reposition = () => updateEmojiPickerPosition();
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (emojiPicker.current?.contains(target) || emojiTrigger.current?.contains(target)) return;
      setShowEmoji(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowEmoji(false);
    };

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showEmoji]);

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
        <AuthorAvatar author={currentUser} />
        <form.Field name="body">
          {(field) => (
            <div className="relative min-w-0 flex-1">
              <label htmlFor="moment-body" className="sr-only">What’s your PayMoment moment?</label>
              <textarea
                id="moment-body"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="What’s your PayMoment moment?"
                maxLength={500}
                rows={compact ? 2 : 5}
                className="min-h-16 w-full resize-none bg-transparent py-2 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0"
              />
              <MentionSuggestions value={field.state.value} onSelect={(handle) => field.handleChange(field.state.value.replace(/(^|\s)@[a-zA-Z0-9_.-]*$/, `$1@${handle} `))} />
              {!compact && <p className="text-right text-xs tabular-nums text-muted-foreground">{field.state.value.length}/500</p>}
            </div>
          )}
        </form.Field>
      </div>

      {media && (
        <div className="relative ml-14 overflow-hidden rounded-xl border bg-muted">
          {mediaFile?.type.startsWith("video/") ? <video src={media} controls playsInline className="max-h-72 w-full object-cover" aria-label="Selected video preview" /> : <Image src={media} alt="Selected upload preview" width={720} height={420} unoptimized className="max-h-72 w-full object-cover" />}
          <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2 size-10 rounded-full" aria-label="Remove image" onClick={() => { setMedia(undefined); setMediaFile(undefined); }}>
            <Icon icon="solar:close-circle-bold" className="size-5" aria-hidden="true" />
          </Button>
        </div>
      )}

      {poll && <div className="ml-14 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm"><Icon icon="solar:chart-square-linear" className="size-4 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">Poll: {poll.question}</span><Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Remove poll" onClick={() => setPoll(undefined)}><Icon icon="solar:close-circle-linear" className="size-4" aria-hidden="true" /></Button></div>}

      {submitError && <p role="alert" className="ml-14 text-sm text-destructive">{submitError}</p>}

      <div className="relative flex items-center justify-between gap-3 pl-12">
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" className="sr-only" aria-label="Upload image or video" onChange={(event) => chooseFile(event.target.files?.[0])} />
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.action}
              type="button"
              variant="ghost"
              size="icon"
              ref={tool.action === "emoji" ? emojiTrigger : undefined}
              className="size-10 text-muted-foreground hover:text-foreground"
              aria-label={tool.label}
              onClick={() => {
                if (tool.action === "image") fileInput.current?.click();
                else if (tool.action === "article") {
                  if (verified) router.push("/article/new");
                  else toast.info("Verify your account to publish an article");
                }
                else if (tool.action === "poll") setPollOpen(true);
                else if (tool.action === "emoji") setShowEmoji((value) => !value);
              }}
            >
              <Icon icon={tool.icon} className="size-5" aria-hidden="true" />
            </Button>
          ))}
        </div>
        <form.Subscribe selector={(state) => [state.values.body, state.isSubmitting]}>
          {([body, isSubmitting]) => (
            <Button type="submit" disabled={(!String(body).trim() && !mediaFile && !poll) || Boolean(isSubmitting) || createMoment.isPending} aria-busy={Boolean(isSubmitting) || createMoment.isPending} className="h-10 min-w-20 rounded-xl bg-foreground px-5 text-background hover:bg-foreground/90">
              {isSubmitting || createMoment.isPending ? "Posting…" : "Post"}
            </Button>
          )}
        </form.Subscribe>
        {showEmoji && typeof document !== "undefined" && createPortal(
          <div
            ref={emojiPicker}
            className="fixed z-[1000] w-[min(22.5rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border/80 bg-popover p-1 shadow-2xl"
            style={{ top: emojiPickerPosition.top, left: emojiPickerPosition.left }}
          >
            <EmojiPicker
              theme={"dark" as never}
              width="100%"
              height={350}
              className="compact-emoji-picker"
              style={compactEmojiPickerStyle}
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
          </div>,
          document.body,
        )}
      </div>
    </form>
  );

  if (compact) return <><section className="rounded-xl border bg-card/50 p-4">{composerBody}</section><PollComposerDialog open={pollOpen} onOpenChange={setPollOpen} onCreated={setPoll} /></>;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create a moment</DialogTitle>
            <DialogDescription>Share an update and earn Box when the community engages.</DialogDescription>
          </DialogHeader>
          {composerBody}
        </DialogContent>
      </Dialog>
      <PollComposerDialog open={pollOpen} onOpenChange={setPollOpen} onCreated={setPoll} />
    </>
  );
}

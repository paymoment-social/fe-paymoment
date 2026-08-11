"use client";

import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const pickerStyle = {
  "--epr-horizontal-padding": "8px",
  "--epr-picker-border-radius": "14px",
  "--epr-header-padding": "10px 8px",
  "--epr-search-input-height": "34px",
  "--epr-search-input-border-radius": "999px",
  "--epr-category-navigation-button-size": "28px",
  "--epr-emoji-size": "22px",
  "--epr-preview-height": "50px",
} as CSSProperties;

export function EmojiPickerPopover({ onEmoji, className, label = "Add emoji" }: { onEmoji: (emoji: string) => void; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const padding = 8;
      const width = Math.min(360, window.innerWidth - padding * 2);
      const height = 360;
      const rect = trigger.getBoundingClientRect();
      const left = Math.min(Math.max(padding, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - padding);
      const top = rect.top >= height + padding
        ? rect.top - height - padding
        : Math.min(rect.bottom + padding, window.innerHeight - height - padding);
      setPosition({ top: Math.max(padding, top), left });
    };
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!pickerRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  return <>
    <Button ref={triggerRef} type="button" variant="ghost" size="icon" className={cn("size-11 shrink-0 rounded-full text-muted-foreground hover:text-foreground", className)} aria-label={label} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <Icon icon="solar:smile-circle-linear" className="size-5" aria-hidden="true" />
    </Button>
    {open && typeof document !== "undefined" && createPortal(
      <div ref={pickerRef} className="fixed z-[1000] w-[min(22.5rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border/80 bg-popover p-1 shadow-2xl" style={{ top: position.top, left: position.left }}>
        <EmojiPicker theme={"dark" as never} width="100%" height={350} className="compact-emoji-picker" style={pickerStyle} lazyLoadEmojis skinTonesDisabled previewConfig={{ showPreview: false }} searchPlaceHolder="Search emoji" onEmojiClick={(emoji) => { onEmoji(emoji.emoji); setOpen(false); }} />
      </div>,
      document.body,
    )}
  </>;
}

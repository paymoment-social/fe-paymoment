"use client";

import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useFeedStore } from "../store/useFeedStore";
import type { FeedPost } from "../types";
import { formatEngagement } from "../utils/formatEngagement";

export function RepostMenu({ post, onQuote }: { post: FeedPost; onQuote: () => void }) {
  const reposted = useFeedStore((state) => (state.repostedIds ?? []).includes(post.id));
  const toggleRepost = useFeedStore((state) => state.toggleRepost);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className={cn("h-10 min-w-10 gap-1.5 rounded-none border-0 bg-transparent px-2 text-muted-foreground hover:bg-transparent hover:text-foreground", reposted && "text-primary hover:text-primary")} aria-label={reposted ? "Undo repost" : "Open repost options"} />}>
        <Icon icon="solar:repeat-linear" className="size-5" aria-hidden="true" />
        <span className="hidden text-xs tabular-nums sm:inline">{formatEngagement(post.reposts + (reposted ? 1 : 0))}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" sideOffset={6} className="w-64 rounded-2xl bg-popover p-2 shadow-xl">
        <DropdownMenuItem className="min-h-12 rounded-xl px-4 text-[15px] font-semibold" onClick={() => { toggleRepost(post.id); toast.success(reposted ? "Repost removed" : "Moment reposted", { description: reposted ? undefined : "+2 Box pending" }); }}>
          <span className="flex-1">{reposted ? "Undo repost" : "Repost"}</span><Icon icon="solar:repeat-linear" className="size-6" aria-hidden="true" />
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-12 rounded-xl px-4 text-[15px] font-semibold" onClick={onQuote}>
          <span className="flex-1">Quote</span><Icon icon="solar:chat-square-like-linear" className="size-6" aria-hidden="true" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

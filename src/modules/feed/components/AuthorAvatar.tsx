import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FeedAuthor } from "../types";

export function AuthorAvatar({ author, className }: { author: FeedAuthor; className?: string }) {
  return (
    <Avatar className={cn("size-11 border border-border", className)}>
      <AvatarImage src={author.avatar} alt={`${author.name}'s profile`} />
      <AvatarFallback className="bg-secondary text-xs font-semibold">{author.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
}

export function VerifiedMark() {
  return <Icon icon="solar:verified-check-bold" className="size-4 text-sky-400" aria-label="Verified account" />;
}

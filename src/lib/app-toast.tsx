import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { AuthorAvatar } from "@/modules/feed/components/AuthorAvatar";
import type { FeedAuthor } from "@/modules/feed/types";

const toastCard = "flex w-full min-w-0 items-center gap-3 text-popover-foreground";

export function showLikeToast(author: FeedAuthor, description = `You liked @${author.handle}'s moment`) {
  toast.custom(() => (
    <div className={toastCard}>
      <AuthorAvatar author={author} className="size-8 shrink-0" />
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{author.name} <span className="font-normal text-muted-foreground">liked your moment</span></p><p className="truncate text-xs text-muted-foreground">{description}</p></div>
      <Icon icon="solar:heart-bold" className="size-5 shrink-0 text-rose-400" aria-hidden="true" />
    </div>
  ), { duration: 3200 });
}

export function showBoxToast(amount: number, description = "Reward added to your balance") {
  toast.custom(() => (
    <div className={toastCard}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-lg font-bold text-primary">+</span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">+{amount} Box</p><p className="truncate text-xs text-muted-foreground">{description}</p></div>
      <Icon icon="solar:box-bold" className="size-5 shrink-0 text-primary" aria-hidden="true" />
    </div>
  ), { duration: 3200 });
}

"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BookmarksProvider, BookmarksView } from "@/modules/bookmarks";
import { DiscoverProvider, DiscoverView } from "@/modules/discover";
import { Composer, ComposerProvider, FeedView, useComposer } from "@/modules/feed";
import { MessagesProvider, MessagesView } from "@/modules/messages";
import { NotificationsProvider, NotificationsView } from "@/modules/notifications";
import { ProfileProvider, ProfileView } from "@/modules/profile";
import { RewardsProvider, RewardsView, VerifiedUnlockDialog } from "@/modules/rewards";
import { ShellProvider } from "../context/ShellContext";
import { useSectionTitle } from "../hooks/useSectionTitle";
import type { ShellSection } from "../types";
import { MobileNavigation } from "./MobileNavigation";
import { ProductLogo } from "./ProductLogo";
import { RightRail } from "./RightRail";
import { Sidebar } from "./Sidebar";

export function PayMomentShell({ section }: { section: ShellSection }) {
  return (
    <ShellProvider><ComposerProvider><DiscoverProvider><NotificationsProvider><MessagesProvider><RewardsProvider><ProfileProvider><BookmarksProvider>
      <ShellLayout section={section} />
    </BookmarksProvider></ProfileProvider></RewardsProvider></MessagesProvider></NotificationsProvider></DiscoverProvider></ComposerProvider></ShellProvider>
  );
}

function ShellLayout({ section }: { section: ShellSection }) {
  const title = useSectionTitle(section);
  const { setOpen } = useComposer();
  const [feedOrder, setFeedOrder] = useState<"Latest" | "Top">("Latest");
  const isMessages = section === "messages";
  return (
    <>
      <div className="mx-auto grid min-h-screen w-full max-w-[105rem] grid-cols-1 justify-center gap-5 px-4 pb-24 sm:px-6 lg:grid-cols-[18rem_minmax(0,48rem)] lg:gap-8 lg:pb-0 xl:grid-cols-[16rem_minmax(0,48rem)_20rem] xl:gap-5 min-[1600px]:grid-cols-[20.5rem_minmax(0,48rem)_25.5rem] min-[1600px]:gap-8">
        <Sidebar active={section} />
        <main className={cn("min-w-0", isMessages ? "flex h-screen min-h-0 w-full flex-col overflow-hidden py-5 lg:py-6 xl:col-span-2" : "py-5 lg:py-6")}>
          <header className="sticky top-0 z-20 -mx-1 mb-4 flex min-h-11 items-center justify-between bg-background/90 px-1 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3"><div className="lg:hidden"><ProductLogo compact /></div><h1 className="truncate text-xl font-semibold tracking-[-0.025em] lg:text-2xl">{title}</h1></div>
            {section === "for-you" ? <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-3 px-3 text-sm font-normal" aria-label={`Feed order: ${feedOrder}`} />}>{feedOrder}<Icon icon="solar:alt-arrow-down-linear" className="size-4" aria-hidden="true" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-36 p-1.5">{(["Latest", "Top"] as const).map((option) => <DropdownMenuItem key={option} className="min-h-10 px-3" onClick={() => setFeedOrder(option)}>{option}{feedOrder === option && <Icon icon="solar:check-circle-bold" className="ml-auto size-4 text-primary" aria-hidden="true" />}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu> : <Button variant="ghost" size="icon" className="size-10 rounded-full" aria-label="Page options"><Icon icon="solar:menu-dots-circle-linear" className="size-6" aria-hidden="true" /></Button>}
          </header>
          <div className={cn(isMessages && "min-h-0 flex-1")}><SectionContent section={section} /></div>
        </main>
        {!isMessages && <RightRail />}
      </div>
      {!isMessages && <Button size="icon" className="fixed bottom-20 right-4 z-30 size-14 rounded-full bg-gradient-to-br from-primary to-violet-700 text-white shadow-[0_1rem_2.5rem_-0.75rem_color-mix(in_oklch,var(--primary)_60%,transparent)] hover:opacity-90 lg:bottom-8 lg:right-8 lg:size-20 xl:right-8 min-[1600px]:right-10" aria-label="Create a moment" onClick={() => setOpen(true)}><Icon icon="solar:pen-new-square-linear" className="size-7 lg:size-8" aria-hidden="true" /></Button>}
      <MobileNavigation active={section} />
      <Composer />
      <VerifiedUnlockDialog />
    </>
  );
}

function SectionContent({ section }: { section: ShellSection }) {
  switch (section) {
    case "discover": return <DiscoverView />;
    case "notifications": return <NotificationsView />;
    case "messages": return <MessagesView />;
    case "rewards": return <RewardsView />;
    case "profile": return <ProfileView />;
    case "bookmarks": return <BookmarksView />;
    default: return <FeedView />;
  }
}

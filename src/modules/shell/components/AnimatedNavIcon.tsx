"use client";

import { BellIcon, BookmarkIcon, HouseIcon, MailIcon, SearchIcon, UserRoundIcon } from "@animateicons/react/lucide";
import type { ShellSection } from "../types";

export function AnimatedNavIcon({ section, className }: { section: ShellSection; className?: string }) {
  const props = { size: 24, className, "aria-hidden": true } as const;
  switch (section) {
    case "for-you": return <HouseIcon {...props} />;
    case "discover": return <SearchIcon {...props} />;
    case "notifications": return <BellIcon {...props} />;
    case "messages": return <MailIcon {...props} />;
    case "profile": return <UserRoundIcon {...props} />;
    case "bookmarks": return <BookmarkIcon {...props} />;
    default: return null;
  }
}

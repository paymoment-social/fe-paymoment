"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bookmark01Icon,
  Home01Icon,
  Mail01Icon,
  Notification01Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { ShellSection } from "../types";

export function AnimatedNavIcon({ section, className }: { section: ShellSection; className?: string }) {
  const props = { size: 24, className, strokeWidth: 1.8, "aria-hidden": true } as const;
  switch (section) {
    case "for-you": return <HugeiconsIcon icon={Home01Icon} {...props} />;
    case "discover": return <HugeiconsIcon icon={Search01Icon} {...props} />;
    case "notifications": return <HugeiconsIcon icon={Notification01Icon} {...props} />;
    case "messages": return <HugeiconsIcon icon={Mail01Icon} {...props} />;
    case "profile": return <HugeiconsIcon icon={UserIcon} {...props} />;
    case "bookmarks": return <HugeiconsIcon icon={Bookmark01Icon} {...props} />;
    default: return null;
  }
}

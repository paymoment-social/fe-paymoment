"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "../constants";
import type { ShellSection } from "../types";
import { sectionHref } from "../utils/sectionHref";
import { AnimatedNavIcon } from "./AnimatedNavIcon";

export function MobileNavigation({ active }: { active: ShellSection }) {
  const items = NAVIGATION_ITEMS.filter((item) => ["for-you", "discover", "notifications", "messages", "profile"].includes(item.id));
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">{items.map((item) => <Link key={item.id} href={sectionHref(item.id)} aria-label={item.label} className={cn("grid min-h-16 place-items-center text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", active === item.id && "text-primary")}><span className="flex flex-col items-center gap-1"><AnimatedNavIcon section={item.id} className="size-5" /><span className="text-[10px]">{item.label}</span></span></Link>)}</nav>;
}

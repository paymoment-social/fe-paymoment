"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useComposer } from "@/modules/feed";
import { NAVIGATION_ITEMS } from "../constants";
import type { ShellSection } from "../types";
import { sectionHref } from "../utils/sectionHref";
import { ProductLogo } from "./ProductLogo";
import { AnimatedNavIcon } from "./AnimatedNavIcon";

export function Sidebar({ active }: { active: ShellSection }) {
  const { setOpen } = useComposer();
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-border/70 pr-5 pt-7 lg:flex lg:flex-col">
      <Link href="/" className="mb-6 w-fit rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="PayMoment home"><ProductLogo /></Link>
      <nav aria-label="Primary" className="space-y-1.5">
        {NAVIGATION_ITEMS.map((item) => <Link key={item.id} href={sectionHref(item.id)} className={cn("flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-base transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active === item.id ? "bg-gradient-to-r from-primary/20 to-primary/10 font-medium text-foreground ring-1 ring-primary/5" : "text-foreground/90 hover:bg-secondary/60 hover:text-foreground")}><AnimatedNavIcon section={item.id} className="size-6" /><span>{item.label}</span>{item.id === "notifications" && <span className="ml-auto size-2 rounded-full bg-primary" aria-label="Unread notifications" />}</Link>)}
      </nav>
      <section className="relative mt-7 overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-primary/20 via-card to-violet-950/55 p-6 before:pointer-events-none before:absolute before:-right-14 before:-top-16 before:size-40 before:rounded-full before:bg-primary/15 before:blur-3xl"><h2 className="relative text-lg font-semibold leading-6">Share your PayBox moment. Get rewarded.</h2><p className="relative mt-4 text-sm leading-6 text-muted-foreground">Every post you share can earn you Box and unlock exclusive rewards.</p><Button className="relative mt-5 h-12 w-full bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-[0_0_2rem_color-mix(in_oklab,var(--primary)_18%,transparent)] hover:opacity-90" onClick={() => setOpen(true)}><Icon icon="solar:add-circle-linear" className="size-5" aria-hidden="true" />Create post</Button></section>
      <footer className="mt-auto pb-7 pl-1 text-xs text-muted-foreground"><p>&copy; 2026 PayMoment</p><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2"><a href="#terms" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Terms</a><a href="#privacy" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Privacy</a><a href="#help" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Help</a></div></footer>
    </aside>
  );
}

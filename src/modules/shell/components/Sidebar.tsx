"use client";

import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { News01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AuthorAvatar, CURRENT_USER, useComposer } from "@/modules/feed";
import { NAVIGATION_ITEMS } from "../constants";
import type { ShellSection } from "../types";
import { sectionHref } from "../utils/sectionHref";
import { ProductLogo } from "./ProductLogo";
import { AnimatedNavIcon } from "./AnimatedNavIcon";

export function Sidebar({ active }: { active: ShellSection }) {
  const { setOpen } = useComposer();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = () => {
    setLogoutOpen(false);
    toast.success("You have been logged out");
  };

  return (
    <aside className="sticky top-0 hidden h-screen border-r border-border/70 pr-5 pt-7 lg:flex lg:flex-col">
      <Link href="/" className="mb-6 w-fit rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="PayMoment home"><ProductLogo /></Link>
      <nav aria-label="Primary" className="space-y-1.5">
        {NAVIGATION_ITEMS.map((item) => <Link key={item.id} href={sectionHref(item.id)} className={cn("flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-base transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active === item.id ? "bg-gradient-to-r from-primary/20 to-primary/10 font-medium text-foreground ring-1 ring-primary/5" : "text-foreground/90 hover:bg-secondary/60 hover:text-foreground")}><AnimatedNavIcon section={item.id} className="size-6" /><span>{item.label}</span>{item.id === "notifications" && <span className="ml-auto size-2 rounded-full bg-primary" aria-label="Unread notifications" />}</Link>)}
        {CURRENT_USER.verified && <Link href="/article/new" className="flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-base text-foreground/90 transition-colors duration-100 hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><HugeiconsIcon icon={News01Icon} size={24} strokeWidth={1.8} aria-hidden="true" /><span>Article</span><span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Pro</span></Link>}
      </nav>
      <section className="relative mt-5 overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-primary/20 via-card to-violet-950/55 p-5 before:pointer-events-none before:absolute before:-right-14 before:-top-16 before:size-36 before:rounded-full before:bg-primary/15 before:blur-3xl"><h2 className="relative text-base font-semibold leading-5">Share your PayBox moment. Get rewarded.</h2><p className="relative mt-3 text-xs leading-5 text-muted-foreground">Every post you share can earn you Box and unlock exclusive rewards.</p><Button className="relative mt-4 h-10 w-full bg-gradient-to-r from-primary to-violet-600 text-sm text-primary-foreground shadow-[0_0_2rem_color-mix(in_oklab,var(--primary)_18%,transparent)] hover:opacity-90" onClick={() => setOpen(true)}><Icon icon="solar:add-circle-linear" className="size-4" aria-hidden="true" />Create post</Button></section>
      <footer className="mt-auto space-y-3 pb-5 pl-1 text-xs text-muted-foreground">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-14 w-full justify-start gap-3 rounded-xl px-2 text-left hover:bg-secondary/70" aria-label="Open account menu" />}>
            <AuthorAvatar author={CURRENT_USER} className="size-10" />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{CURRENT_USER.name}</span><span className="block truncate text-xs text-muted-foreground">@{CURRENT_USER.handle}</span></span>
            <Icon icon="solar:menu-dots-bold" className="size-5 shrink-0" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-60 p-1.5">
            <DropdownMenuItem className="min-h-10 px-3"><Icon icon="solar:pallete-2-linear" aria-hidden="true" />Appearance<Icon icon="solar:alt-arrow-right-linear" className="ml-auto size-4" aria-hidden="true" /></DropdownMenuItem>
            <DropdownMenuItem className="min-h-10 px-3"><Icon icon="solar:settings-linear" aria-hidden="true" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="min-h-10 px-3"><Icon icon="solar:heart-linear" aria-hidden="true" />Liked</DropdownMenuItem>
            <DropdownMenuItem className="min-h-10 px-3"><Icon icon="solar:archive-linear" aria-hidden="true" />Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="min-h-10 px-3"><Icon icon="solar:flag-linear" aria-hidden="true" />Report a problem</DropdownMenuItem>
            <DropdownMenuItem className="min-h-10 px-3 text-destructive focus:text-destructive" onClick={() => setLogoutOpen(true)}><Icon icon="solar:logout-2-linear" aria-hidden="true" />Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log out of PayMoment?</DialogTitle>
              <DialogDescription>You can sign back in anytime to continue sharing your Moments.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLogoutOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmLogout}>Log out</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex items-center justify-between gap-3 px-2"><span>&copy; 2026 PayMoment</span><div className="flex gap-3"><a href="#terms" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Terms</a><a href="#privacy" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Privacy</a></div></div>
      </footer>
    </aside>
  );
}

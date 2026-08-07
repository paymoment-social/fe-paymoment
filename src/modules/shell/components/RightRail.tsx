"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { TRENDING_TOPICS } from "@/modules/discover/constants";
import { useBoxStore } from "@/modules/rewards/store/useBoxStore";
import { BoxIcon } from "./ProductLogo";

export function RightRail() {
  const balance = useBoxStore((state) => state.balance);
  return (
    <aside className="sticky top-0 hidden h-screen overflow-y-auto py-6 xl:block">
      <section className="rounded-xl border border-border/80 bg-card/25 p-4">
        <div className="flex items-center justify-between px-1"><h2 className="font-semibold">Your Box</h2><Link href="/rewards" className="rounded-sm text-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View all</Link></div>
        <div className="relative mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-violet-950/95 via-[#151328] to-card p-4 before:pointer-events-none before:absolute before:left-6 before:top-0 before:h-28 before:w-40 before:bg-[repeating-conic-gradient(from_210deg_at_50%_100%,color-mix(in_oklab,var(--primary)_24%,transparent)_0deg,transparent_7deg,transparent_18deg)] before:blur-sm">
          <div className="relative flex min-h-40 items-center gap-7"><div className="relative grid size-32 shrink-0 place-items-center [perspective:30rem]"><div className="absolute inset-4 rotate-6 rounded-xl border border-primary/35 bg-gradient-to-br from-zinc-600 via-zinc-950 to-violet-950 shadow-[0_1.2rem_2rem_-0.5rem_color-mix(in_oklab,var(--primary)_50%,transparent)] [transform:rotateX(10deg)_rotateY(-12deg)]" /><BoxIcon className="relative size-12 text-white" /></div><div className="min-w-0"><p className="text-sm text-muted-foreground">Total Box</p><p className="mt-1 font-mono text-4xl font-medium tabular-nums">{new Intl.NumberFormat("en-US").format(balance)}</p><p className="mt-2 text-sm text-primary">PayMoment rewards</p></div></div>
          <Link href="/rewards" className="relative mt-3 flex min-h-12 items-center gap-3 rounded-lg bg-white/5 px-4 text-sm font-medium ring-1 ring-white/5 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon icon="solar:gift-linear" className="size-5" aria-hidden="true" />Explore rewards<Icon icon="solar:alt-arrow-right-linear" className="ml-auto size-5" aria-hidden="true" /></Link>
        </div>
      </section>
      <section className="mt-5 rounded-xl border border-border/80 bg-card/25 p-5"><h2 className="font-semibold">Trending topics</h2><div className="mt-4 space-y-1.5">{TRENDING_TOPICS.map((topic) => <Link key={topic.label} href={`/discover?q=${encodeURIComponent(topic.label)}`} className="flex min-h-11 items-center justify-between rounded-lg text-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>{topic.label}</span><span className="text-sm text-muted-foreground">{topic.posts} posts</span></Link>)}</div><Link href="/discover" className="mt-4 block rounded-sm text-center text-sm text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View more</Link></section>
    </aside>
  );
}

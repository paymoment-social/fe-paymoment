"use client";

import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VERIFIED_BOX_THRESHOLD } from "../constants";
import { useRewardsContext } from "../context/RewardsContext";
import { useRewards } from "../hooks/useRewards";
import { useBoxStore } from "../store/useBoxStore";
import { formatBox } from "../utils/formatBox";
import { LeaderboardCard } from "./LeaderboardCard";

export function RewardsView() {
  const rewards = useRewards();
  const { claimedIds, claim } = useRewardsContext();
  const reduceMotion = useReducedMotion();
  const balance = useBoxStore((state) => state.balance);
  const resetDemo = useBoxStore((state) => state.resetDemo);
  const verified = balance >= VERIFIED_BOX_THRESHOLD;

  if (rewards.isError) {
    return (
      <section className="rounded-xl border p-5">
        <p>Couldn&apos;t load rewards.</p>
        <Button variant="outline" className="mt-3 h-10" onClick={() => void rewards.refetch()}>
          Try again
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/20 via-card to-card p-6">
        <div className="flex items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">Your Box balance</p>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  <Icon icon="solar:verified-check-bold" className="size-4" aria-hidden="true" /> Verified
                </span>
              )}
            </div>
            <p className="mt-2 font-mono text-4xl font-medium tabular-nums">{formatBox(balance)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Earned from your PayMoment activity.</p>
            <Button variant="ghost" className="mt-3 h-10 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground" onClick={() => {
              resetDemo();
              toast.success("Local Box demo reset", { description: "Claim a 10 Box Moment to test Verified again." });
            }}>
              <Icon icon="solar:restart-linear" className="size-4" aria-hidden="true" /> Reset local demo
            </Button>
          </div>
          <div className="grid size-28 place-items-center rounded-2xl border border-primary/30 bg-background/70 shadow-[0_20px_50px_-20px_color-mix(in_oklab,var(--primary)_55%,transparent)]">
            <Icon icon="solar:box-bold-duotone" className="size-16 text-primary" aria-hidden="true" />
          </div>
        </div>
      </section>

      <LeaderboardCard />

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Explore rewards</h2>
          <p className="text-sm text-muted-foreground">Turn community participation into useful benefits.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {rewards.data?.catalog.map((reward) => {
            const isVerification = reward.id === "verified";
            const unlocked = isVerification && balance >= VERIFIED_BOX_THRESHOLD;
            const claimed = claimedIds.includes(reward.id);
            const canClaim = !isVerification && reward.available && reward.cost <= balance && !claimed;
            const remaining = Math.max(VERIFIED_BOX_THRESHOLD - balance, 0);

            return (
              <motion.article
                key={reward.id}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{ duration: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
                className="relative overflow-hidden rounded-xl border bg-card/55 p-5"
              >
                {isVerification && <div className="pointer-events-none absolute right-0 top-0 size-28 rounded-full bg-primary/15 blur-3xl" />}
                <div className="relative grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon icon={reward.icon} className="size-6" aria-hidden="true" />
                </div>
                <h3 className="relative mt-5 flex items-center gap-2 font-semibold">
                  {reward.title}
                  {unlocked && <Icon icon="solar:verified-check-bold" className="size-5 text-primary" aria-label="Verified" />}
                </h3>
                <p className="relative mt-1 min-h-10 text-sm leading-5 text-muted-foreground">{reward.description}</p>
                <div className="relative mt-5 flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-primary tabular-nums">
                    {isVerification ? `Unlocks at ${VERIFIED_BOX_THRESHOLD} Box` : `${formatBox(reward.cost)} Box`}
                  </span>
                  {isVerification ? (
                    <Button variant="outline" className="h-10 rounded-full border-primary/25 bg-primary/10 text-primary" disabled>
                      <Icon icon={unlocked ? "solar:verified-check-bold" : "solar:lock-keyhole-linear"} className="size-4" aria-hidden="true" />
                      {unlocked ? "Verified" : `${remaining} Box left`}
                    </Button>
                  ) : (
                    <Button
                      variant={canClaim ? "default" : "outline"}
                      className="h-10"
                      disabled={!canClaim}
                      onClick={() => {
                        claim(reward.id, reward.cost);
                        toast.success(`${reward.title} claimed`);
                      }}
                    >
                      {claimed ? "Claimed" : reward.available ? "Claim" : "Coming soon"}
                    </Button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

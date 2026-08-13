"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { useVerifiedAchievementSeen } from "@/modules/profile/hooks/useVerifiedAchievementSeen";
import { VERIFIED_BOX_THRESHOLD } from "../constants";

const BENEFITS = [
  { icon: "solar:verified-check-bold", label: "Verified mark" },
  { icon: "solar:shield-check-bold", label: "Trusted identity" },
  { icon: "solar:stars-bold", label: "Higher visibility" },
] as const;

export function VerifiedUnlockDialog() {
  const reduceMotion = useReducedMotion();
  const profile = useProfile();
  const markSeen = useVerifiedAchievementSeen();
  const eligible = Boolean(profile.data?.verified);
  const alreadySeen = Boolean(profile.data?.verifiedAchievementSeenAt);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (eligible && !alreadySeen) {
      const frame = window.requestAnimationFrame(() => setOpen(true));
      return () => window.cancelAnimationFrame(frame);
    }
  }, [alreadySeen, eligible]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && eligible && !alreadySeen) {
      if (!markSeen.isPending) markSeen.mutate(undefined, { onSuccess: () => setOpen(false) });
      return;
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-primary/30 bg-popover p-0 shadow-[0_2rem_6rem_-2rem_color-mix(in_oklab,var(--primary)_55%,transparent)] sm:max-w-md">
        <div className="relative isolate overflow-hidden px-6 pb-5 pt-8 text-center sm:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />

          <motion.div
            initial={reduceMotion ? false : { scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
            className="relative mx-auto grid size-24 place-items-center rounded-full border border-primary/35 bg-background/80 text-primary shadow-[0_0_3rem_color-mix(in_oklab,var(--primary)_35%,transparent)]"
          >
            <div className="absolute inset-2 rounded-full border border-primary/20" />
            <Icon icon="solar:verified-check-bold" className="relative size-12" aria-hidden="true" />
          </motion.div>

          <p className="mx-auto mt-5 w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Identity unlocked
          </p>
          <DialogTitle className="mt-4 text-3xl font-semibold tracking-[-0.04em]">You&apos;re Verified</DialogTitle>
          <DialogDescription className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            You reached {VERIFIED_BOX_THRESHOLD} Box. Your verified mark is now active everywhere on PayMoment.
          </DialogDescription>

          <div className="mt-6 grid grid-cols-3 gap-2" aria-label="Verified benefits">
            {BENEFITS.map((benefit) => (
              <div key={benefit.label} className="rounded-xl border border-border/80 bg-background/55 px-2 py-3">
                <Icon icon={benefit.icon} className="mx-auto size-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-xs font-medium leading-4">{benefit.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/80 bg-background/35 p-4">
          {markSeen.isError && <p role="alert" className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-left text-sm text-destructive">Could not save this achievement. Try again.</p>}
          <DialogClose render={<Button className="h-12 w-full rounded-full bg-gradient-to-r from-primary to-violet-600 font-semibold text-primary-foreground hover:opacity-90" disabled={markSeen.isPending} aria-busy={markSeen.isPending} />}>
            {markSeen.isPending ? "Saving..." : "Continue as Verified"}
            <Icon icon="solar:arrow-right-linear" className="size-5" aria-hidden="true" />
          </DialogClose>
          <p className="mt-3 text-center text-xs text-muted-foreground">The verified mark is permanent and costs no Box.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

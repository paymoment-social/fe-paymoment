"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function InitialSplash() {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), 800);
    const removeTimer = window.setTimeout(() => setIsVisible(false), 1_050);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-300 motion-reduce:transition-none ${isExiting ? "opacity-0" : "opacity-100"}`}
      role="status"
      aria-label="Loading PayMoment"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid size-24 place-items-center">
          <span className="absolute inset-2 rounded-[1.75rem] bg-primary/20 blur-xl" aria-hidden="true" />
          <Image
            src="/payboxlogo.png"
            alt=""
            width={96}
            height={96}
            priority
            className="relative size-24 object-contain drop-shadow-[0_0_1.5rem_color-mix(in_oklab,var(--primary)_45%,transparent)]"
          />
        </div>
        <p className="text-lg font-semibold tracking-[-0.03em] text-foreground">PayMoment</p>
      </div>
    </div>
  );
}

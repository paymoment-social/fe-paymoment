"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/modules/auth/components/AuthGate";
import { Composer, ComposerProvider } from "@/modules/feed";
import { VerifiedUnlockDialog } from "@/modules/rewards";
import { ShellProvider } from "../context/ShellContext";
import { MobileNavigation } from "./MobileNavigation";
import { RightRail } from "./RightRail";
import { Sidebar } from "./Sidebar";

export function MomentShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate><ShellProvider>
      <ComposerProvider>
        <div className="mx-auto grid min-h-screen w-full max-w-[105rem] grid-cols-1 justify-center gap-5 px-4 pb-24 sm:px-6 lg:grid-cols-[18rem_minmax(0,48rem)] lg:gap-8 lg:pb-0 xl:grid-cols-[16rem_minmax(0,48rem)_20rem] xl:gap-5 min-[1600px]:grid-cols-[20.5rem_minmax(0,48rem)_25.5rem] min-[1600px]:gap-8">
          <Sidebar active="for-you" />
          <div className="min-w-0">{children}</div>
          <RightRail />
        </div>
        <MobileNavigation active="for-you" />
        <Composer />
        <VerifiedUnlockDialog />
      </ComposerProvider>
    </ShellProvider></AuthGate>
  );
}

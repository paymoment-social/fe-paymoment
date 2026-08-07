"use client";

import { createContext, use, type ReactNode } from "react";
import { useBoxStore } from "../store/useBoxStore";

type Value = { claimedIds: string[]; claim: (id: string, cost: number) => void };
const RewardsContext = createContext<Value | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const claimedIds = useBoxStore((state) => state.claimedRewardIds);
  const redeemReward = useBoxStore((state) => state.redeemReward);
  return <RewardsContext value={{ claimedIds, claim: redeemReward }}>{children}</RewardsContext>;
}

export function useRewardsContext() {
  const value = use(RewardsContext);
  if (!value) throw new Error("RewardsProvider is missing");
  return value;
}

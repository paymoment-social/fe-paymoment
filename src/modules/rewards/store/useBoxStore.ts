"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const INITIAL_BOX_BALANCE = 1_250;

type BoxState = {
  balance: number;
  claimedMomentIds: string[];
  claimedRewardIds: string[];
  claimMoment: (momentId: string, amount: number) => void;
  redeemReward: (rewardId: string, cost: number) => void;
  resetDemo: () => void;
};

export const useBoxStore = create<BoxState>()(
  persist(
    (set) => ({
      balance: INITIAL_BOX_BALANCE,
      claimedMomentIds: [],
      claimedRewardIds: [],
      claimMoment: (momentId, amount) =>
        set((state) => {
          if (state.claimedMomentIds.includes(momentId) || amount <= 0) return state;
          return {
            balance: state.balance + amount,
            claimedMomentIds: [...state.claimedMomentIds, momentId],
          };
        }),
      redeemReward: (rewardId, cost) =>
        set((state) => {
          if (state.claimedRewardIds.includes(rewardId) || cost > state.balance) return state;
          return {
            balance: state.balance - cost,
            claimedRewardIds: [...state.claimedRewardIds, rewardId],
          };
        }),
      resetDemo: () => set({ balance: 0, claimedMomentIds: [], claimedRewardIds: [] }),
    }),
    { name: "paymoment-box-balance", version: 1 },
  ),
);

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileData } from "../types";

type ProfileState = {
  profileOverride?: ProfileData;
  saveProfile: (profile: ProfileData) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profileOverride: undefined,
      saveProfile: (profile) => set({ profileOverride: profile }),
    }),
    { name: "paymoment-profile", version: 1 },
  ),
);

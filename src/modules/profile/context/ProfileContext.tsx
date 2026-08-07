"use client";

import { createContext, use, type ReactNode } from "react";
import { useProfileStore } from "../store/useProfileStore";
import type { ProfileData } from "../types";

type Value = { profileOverride?: ProfileData; saveProfile: (profile: ProfileData) => void };
const ProfileContext = createContext<Value | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const profileOverride = useProfileStore((state) => state.profileOverride);
  const saveProfile = useProfileStore((state) => state.saveProfile);
  return <ProfileContext value={{ profileOverride, saveProfile }}>{children}</ProfileContext>;
}

export function useProfileContext() {
  const value = use(ProfileContext);
  if (!value) throw new Error("ProfileProvider is missing");
  return value;
}

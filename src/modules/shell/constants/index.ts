import type { NavigationItem, ShellSection } from "../types";
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "for-you", label: "For you", icon: "solar:home-2-linear" },
  { id: "discover", label: "Discover", icon: "solar:magnifer-linear" },
  { id: "notifications", label: "Notifications", icon: "solar:bell-linear" },
  { id: "messages", label: "Messages", icon: "solar:letter-linear" },
  { id: "profile", label: "Profile", icon: "solar:user-circle-linear" },
  { id: "bookmarks", label: "Saved", icon: "solar:bookmark-linear" },
];
export const SECTION_TITLES: Record<ShellSection, string> = { "for-you": "For you", discover: "Discover", notifications: "Notifications", messages: "Messages", rewards: "Rewards", profile: "Profile", bookmarks: "Saved", likes: "Likes", moderation: "Moderation", connections: "Agent connections" };
export const SHELL_SECTIONS: ShellSection[] = [...NAVIGATION_ITEMS.map((item) => item.id), "rewards", "likes", "moderation"];

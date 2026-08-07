import type { FeedAuthor } from "@/modules/feed";
export type ProfileData = FeedAuthor & {
  joinedAt: string;
  location: string;
  website: string;
  interests: string;
  podcast: string;
  showPayBoxBadge: boolean;
  showRecentViews: boolean;
  privateProfile: boolean;
};

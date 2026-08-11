import type { FeedAuthor, FeedPost } from "@/modules/feed";
export type ProfileData = FeedAuthor & {
  joinedAt: string;
  location: string;
  website: string;
  interests: string;
  podcast: string;
  showPayBoxBadge: boolean;
  showRecentViews: boolean;
  privateProfile: boolean;
  allowMessages: boolean;
  birthDate: string | null;
  interestSlugs: string[];
};

export type ApiUserProfile = {
  id: string;
  email?: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string;
  birth_date?: string | null;
  location: string | null;
  website_url: string | null;
  podcast_url: string | null;
  interests: Array<{ slug: string; label: string }>;
  followers_count: number;
  following_count: number;
  onboarding_completed: boolean;
  joined_at: string;
  privacy: { show_paybox_badge: boolean; show_recent_views: boolean; private_profile: boolean; allow_messages: boolean };
  entitlement: { verified: boolean; verified_at: string | null; points_balance: number; verified_threshold: number };
  relationship?: "none" | "pending" | "following" | "blocked" | "muted";
};
export type ProfilePostsPage = { posts: FeedPost[]; nextCursor: string | null };

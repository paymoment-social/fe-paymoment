import { ApiError, apiRequest, mutationHeaders } from "@/lib/api/client";
import { getDiscoverData } from "@/modules/discover/services/discover.service";
import { mapApiPost } from "@/modules/feed/services/feed.service";
import type { ApiUserProfile, ProfileData, ProfilePostsPage } from "../types";
import { normalizeWebsiteUrl } from "../utils/normalizeWebsiteUrl";

type ProfileResponse = { data: { user: ApiUserProfile }; meta: { request_id: string } };

export function mapProfile(user: ApiUserProfile): ProfileData {
  return {
    id: user.id,
    name: user.display_name,
    handle: user.username ?? "",
    avatar: user.avatar_url ?? "",
    coverUrl: user.cover_url ?? "",
    coverPosition: user.cover_position ?? "center",
    verified: user.entitlement.verified,
    bio: user.bio,
    followers: user.followers_count,
    following: user.following_count,
    box: user.entitlement.points_balance,
    relationship: user.relationship,
    joinedAt: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(user.joined_at)),
    location: user.location ?? "",
    website: normalizeWebsiteUrl(user.website_url) ?? "",
    interests: user.interests.map((interest) => interest.label).join(", "),
    interestSlugs: user.interests.map((interest) => interest.slug),
    podcast: user.podcast_url ?? "",
    showPayBoxBadge: user.privacy.show_paybox_badge,
    showRecentViews: user.privacy.show_recent_views,
    privateProfile: user.privacy.private_profile,
    allowMessages: user.privacy.allow_messages,
    birthDate: user.birth_date ?? null,
  };
}

export async function getProfile(): Promise<ProfileData> {
  const response = await apiRequest<ProfileResponse>("/api/v1/users/me");
  return mapProfile(response.data.user);
}

export async function getPublicProfile(username: string): Promise<ProfileData> {
  const response = await apiRequest<ProfileResponse>(`/api/v1/users/${encodeURIComponent(username)}`);
  return mapProfile(response.data.user);
}

export async function getPublicProfilePosts(username: string, cursor?: string): Promise<ProfilePostsPage> {
  try {
    const query = new URLSearchParams({ limit: "20" });
    if (cursor) query.set("cursor", cursor);
    const response = await apiRequest<{ data: Parameters<typeof mapApiPost>[0][]; meta: { next_cursor: string | null } }>(`/api/v1/users/${encodeURIComponent(username)}/posts?${query}`);
    return { posts: (response.data ?? []).map(mapApiPost), nextCursor: response.meta.next_cursor };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
    // Backward-compatible fallback while an older production API release does
    // not yet expose the dedicated profile-posts endpoint.
    const discovery = await getDiscoverData(username, "all", cursor);
    const normalizedHandle = username.trim().toLowerCase();
    const posts = [...discovery.moments, ...discovery.articles]
      .filter((post) => post.author.handle.toLowerCase() === normalizedHandle)
      .filter((post, index, values) => values.findIndex((candidate) => candidate.id === post.id) === index);
    return { posts, nextCursor: discovery.nextCursor };
  }
}

export async function updateProfile(profile: ProfileData): Promise<ProfileData> {
  const response = await apiRequest<ProfileResponse>("/api/v1/users/me", {
    method: "PATCH",
    headers: mutationHeaders(),
    body: JSON.stringify({
      display_name: profile.name,
      username: profile.handle,
      bio: profile.bio ?? "",
      birth_date: profile.birthDate,
      location: profile.location || null,
      website_url: profile.website || null,
      podcast_url: profile.podcast || null,
      ...(profile.avatar.startsWith("http://") || profile.avatar.startsWith("https://") ? { avatar_url: profile.avatar } : {}),
      ...(profile.coverUrl.startsWith("http://") || profile.coverUrl.startsWith("https://") ? { cover_url: profile.coverUrl } : {}),
      cover_position: profile.coverPosition,
      interest_slugs: profile.interestSlugs,
      show_paybox_badge: profile.showPayBoxBadge,
      show_recent_views: profile.showRecentViews,
      private_profile: profile.privateProfile,
      allow_messages: profile.allowMessages,
    }),
  });
  return mapProfile(response.data.user);
}

import { apiRequest, mutationHeaders } from "@/lib/api/client";
import type { FeedAuthor, FeedPost, FeedReply } from "../types";

type ApiProfile = {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string;
  followers_count: number;
  following_count: number;
  entitlement: { verified: boolean; points_balance: number };
  relationship: "none" | "pending" | "following" | "blocked" | "muted";
};

type ApiMedia = { id: string; url: string | null; mime_type: string; alt_text: string | null; position?: number };
type ApiPost = {
  id: string;
  kind: "moment" | "quote" | "article" | "poll";
  body: string;
  version: number;
  author: ApiProfile;
  media?: ApiMedia[] | null;
  counts: { likes: number; replies: number; reposts: number; bookmarks: number; views: number };
  viewer?: { liked?: boolean; bookmarked?: boolean; reposted?: boolean; reward_claimed?: boolean } | null;
  article: null | { title: string; eyebrow: string | null; description: string; content_html: string; banner_media_id: string | null; banner_color: string; banner_position: "left" | "center" | "right"; draft_version: number; status: "draft" | "published" };
  poll: null | { question: string; status: "open" | "closed"; voter_visibility: "public" | "anonymous"; allow_vote_change: boolean; total_votes: number; ends_at: string | null; viewer_option_id: string | null; options?: Array<{ id: string; label: string; position: number; vote_count: number }> | null };
  quoted_post: ApiPost | null;
  created_at: string;
  published_at?: string | null;
  is_owner: boolean;
};

type ApiReply = {
  id: string;
  post_id: string;
  parent_id: string | null;
  body: string;
  author: ApiProfile;
  media?: ApiMedia[] | null;
  like_count: number;
  viewer_liked: boolean;
  is_owner: boolean;
  created_at: string;
};

type PageResponse<T> = { data: T[]; meta: { next_cursor: string | null; has_more: boolean } };
type DataResponse<T> = { data: T };

function isApiProfile(value: unknown): value is ApiProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<ApiProfile>;
  return typeof profile.id === "string"
    && typeof profile.display_name === "string"
    && Boolean(profile.entitlement && typeof profile.entitlement.verified === "boolean" && typeof profile.entitlement.points_balance === "number");
}

function isApiReply(value: unknown): value is ApiReply {
  if (!value || typeof value !== "object") return false;
  const reply = value as Partial<ApiReply>;
  return typeof reply.id === "string"
    && typeof reply.post_id === "string"
    && typeof reply.body === "string"
    && typeof reply.created_at === "string"
    && isApiProfile(reply.author);
}

function relativeTime(value: string) {
  const milliseconds = Date.now() - new Date(value).getTime();
  if (milliseconds < 60_000) return "now";
  if (milliseconds < 3_600_000) return `${Math.floor(milliseconds / 60_000)}m`;
  if (milliseconds < 86_400_000) return `${Math.floor(milliseconds / 3_600_000)}h`;
  return `${Math.floor(milliseconds / 86_400_000)}d`;
}

export function mapAuthor(profile: ApiProfile): FeedAuthor {
  return {
    id: profile.id,
    name: profile.display_name,
    handle: profile.username ?? "paymoment.user",
    avatar: profile.avatar_url ?? "",
    verified: profile.entitlement.verified,
    bio: profile.bio,
    followers: profile.followers_count,
    following: profile.following_count,
    box: profile.entitlement.points_balance,
    relationship: profile.relationship,
  };
}

export function mapApiPost(post: ApiPost): FeedPost {
  const media = post.media ?? [];
  const viewer = post.viewer ?? {};
  const pollOptions = post.poll?.options ?? [];
  const banner = post.article?.banner_media_id ? media.find((item) => item.id === post.article?.banner_media_id) : undefined;
  return {
    id: post.id,
    author: mapAuthor(post.author),
    body: post.body,
    createdAt: relativeTime(post.created_at),
    createdAtValue: post.published_at ?? post.created_at,
    likes: post.counts.likes,
    replies: post.counts.replies,
    reposts: post.counts.reposts,
    views: post.counts.views,
    reward: 0,
    version: post.version,
    liked: Boolean(viewer.liked),
    bookmarked: Boolean(viewer.bookmarked),
    reposted: Boolean(viewer.reposted),
    rewardClaimed: Boolean(viewer.reward_claimed),
    isOwner: post.is_owner,
    media: media.filter((item) => item.url && item.id !== post.article?.banner_media_id).map((item) => item.url!),
    article: post.article ? {
      eyebrow: post.article.eyebrow ?? "PayMoment article",
      title: post.article.title,
      description: post.article.description,
      contentHtml: post.article.content_html,
      banner: { image: banner?.url ?? undefined, color: post.article.banner_color, position: post.article.banner_position },
      bannerMediaId: post.article.banner_media_id ?? undefined,
      draftVersion: post.article.draft_version,
      status: post.article.status,
    } : undefined,
    poll: post.poll ? {
      question: post.poll.question,
      status: post.poll.status,
      voterVisibility: post.poll.voter_visibility,
      allowVoteChange: post.poll.allow_vote_change,
      totalVotes: post.poll.total_votes,
      viewerOptionId: post.poll.viewer_option_id ?? undefined,
      endsAt: post.poll.ends_at ?? undefined,
      options: pollOptions.map((option) => ({ id: option.id, label: option.label, voteCount: option.vote_count, voterIds: [] })),
    } : undefined,
    quotedPost: post.quoted_post ? mapApiPost(post.quoted_post) : undefined,
  };
}

function mapApiReply(reply: ApiReply): FeedReply {
  const media = reply.media ?? [];
  return { id: reply.id, postId: reply.post_id, parentId: reply.parent_id ?? undefined, author: mapAuthor(reply.author), body: reply.body, createdAt: relativeTime(reply.created_at), likes: reply.like_count, media: media[0]?.url ?? undefined, liked: Boolean(reply.viewer_liked), isOwner: Boolean(reply.is_owner) };
}

export async function getFeedPosts(cursor?: string, mode: "latest" | "top" | "for_you" = "latest", limit = 20): Promise<{ posts: FeedPost[]; nextCursor: string | null }> {
  const query = new URLSearchParams({ limit: String(limit), mode });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest<PageResponse<ApiPost>>(`/api/v1/feed?${query}`);
  return { posts: (response.data ?? []).map(mapApiPost), nextCursor: response.meta.next_cursor };
}

export async function getNewFeedPostCount(since: string) {
  const query = new URLSearchParams({ since });
  const response = await apiRequest<DataResponse<{ count: number }>>(`/api/v1/feed/updates?${query}`);
  return response.data.count;
}

export async function getPost(postId: string) {
  const response = await apiRequest<DataResponse<{ post: ApiPost }>>(`/api/v1/posts/${postId}`);
  return mapApiPost(response.data.post);
}

export async function uploadFeedMedia(file: File, purpose: "post" | "reply" | "article" | "message") {
  const body = new FormData();
  body.set("file", file);
  body.set("purpose", purpose);
  const response = await apiRequest<DataResponse<{ media: { id: string; gatewayUrl: string } }>>("/api/v1/media/upload", { method: "POST", body });
  return response.data.media;
}

export async function createPost(input: { body: string; mediaAssetIds?: string[]; quotedPostId?: string; poll?: { question: string; options: string[]; voterVisibility?: "public" | "anonymous"; allowVoteChange?: boolean; endsAt?: string } }) {
  const kind = input.poll ? "poll" : input.quotedPostId ? "quote" : "moment";
  const response = await apiRequest<DataResponse<{ post: ApiPost }>>("/api/v1/posts", {
    method: "POST",
    headers: mutationHeaders(),
    body: JSON.stringify({ kind, body: input.body, visibility: "public", quoted_post_id: input.quotedPostId, media_asset_ids: input.mediaAssetIds ?? [], poll: input.poll ? { question: input.poll.question, options: input.poll.options, voter_visibility: input.poll.voterVisibility ?? "public", allow_vote_change: input.poll.allowVoteChange ?? true, ends_at: input.poll.endsAt } : undefined }),
  });
  return mapApiPost(response.data.post);
}

export async function updatePost(postId: string, version: number, body: string) {
  const response = await apiRequest<DataResponse<{ post: ApiPost }>>(`/api/v1/posts/${postId}`, { method: "PATCH", headers: { ...mutationHeaders(), "If-Match": String(version) }, body: JSON.stringify({ body }) });
  return mapApiPost(response.data.post);
}

export const deletePost = (postId: string) => apiRequest<DataResponse<{ id: string; deleted: true }>>(`/api/v1/posts/${postId}`, { method: "DELETE", headers: mutationHeaders() });

export async function setPostReaction(postId: string, type: "like" | "bookmark" | "repost", enabled: boolean) {
  return apiRequest<DataResponse<{ post_id: string; count: number }>>(`/api/v1/posts/${postId}/${type}`, { method: enabled ? "PUT" : "DELETE", headers: mutationHeaders() });
}

export async function getReplies(postId: string, cursor?: string, parentId?: string) {
  const query = new URLSearchParams({ limit: "50" });
  if (cursor) query.set("cursor", cursor);
  if (parentId) query.set("parent_id", parentId);
  const response = await apiRequest<PageResponse<ApiReply>>(`/api/v1/posts/${postId}/replies?${query}`);
  return { replies: (response.data ?? []).filter(isApiReply).map(mapApiReply), nextCursor: response.meta.next_cursor };
}

export async function createReply(postId: string, input: { body: string; parentId?: string; mediaAssetIds?: string[] }) {
  const response = await apiRequest<DataResponse<{ reply: ApiReply }>>(`/api/v1/posts/${postId}/replies`, { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ body: input.body, parent_id: input.parentId, media_asset_ids: input.mediaAssetIds ?? [] }) });
  const reply = response.data?.reply;
  if (!isApiReply(reply)) throw new Error("The server returned an incomplete reply. Refresh the Moment and try again.");
  return mapApiReply(reply);
}

export async function setReplyLike(replyId: string, enabled: boolean) {
  return apiRequest<DataResponse<{ reply_id: string; liked: boolean; count: number }>>(`/api/v1/replies/${replyId}/like`, { method: enabled ? "PUT" : "DELETE", headers: mutationHeaders() });
}

export async function votePoll(postId: string, optionId?: string) {
  const response = await apiRequest<DataResponse<{ total_votes: number; viewer_option_id: string | null; options: Array<{ id: string; vote_count: number }> }>>(`/api/v1/polls/${postId}/vote`, { method: optionId ? "PUT" : "DELETE", headers: mutationHeaders(), ...(optionId ? { body: JSON.stringify({ option_id: optionId }) } : {}) });
  return response.data;
}

export async function getPollVoters(postId: string) {
  const response = await apiRequest<PageResponse<{ option_id: string; user: ApiProfile; voted_at: string }>>(`/api/v1/polls/${postId}/voters?limit=100`);
  return (response.data ?? []).map((voter) => ({ optionId: voter.option_id, user: mapAuthor(voter.user), votedAt: voter.voted_at }));
}

export async function recordPostView(postId: string) {
  const response = await apiRequest<DataResponse<{ recorded: boolean; views: number }>>(`/api/v1/posts/${postId}/view`, { method: "POST", headers: mutationHeaders() });
  return response.data;
}

export async function recordPostShare(postId: string, channel: "copy" | "native") {
  await apiRequest(`/api/v1/posts/${postId}/share`, { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ channel }) });
}

export async function createArticle(input: { title: string; eyebrow?: string; description: string; contentHtml: string; bannerMediaId?: string; bannerColor: string; bannerPosition: "left" | "center" | "right"; publish?: boolean }) {
  const response = await apiRequest<DataResponse<{ post: ApiPost }>>("/api/v1/articles", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ title: input.title, eyebrow: input.eyebrow, description: input.description, content_html: input.contentHtml, banner_media_id: input.bannerMediaId, banner_color: input.bannerColor, banner_position: input.bannerPosition, visibility: "public", publish: input.publish ?? false }) });
  return mapApiPost(response.data.post);
}

export async function getArticle(articleId: string) {
  const response = await apiRequest<DataResponse<{ post: ApiPost }>>(`/api/v1/articles/${articleId}`);
  return mapApiPost(response.data.post);
}

export async function updateArticle(articleId: string, input: { title?: string; eyebrow?: string; description?: string; contentHtml?: string; bannerMediaId?: string; bannerColor?: string; bannerPosition?: "left" | "center" | "right"; draftVersion: number }) {
  const response = await apiRequest<DataResponse<{ post: ApiPost }>>(`/api/v1/articles/${articleId}`, { method: "PATCH", headers: mutationHeaders(), body: JSON.stringify({ title: input.title, eyebrow: input.eyebrow, description: input.description, content_html: input.contentHtml, banner_media_id: input.bannerMediaId, banner_color: input.bannerColor, banner_position: input.bannerPosition, draft_version: input.draftVersion }) });
  return mapApiPost(response.data.post);
}

export async function publishArticle(articleId: string) {
  const response = await apiRequest<DataResponse<{ post: ApiPost }>>(`/api/v1/articles/${articleId}/publish`, { method: "POST", headers: mutationHeaders() });
  return mapApiPost(response.data.post);
}

export async function setUserFollow(userId: string, enabled: boolean) {
  const response = await apiRequest<DataResponse<{ user_id: string; following: boolean; requested: boolean; status: "active" | "pending" | "removed" }>>(`/api/v1/users/${userId}/follow`, { method: enabled ? "PUT" : "DELETE", headers: mutationHeaders() });
  return response.data;
}

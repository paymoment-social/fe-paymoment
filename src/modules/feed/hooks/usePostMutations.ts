"use client";

import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from "@tanstack/react-query";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { DISCOVER_QUERY_KEY, TRENDING_TOPICS_QUERY_KEY } from "@/modules/discover/constants";
import type { DiscoverFilter, DiscoverPage } from "@/modules/discover/types";
import { incrementTrendingTopics } from "@/modules/discover/utils/trendingTopics";
import { NOTIFICATIONS_QUERY_KEY } from "@/modules/notifications/constants";
import type { NotificationPage } from "@/modules/notifications/types";
import type { ProfileData } from "@/modules/profile/types";
import { FEED_QUERY_KEY } from "../constants";
import { createPost, createReply, deletePost, setPostReaction, setReplyLike, setUserFollow, votePoll } from "../services/feed.service";
import type { FeedPost, FeedReply } from "../types";
import { postQueryKey } from "./useFeed";
import { repliesQueryKey } from "./useReplies";

type FeedPage = { posts: FeedPost[]; nextCursor: string | null };
type PostCollectionPage = { posts: FeedPost[]; nextCursor: string | null };
type QuerySnapshot = [QueryKey, unknown];

const POST_COLLECTION_QUERY_KEYS = [
  FEED_QUERY_KEY,
  ["paymoment", "profile", "public"] as const,
  ["paymoment", "bookmarks"] as const,
  ["paymoment", "likes"] as const,
] as const;
const POST_CACHE_QUERY_KEYS = [...POST_COLLECTION_QUERY_KEYS, DISCOVER_QUERY_KEY] as const;

function isFeedInfiniteData(value: unknown): value is InfiniteData<FeedPage> {
  return Boolean(value && typeof value === "object" && "pages" in value && Array.isArray((value as { pages?: unknown }).pages));
}

function isPostCollectionInfiniteData(value: unknown): value is InfiniteData<PostCollectionPage> {
  return Boolean(value && typeof value === "object" && "pages" in value && Array.isArray((value as { pages?: unknown }).pages)
    && (value as { pages: unknown[] }).pages.every((page) => Boolean(page && typeof page === "object" && "posts" in page && Array.isArray((page as { posts?: unknown }).posts))));
}

function isDiscoverInfiniteData(value: unknown): value is InfiniteData<DiscoverPage> {
  return Boolean(value && typeof value === "object" && "pages" in value && Array.isArray((value as { pages?: unknown }).pages)
    && (value as { pages: unknown[] }).pages.every((page) => Boolean(page && typeof page === "object" && "people" in page && "moments" in page && "articles" in page)));
}

function isNotificationInfiniteData(value: unknown): value is InfiniteData<NotificationPage> {
  return Boolean(value && typeof value === "object" && "pages" in value && Array.isArray((value as { pages?: unknown }).pages)
    && (value as { pages: unknown[] }).pages.every((page) => Boolean(page && typeof page === "object" && "notifications" in page)));
}

function updatePostCaches(queryClient: ReturnType<typeof useQueryClient>, postId: string, update: (post: FeedPost) => FeedPost) {
  POST_COLLECTION_QUERY_KEYS.forEach((queryKey) => queryClient.setQueriesData<InfiniteData<PostCollectionPage>>({ queryKey }, (current) => {
    if (!isPostCollectionInfiniteData(current)) return current;
    return { ...current, pages: current.pages.map((page) => ({ ...page, posts: page.posts.map((post) => post.id === postId ? update(post) : post) })) };
  }));
  queryClient.setQueriesData<InfiniteData<DiscoverPage>>({ queryKey: DISCOVER_QUERY_KEY }, (current) => isDiscoverInfiniteData(current) ? {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      moments: page.moments.map((post) => post.id === postId ? update(post) : post),
      articles: page.articles.map((post) => post.id === postId ? update(post) : post),
    })),
  } : current);
  queryClient.setQueryData<FeedPost>(postQueryKey(postId), (current) => current ? update(current) : current);
}

async function snapshotPostCaches(queryClient: ReturnType<typeof useQueryClient>, postId: string) {
  await Promise.all([
    ...POST_CACHE_QUERY_KEYS.map((queryKey) => queryClient.cancelQueries({ queryKey })),
    queryClient.cancelQueries({ queryKey: postQueryKey(postId) }),
  ]);
  return {
    snapshots: POST_CACHE_QUERY_KEYS.flatMap((queryKey) => queryClient.getQueriesData({ queryKey })) as QuerySnapshot[],
    postSnapshot: queryClient.getQueryData<FeedPost>(postQueryKey(postId)),
    postId,
  };
}

function restorePostCaches(queryClient: ReturnType<typeof useQueryClient>, context?: Awaited<ReturnType<typeof snapshotPostCaches>>) {
  context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
  if (context?.postSnapshot) queryClient.setQueryData(postQueryKey(context.postId), context.postSnapshot);
}

function removePostFromCaches(queryClient: ReturnType<typeof useQueryClient>, postId: string) {
  POST_COLLECTION_QUERY_KEYS.forEach((queryKey) => queryClient.setQueriesData<InfiniteData<PostCollectionPage>>({ queryKey }, (current) => {
    if (!isPostCollectionInfiniteData(current)) return current;
    return { ...current, pages: current.pages.map((page) => ({ ...page, posts: page.posts.filter((post) => post.id !== postId) })) };
  }));
  queryClient.setQueriesData<InfiniteData<DiscoverPage>>({ queryKey: DISCOVER_QUERY_KEY }, (current) => isDiscoverInfiniteData(current) ? {
    ...current,
    pages: current.pages.map((page) => ({ ...page, moments: page.moments.filter((post) => post.id !== postId), articles: page.articles.filter((post) => post.id !== postId) })),
  } : current);
}

function extractHashtagSlugs(body: string) {
  return [...new Set([...body.matchAll(/(?:^|\s)#([\p{L}\p{N}_]{1,100})/gu)].map((match) => match[1]!.normalize("NFKC").toLowerCase()))];
}

function postMatchesDiscoverQuery(post: FeedPost, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const searchable = [post.body, post.author.name, post.author.handle, post.article?.title, post.article?.description].filter(Boolean).join(" ").toLowerCase();
  return searchable.includes(normalized) || (normalized.startsWith("@") && post.author.handle.toLowerCase() === normalized.slice(1));
}

function insertCreatedPostCaches(queryClient: ReturnType<typeof useQueryClient>, post: FeedPost) {
  queryClient.setQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY }, (current) => {
    if (!isFeedInfiniteData(current)) return current;
    return { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, posts: [post, ...page.posts.filter((item) => item.id !== post.id)] } : page) };
  });

  queryClient.getQueriesData<InfiniteData<PostCollectionPage>>({ queryKey: ["paymoment", "profile", "public"] }).forEach(([key, current]) => {
    if (!isPostCollectionInfiniteData(current) || key[4] !== "posts" || String(key[3] ?? "").toLowerCase() !== post.author.handle.toLowerCase()) return;
    queryClient.setQueryData<InfiniteData<PostCollectionPage>>(key, { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, posts: [post, ...page.posts.filter((item) => item.id !== post.id)] } : page) });
  });

  queryClient.getQueriesData<InfiniteData<DiscoverPage>>({ queryKey: DISCOVER_QUERY_KEY }).forEach(([key, current]) => {
    if (!isDiscoverInfiniteData(current)) return;
    const filter = key[3] as DiscoverFilter | undefined;
    const isArticle = Boolean(post.article);
    const acceptsPost = filter === "all" || (isArticle ? filter === "articles" : filter === "moments");
    if (!acceptsPost || !postMatchesDiscoverQuery(post, String(key[2] ?? ""))) return;
    queryClient.setQueryData<InfiniteData<DiscoverPage>>(key, {
      ...current,
      pages: current.pages.map((page, index) => index === 0 ? {
        ...page,
        moments: isArticle ? page.moments : [post, ...page.moments.filter((item) => item.id !== post.id)],
        articles: isArticle ? [post, ...page.articles.filter((item) => item.id !== post.id)] : page.articles,
      } : page),
    });
  });

  const hashtags = extractHashtagSlugs(post.body);
  queryClient.setQueryData<DiscoverPage["topics"]>(TRENDING_TOPICS_QUERY_KEY, (current) => current ? incrementTrendingTopics(current, hashtags, 5) : current);
  queryClient.setQueriesData<InfiniteData<DiscoverPage>>({ queryKey: DISCOVER_QUERY_KEY }, (current) => isDiscoverInfiniteData(current) ? {
    ...current,
    pages: current.pages.map((page, index) => index === 0 ? { ...page, topics: incrementTrendingTopics(page.topics, hashtags) } : page),
  } : current);
  queryClient.setQueryData(postQueryKey(post.id), post);
}

function updateAuthorCaches(queryClient: ReturnType<typeof useQueryClient>, userId: string, update: (post: FeedPost) => FeedPost) {
  queryClient.setQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY }, (current) => {
    if (!isFeedInfiniteData(current)) return current;
    return { ...current, pages: current.pages.map((page) => ({ ...page, posts: page.posts.map((post) => post.author.id === userId ? update(post) : post) })) };
  });
  queryClient.setQueriesData<FeedPost>({ queryKey: ["paymoment", "post"] }, (current) => current?.author.id === userId ? update(current) : current);
}

type FollowRelationship = NonNullable<FeedPost["author"]["relationship"]>;

function updateFollowCaches(queryClient: ReturnType<typeof useQueryClient>, userId: string, relationship: FollowRelationship) {
  updateAuthorCaches(queryClient, userId, (post) => ({ ...post, author: { ...post.author, relationship } }));
  queryClient.setQueriesData<InfiniteData<DiscoverPage>>({ queryKey: DISCOVER_QUERY_KEY }, (current) => isDiscoverInfiniteData(current) ? {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      people: page.people.map((person) => person.id === userId ? { ...person, relationship } : person),
      moments: page.moments.map((post) => post.author.id === userId ? { ...post, author: { ...post.author, relationship } } : post),
      articles: page.articles.map((post) => post.author.id === userId ? { ...post, author: { ...post.author, relationship } } : post),
    })),
  } : current);
  queryClient.setQueriesData<InfiniteData<NotificationPage>>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (current) => isNotificationInfiniteData(current) ? {
    ...current,
    pages: current.pages.map((page) => ({ ...page, notifications: page.notifications.map((item) => item.user?.id === userId ? { ...item, user: { ...item.user, relationship } } : item) })),
  } : current);
  queryClient.setQueriesData<ProfileData>({ queryKey: ["paymoment", "profile", "public"] }, (current) => {
    if (!current || current.id !== userId) return current;
    const wasFollowing = current.relationship === "following";
    const isFollowing = relationship === "following";
    return { ...current, relationship, followers: Math.max(0, current.followers + (wasFollowing === isFollowing ? 0 : isFollowing ? 1 : -1)) };
  });
}

export function useCreateMoment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      insertCreatedPostCaches(queryClient, post);
      void queryClient.invalidateQueries({ queryKey: DISCOVER_QUERY_KEY });
    },
  });
}

export function usePostReaction(type: "like" | "bookmark" | "repost") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, enabled }: { postId: string; enabled: boolean }) => setPostReaction(postId, type, enabled),
    onMutate: async ({ postId, enabled }) => {
      const context = await snapshotPostCaches(queryClient, postId);
      updatePostCaches(queryClient, postId, (post) => {
        const activeKey = type === "like" ? "liked" : type === "bookmark" ? "bookmarked" : "reposted";
        const countKey = type === "like" ? "likes" : type === "repost" ? "reposts" : null;
        const wasActive = Boolean(post[activeKey]);
        const count = countKey ? Math.max(0, post[countKey] + (enabled === wasActive ? 0 : enabled ? 1 : -1)) : undefined;
        return { ...post, [activeKey]: enabled, ...(countKey ? { [countKey]: count } : {}) };
      });
      return context;
    },
    onError: (_error, _variables, context) => restorePostCaches(queryClient, context),
    onSuccess: (response, variables) => updatePostCaches(queryClient, variables.postId, (post) => ({ ...post, ...(type === "like" ? { likes: response.data.count } : type === "repost" ? { reposts: response.data.count } : {}) })),
    onSettled: (_data, _error, variables) => Promise.all([
      queryClient.invalidateQueries({ queryKey: postQueryKey(variables.postId) }),
      ...(type === "like" ? [queryClient.invalidateQueries({ queryKey: ["paymoment", "likes"] })] : []),
      ...(type === "bookmark" ? [queryClient.invalidateQueries({ queryKey: ["paymoment", "bookmarks"] })] : []),
    ]),
  });
}

export function useCreateReply(postId: string, parentId?: string) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  return useMutation({
    mutationFn: ({ body, mediaAssetIds }: { body: string; mediaAssetIds?: string[] }) => createReply(postId, { body, parentId, mediaAssetIds }),
    onMutate: async ({ body }) => {
      const key = repliesQueryKey(postId, parentId);
      await queryClient.cancelQueries({ queryKey: key });
      const postCache = await snapshotPostCaches(queryClient, postId);
      const previousReplies = queryClient.getQueryData(key);
      const pendingId = `pending-${crypto.randomUUID()}`;
      const optimistic: FeedReply = { id: pendingId, postId, parentId, author: currentUser, body, createdAt: new Date().toISOString(), likes: 0, isOwner: true };
      queryClient.setQueryData<InfiniteData<{ replies: FeedReply[]; nextCursor: string | null }>>(key, (current) => current ? { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, replies: [...page.replies, optimistic] } : page) } : current);
      updatePostCaches(queryClient, postId, (post) => ({ ...post, replies: post.replies + 1 }));
      return { key, previousReplies, pendingId, ...postCache };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.key, context.previousReplies);
      restorePostCaches(queryClient, context);
    },
    onSuccess: (reply, _variables, context) => {
      queryClient.setQueryData<InfiniteData<{ replies: FeedReply[]; nextCursor: string | null }>>(repliesQueryKey(postId, parentId), (current) => current ? { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, replies: page.replies.map((item) => item.id === context?.pendingId ? reply : item) } : page) } : current);
    },
    onSettled: () => Promise.all([queryClient.invalidateQueries({ queryKey: repliesQueryKey(postId, parentId) }), queryClient.invalidateQueries({ queryKey: postQueryKey(postId) })]),
  });
}

export function useReplyLike(postId: string, parentId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ replyId, enabled }: { replyId: string; enabled: boolean }) => setReplyLike(replyId, enabled),
    onMutate: async ({ replyId, enabled }) => {
      const key = repliesQueryKey(postId, parentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData<InfiniteData<{ replies: FeedReply[]; nextCursor: string | null }>>(key, (current) => current ? { ...current, pages: current.pages.map((page) => ({ ...page, replies: page.replies.map((reply) => reply.id === replyId ? { ...reply, liked: enabled, likes: Math.max(0, reply.likes + (enabled === Boolean(reply.liked) ? 0 : enabled ? 1 : -1)) } : reply) })) } : current);
      return { key, previous };
    },
    onError: (_error, _variables, context) => context && queryClient.setQueryData(context.key, context.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: repliesQueryKey(postId, parentId) }),
  });
}

export function usePollVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, optionId }: { postId: string; optionId?: string }) => votePoll(postId, optionId),
    onMutate: async ({ postId, optionId }) => {
      const context = await snapshotPostCaches(queryClient, postId);
      updatePostCaches(queryClient, postId, (post) => {
        if (!post.poll) return post;
        const previousOptionId = post.poll.viewerOptionId;
        const totalVotes = Math.max(0, post.poll.totalVotes + (previousOptionId ? optionId ? 0 : -1 : optionId ? 1 : 0));
        return {
          ...post,
          poll: {
            ...post.poll,
            totalVotes,
            viewerOptionId: optionId,
            options: post.poll.options.map((option) => ({ ...option, voteCount: Math.max(0, option.voteCount + (option.id === previousOptionId && previousOptionId !== optionId ? -1 : 0) + (option.id === optionId && previousOptionId !== optionId ? 1 : 0)) })),
          },
        };
      });
      return context;
    },
    onError: (_error, _variables, context) => restorePostCaches(queryClient, context),
    onSuccess: (poll, variables) => updatePostCaches(queryClient, variables.postId, (post) => post.poll ? { ...post, poll: { ...post.poll, totalVotes: poll.total_votes, viewerOptionId: poll.viewer_option_id ?? undefined, options: post.poll.options.map((option) => ({ ...option, voteCount: poll.options.find((item) => item.id === option.id)?.vote_count ?? option.voteCount })) } } : post),
    onSettled: (_data, _error, variables) => queryClient.invalidateQueries({ queryKey: postQueryKey(variables.postId) }),
  });
}

export function useUserFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) => setUserFollow(userId, enabled),
    onMutate: async ({ userId, enabled }) => {
      const keys = [FEED_QUERY_KEY, ["paymoment", "post"], DISCOVER_QUERY_KEY, NOTIFICATIONS_QUERY_KEY, ["paymoment", "profile", "public"]] as const;
      await Promise.all(keys.map((queryKey) => queryClient.cancelQueries({ queryKey })));
      const snapshots = keys.flatMap((queryKey) => queryClient.getQueriesData({ queryKey }));
      updateFollowCaches(queryClient, userId, enabled ? "following" : "none");
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: (result) => updateFollowCaches(queryClient, result.user_id, result.status === "active" ? "following" : result.status === "pending" ? "pending" : "none"),
    onSettled: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: DISCOVER_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ["paymoment", "profile", "public"] }),
    ]),
  });
}

export function useDeleteMoment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_result, postId) => {
      removePostFromCaches(queryClient, postId);
      queryClient.removeQueries({ queryKey: postQueryKey(postId) });
    },
  });
}

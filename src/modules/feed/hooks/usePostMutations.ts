"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { DISCOVER_QUERY_KEY } from "@/modules/discover/constants";
import type { DiscoverPage } from "@/modules/discover/types";
import { NOTIFICATIONS_QUERY_KEY } from "@/modules/notifications/constants";
import type { NotificationPage } from "@/modules/notifications/types";
import type { ProfileData } from "@/modules/profile/types";
import { FEED_QUERY_KEY } from "../constants";
import { createPost, createReply, deletePost, setPostReaction, setReplyLike, setUserFollow, votePoll } from "../services/feed.service";
import type { FeedPost, FeedReply } from "../types";
import { postQueryKey } from "./useFeed";
import { repliesQueryKey } from "./useReplies";

type FeedPage = { posts: FeedPost[]; nextCursor: string | null };

function isFeedInfiniteData(value: unknown): value is InfiniteData<FeedPage> {
  return Boolean(value && typeof value === "object" && "pages" in value && Array.isArray((value as { pages?: unknown }).pages));
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
  queryClient.setQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY }, (current) => {
    if (!isFeedInfiniteData(current)) return current;
    return { ...current, pages: current.pages.map((page) => ({ ...page, posts: page.posts.map((post) => post.id === postId ? update(post) : post) })) };
  });
  queryClient.setQueryData<FeedPost>(postQueryKey(postId), (current) => current ? update(current) : current);
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
      queryClient.setQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY }, (current) => {
        if (!isFeedInfiniteData(current)) return current;
        return { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, posts: [post, ...page.posts.filter((item) => item.id !== post.id)] } : page) };
      });
      queryClient.setQueryData(postQueryKey(post.id), post);
    },
  });
}

export function usePostReaction(type: "like" | "bookmark" | "repost") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, enabled }: { postId: string; enabled: boolean }) => setPostReaction(postId, type, enabled),
    onMutate: async ({ postId, enabled }) => {
      await Promise.all([queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY }), queryClient.cancelQueries({ queryKey: postQueryKey(postId) })]);
      const feedSnapshots = queryClient.getQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY });
      const postSnapshot = queryClient.getQueryData<FeedPost>(postQueryKey(postId));
      updatePostCaches(queryClient, postId, (post) => {
        const activeKey = type === "like" ? "liked" : type === "bookmark" ? "bookmarked" : "reposted";
        const countKey = type === "like" ? "likes" : type === "repost" ? "reposts" : null;
        const wasActive = Boolean(post[activeKey]);
        const count = countKey ? Math.max(0, post[countKey] + (enabled === wasActive ? 0 : enabled ? 1 : -1)) : undefined;
        return { ...post, [activeKey]: enabled, ...(countKey ? { [countKey]: count } : {}) };
      });
      return { feedSnapshots, postSnapshot, postId };
    },
    onError: (_error, _variables, context) => {
      context?.feedSnapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
      if (context?.postSnapshot) queryClient.setQueryData(postQueryKey(context.postId), context.postSnapshot);
    },
    onSuccess: (response, variables) => updatePostCaches(queryClient, variables.postId, (post) => ({ ...post, ...(type === "like" ? { likes: response.data.count } : type === "repost" ? { reposts: response.data.count } : {}) })),
    onSettled: (_data, _error, variables) => Promise.all([queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }), queryClient.invalidateQueries({ queryKey: postQueryKey(variables.postId) })]),
  });
}

export function useCreateReply(postId: string, parentId?: string) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  return useMutation({
    mutationFn: ({ body, mediaAssetIds }: { body: string; mediaAssetIds?: string[] }) => createReply(postId, { body, parentId, mediaAssetIds }),
    onMutate: async ({ body }) => {
      const key = repliesQueryKey(postId, parentId);
      await Promise.all([queryClient.cancelQueries({ queryKey: key }), queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY }), queryClient.cancelQueries({ queryKey: postQueryKey(postId) })]);
      const previousReplies = queryClient.getQueryData(key);
      const feedSnapshots = queryClient.getQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY });
      const postSnapshot = queryClient.getQueryData<FeedPost>(postQueryKey(postId));
      const pendingId = `pending-${crypto.randomUUID()}`;
      const optimistic: FeedReply = { id: pendingId, postId, parentId, author: currentUser, body, createdAt: new Date().toISOString(), likes: 0, isOwner: true };
      queryClient.setQueryData<InfiniteData<{ replies: FeedReply[]; nextCursor: string | null }>>(key, (current) => current ? { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, replies: [...page.replies, optimistic] } : page) } : current);
      updatePostCaches(queryClient, postId, (post) => ({ ...post, replies: post.replies + 1 }));
      return { key, previousReplies, feedSnapshots, postSnapshot, pendingId };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.key, context.previousReplies);
      context.feedSnapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
      if (context.postSnapshot) queryClient.setQueryData(postQueryKey(postId), context.postSnapshot);
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
      await Promise.all([queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY }), queryClient.cancelQueries({ queryKey: postQueryKey(postId) })]);
      const feedSnapshots = queryClient.getQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY });
      const postSnapshot = queryClient.getQueryData<FeedPost>(postQueryKey(postId));
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
      return { feedSnapshots, postSnapshot, postId };
    },
    onError: (_error, _variables, context) => {
      context?.feedSnapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
      if (context?.postSnapshot) queryClient.setQueryData(postQueryKey(context.postId), context.postSnapshot);
    },
    onSuccess: (poll, variables) => updatePostCaches(queryClient, variables.postId, (post) => post.poll ? { ...post, poll: { ...post.poll, totalVotes: poll.total_votes, viewerOptionId: poll.viewer_option_id ?? undefined, options: post.poll.options.map((option) => ({ ...option, voteCount: poll.options.find((item) => item.id === option.id)?.vote_count ?? option.voteCount })) } } : post),
    onSettled: (_data, _error, variables) => Promise.all([queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }), queryClient.invalidateQueries({ queryKey: postQueryKey(variables.postId) })]),
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
      queryClient.setQueriesData<InfiniteData<FeedPage>>({ queryKey: FEED_QUERY_KEY }, (current) => {
        if (!isFeedInfiniteData(current)) return current;
        return { ...current, pages: current.pages.map((page) => ({ ...page, posts: page.posts.filter((post) => post.id !== postId) })) };
      });
      queryClient.removeQueries({ queryKey: postQueryKey(postId) });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
  });
}

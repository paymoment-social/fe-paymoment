"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FeedPost, FeedReply } from "../types";

type FeedState = {
  likedIds: string[];
  bookmarkedIds: string[];
  followingIds: string[];
  localPosts: FeedPost[];
  repliesByPost: Record<string, FeedReply[]>;
  repostedIds: string[];
  toggleLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  toggleFollow: (id: string) => void;
  addPost: (post: FeedPost) => void;
  addReply: (reply: FeedReply) => void;
  toggleRepost: (id: string) => void;
  updatePost: (id: string, updates: Partial<FeedPost>) => void;
  votePoll: (postId: string, optionId: string, voterId: string) => void;
};

const toggle = (items: string[], id: string) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id];

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      likedIds: [],
      bookmarkedIds: [],
      followingIds: [],
      localPosts: [],
      repliesByPost: {},
      repostedIds: [],
      toggleLike: (id) => set((state) => ({ likedIds: toggle(state.likedIds, id) })),
      toggleBookmark: (id) => set((state) => ({ bookmarkedIds: toggle(state.bookmarkedIds, id) })),
      toggleFollow: (id) => set((state) => ({ followingIds: toggle(state.followingIds, id) })),
      addPost: (post) => set((state) => ({ localPosts: [post, ...state.localPosts] })),
      addReply: (reply) => set((state) => ({
        repliesByPost: {
          ...state.repliesByPost,
          [reply.postId]: [...(state.repliesByPost?.[reply.postId] ?? []), reply],
        },
      })),
      toggleRepost: (id) => set((state) => ({ repostedIds: toggle(state.repostedIds ?? [], id) })),
      updatePost: (id, updates) => set((state) => ({ localPosts: state.localPosts.map((post) => post.id === id ? { ...post, ...updates } : post) })),
      votePoll: (postId, optionId, voterId) => set((state) => ({
        localPosts: state.localPosts.map((post) => {
          if (post.id !== postId || !post.poll) return post;
          const previousOption = post.poll.options.find((option) => option.voterIds.includes(voterId));
          return { ...post, poll: { ...post.poll, options: post.poll.options.map((option) => ({ ...option, voterIds: option.voterIds.filter((id) => id !== voterId).concat(previousOption?.id === optionId ? [] : option.id === optionId ? [voterId] : []) })) } };
        }),
      })),
    }),
    { name: "paymoment-feed" },
  ),
);

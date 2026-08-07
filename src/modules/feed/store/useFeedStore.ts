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
    }),
    { name: "paymoment-feed" },
  ),
);

"use client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { NOTIFICATIONS_QUERY_KEY } from "../constants";
import { useNotificationsContext } from "../context/NotificationsContext";
import { getNotificationPreferences, getNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead, respondFollowRequest, updateNotificationPreferences } from "../services/notifications.service";
import type { NotificationPage, NotificationPreferences } from "../types";

function isNotificationInfiniteData(value: unknown): value is InfiniteData<NotificationPage> {
  return Boolean(value && typeof value === "object" && "pages" in value && Array.isArray((value as { pages?: unknown }).pages)
    && (value as { pages: unknown[] }).pages.every((page) => Boolean(page && typeof page === "object" && "notifications" in page)));
}

export function useNotifications() { const { filter } = useNotificationsContext(); return useInfiniteQuery({ queryKey: [...NOTIFICATIONS_QUERY_KEY, filter], queryFn: ({ pageParam }) => getNotifications(filter, pageParam, 30), initialPageParam: undefined as string | undefined, getNextPageParam: (page) => page.nextCursor ?? undefined, staleTime: 0, refetchOnWindowFocus: true, refetchOnReconnect: true }); }
export function useNotificationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const snapshots = client.getQueriesData<InfiniteData<NotificationPage>>({ queryKey: NOTIFICATIONS_QUERY_KEY });
      client.setQueriesData<InfiniteData<NotificationPage>>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (current) => isNotificationInfiniteData(current) ? { ...current, pages: current.pages.map((page) => ({ ...page, notifications: page.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })) } : current);
      return { snapshots };
    },
    onError: (_error, _id, context) => context?.snapshots.forEach(([key, value]) => client.setQueryData(key, value)),
    onSettled: () => client.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}
export function useNotificationsReadAll() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await client.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const snapshots = client.getQueriesData<InfiniteData<NotificationPage>>({ queryKey: NOTIFICATIONS_QUERY_KEY });
      client.setQueriesData<InfiniteData<NotificationPage>>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (current) => isNotificationInfiniteData(current) ? { ...current, pages: current.pages.map((page) => ({ ...page, notifications: page.notifications.map((item) => ({ ...item, read: true })) })) } : current);
      return { snapshots };
    },
    onError: (_error, _variables, context) => context?.snapshots.forEach(([key, value]) => client.setQueryData(key, value)),
    onSettled: () => client.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}
export function useNotificationPreferences() { return useQuery({ queryKey: [...NOTIFICATIONS_QUERY_KEY, "preferences"], queryFn: getNotificationPreferences }); }
export function useUnreadNotificationCount() { return useQuery({ queryKey: [...NOTIFICATIONS_QUERY_KEY, "unread-count"], queryFn: getUnreadNotificationCount, staleTime: 0, refetchOnWindowFocus: true, refetchOnReconnect: true }); }
export function useRespondFollowRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ followerId, accepted }: { followerId: string; accepted: boolean; notificationId: string }) => respondFollowRequest(followerId, accepted),
    onMutate: async ({ accepted, notificationId }) => {
      await client.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const snapshots = client.getQueriesData<InfiniteData<NotificationPage>>({ queryKey: NOTIFICATIONS_QUERY_KEY });
      client.setQueriesData<InfiniteData<NotificationPage>>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (current) => isNotificationInfiniteData(current) ? { ...current, pages: current.pages.map((page) => ({ ...page, notifications: page.notifications.map((item) => item.id === notificationId ? { ...item, read: true, followAction: accepted ? "accepted" : "declined", text: accepted ? "accepted your follow request." : "declined your follow request.", user: item.user ? { ...item.user, relationship: accepted ? "following" : "none" } : item.user } : item) })) } : current);
      return { snapshots };
    },
    onError: (_error, _variables, context) => context?.snapshots.forEach(([key, value]) => client.setQueryData(key, value)),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void client.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, "unread-count"] });
      void client.invalidateQueries({ queryKey: ["paymoment", "profile"] });
      void client.invalidateQueries({ queryKey: ["paymoment", "feed"] });
      void client.invalidateQueries({ queryKey: ["paymoment", "discover"] });
    },
  });
}
export function useUpdateNotificationPreferences() {
  const client = useQueryClient();
  const key = [...NOTIFICATIONS_QUERY_KEY, "preferences"];
  return useMutation({
    mutationFn: (input: Partial<NotificationPreferences>) => updateNotificationPreferences(input),
    onMutate: async (input) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<NotificationPreferences>(key);
      client.setQueryData<NotificationPreferences>(key, (current) => current ? { ...current, ...input } : current);
      return { previous };
    },
    onError: (_error, _input, context) => client.setQueryData(key, context?.previous),
    onSuccess: (saved) => client.setQueryData(key, saved),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}

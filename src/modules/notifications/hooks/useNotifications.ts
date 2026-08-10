"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NOTIFICATIONS_QUERY_KEY } from "../constants";
import { useNotificationsContext } from "../context/NotificationsContext";
import { getNotificationPreferences, getNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead, updateNotificationPreferences } from "../services/notifications.service";
import type { NotificationPreferences, PayNotification } from "../types";

export function useNotifications() { const { filter } = useNotificationsContext(); return useQuery({ queryKey: [...NOTIFICATIONS_QUERY_KEY, filter], queryFn: () => getNotifications(filter), staleTime: 15_000 }); }
export function useNotificationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const snapshots = client.getQueriesData<PayNotification[]>({ queryKey: NOTIFICATIONS_QUERY_KEY });
      client.setQueriesData<PayNotification[]>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (current) => current?.map((item) => item.id === id ? { ...item, read: true } : item));
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
      const snapshots = client.getQueriesData<PayNotification[]>({ queryKey: NOTIFICATIONS_QUERY_KEY });
      client.setQueriesData<PayNotification[]>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (current) => current?.map((item) => ({ ...item, read: true })));
      return { snapshots };
    },
    onError: (_error, _variables, context) => context?.snapshots.forEach(([key, value]) => client.setQueryData(key, value)),
    onSettled: () => client.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}
export function useNotificationPreferences() { return useQuery({ queryKey: [...NOTIFICATIONS_QUERY_KEY, "preferences"], queryFn: getNotificationPreferences }); }
export function useUnreadNotificationCount() { return useQuery({ queryKey: [...NOTIFICATIONS_QUERY_KEY, "unread-count"], queryFn: getUnreadNotificationCount, staleTime: 15_000 }); }
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

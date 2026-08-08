"use client";
import { createContext, use, useMemo, useState, type ReactNode } from "react";
import type { PayNotification, NotificationFilter } from "../types";
type Value = { extraNotifications: PayNotification[]; readIds: string[]; filter: NotificationFilter; setFilter: (filter: NotificationFilter) => void; addNotification: (notification: PayNotification) => void; markRead: (id: string) => void; markAllRead: (ids: string[]) => void };
const NotificationsContext = createContext<Value | null>(null);
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [extraNotifications, setExtraNotifications] = useState<PayNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const value = useMemo(() => ({ extraNotifications, readIds, filter, setFilter, addNotification: (notification: PayNotification) => setExtraNotifications((items) => [notification, ...items.filter((item) => item.id !== notification.id)]), markRead: (id: string) => setReadIds((ids) => ids.includes(id) ? ids : [...ids, id]), markAllRead: (ids: string[]) => setReadIds(ids) }), [extraNotifications, readIds, filter]);
  return <NotificationsContext value={value}>{children}</NotificationsContext>;
}
export function useNotificationsContext() { const value = use(NotificationsContext); if (!value) throw new Error("NotificationsProvider is missing"); return value; }
export function useOptionalNotificationsContext() { return use(NotificationsContext); }

"use client";
import { createContext, use, useMemo, useState, type ReactNode } from "react";
import type { NotificationFilter } from "../types";
type Value = { readIds: string[]; filter: NotificationFilter; setFilter: (filter: NotificationFilter) => void; markRead: (id: string) => void; markAllRead: (ids: string[]) => void };
const NotificationsContext = createContext<Value | null>(null);
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const value = useMemo(() => ({ readIds, filter, setFilter, markRead: (id: string) => setReadIds((ids) => ids.includes(id) ? ids : [...ids, id]), markAllRead: (ids: string[]) => setReadIds(ids) }), [readIds, filter]);
  return <NotificationsContext value={value}>{children}</NotificationsContext>;
}
export function useNotificationsContext() { const value = use(NotificationsContext); if (!value) throw new Error("NotificationsProvider is missing"); return value; }

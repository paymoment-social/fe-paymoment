"use client";
import { createContext, use, useMemo, useState, type ReactNode } from "react";
import type { NotificationFilter } from "../types";

type Value = { filter: NotificationFilter; setFilter: (filter: NotificationFilter) => void };
const NotificationsContext = createContext<Value | null>(null);
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const value = useMemo(() => ({ filter, setFilter }), [filter]);
  return <NotificationsContext value={value}>{children}</NotificationsContext>;
}
export function useNotificationsContext() { const value = use(NotificationsContext); if (!value) throw new Error("NotificationsProvider is missing"); return value; }
export function useOptionalNotificationsContext() { return use(NotificationsContext); }

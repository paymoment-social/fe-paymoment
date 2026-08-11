"use client";

import { useEffect } from "react";
import { createElement } from "react";
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { API_URL } from "@/lib/api/client";
import { AuthorAvatar } from "@/modules/feed";
import { getNotifications } from "@/modules/notifications/services/notifications.service";
import { NOTIFICATIONS_QUERY_KEY } from "@/modules/notifications/constants";
import type { PayNotification } from "@/modules/notifications/types";
import { notificationIcon } from "@/modules/notifications/utils/notificationIcon";
import { setRealtimeConnection } from "../services/realtime.client";

const notificationAccent: Record<PayNotification["type"], { badge: string; surface: string }> = {
  like: { badge: "bg-rose-500 text-white", surface: "bg-rose-500/15 text-rose-400" },
  repost: { badge: "bg-emerald-500 text-white", surface: "bg-emerald-500/15 text-emerald-400" },
  reward: { badge: "bg-emerald-500 text-white", surface: "bg-emerald-500/15 text-emerald-400" },
  reply: { badge: "bg-sky-500 text-white", surface: "bg-sky-500/15 text-sky-400" },
  message: { badge: "bg-sky-500 text-white", surface: "bg-sky-500/15 text-sky-400" },
  follow: { badge: "bg-primary text-primary-foreground", surface: "bg-primary/15 text-primary" },
  mention: { badge: "bg-primary text-primary-foreground", surface: "bg-primary/15 text-primary" },
  system: { badge: "bg-primary text-primary-foreground", surface: "bg-primary/15 text-primary" },
};

function showRealtimeNotification(item: Awaited<ReturnType<typeof getNotifications>>[number]) {
  const accent = notificationAccent[item.type];
  const typeIcon = notificationIcon[item.type];
  toast.custom((toastId) => createElement("button", {
    type: "button",
    onClick: () => { toast.dismiss(toastId); if (item.href) window.location.assign(item.href); },
    className: "flex w-[min(24rem,calc(100vw-2rem))] items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left text-foreground shadow-xl shadow-black/20 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  },
  createElement("span", { className: "relative shrink-0" }, item.user
    ? createElement(AuthorAvatar, { author: item.user, className: "size-9" })
    : createElement("span", { className: `grid size-9 place-items-center rounded-full ${accent.surface}` }, createElement(Icon, { icon: typeIcon, className: "size-4", "aria-hidden": true })),
  item.user && createElement("span", { className: `absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full border-2 border-card ${accent.badge}` }, createElement(Icon, { icon: typeIcon, className: "size-2.5", "aria-hidden": true }))),
  createElement("span", { className: "min-w-0 flex-1" }, createElement("span", { className: "block truncate text-sm font-semibold" }, item.user?.name ?? "PayMoment"), createElement("span", { className: "block truncate text-xs text-muted-foreground" }, item.text))), {
    className: "paymoment-realtime-toast",
  });
}

export function useRealtime() {
  const queryClient = useQueryClient();
  const shownNotificationIds = useRef(new Set<string>());
  useEffect(() => {
    let socket: WebSocket | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let fallbackPoll: ReturnType<typeof setInterval> | undefined;
    let attempts = 0;
    let closed = false;
    const refreshRealtimeData = () => {
      void queryClient.invalidateQueries({ queryKey: ["paymoment", "feed"] });
      void queryClient.invalidateQueries({ queryKey: ["paymoment", "messages"] });
      void queryClient.invalidateQueries({ queryKey: ["paymoment", "notifications"] });
    };
    const startFallbackPoll = () => {
      if (fallbackPoll) return;
      fallbackPoll = setInterval(refreshRealtimeData, 30_000);
    };
    const stopFallbackPoll = () => {
      if (!fallbackPoll) return;
      clearInterval(fallbackPoll);
      fallbackPoll = undefined;
    };
    const connect = () => {
      const url = `${API_URL.replace(/^http/, "ws")}/api/ws`;
      socket = new WebSocket(url);
      socket.onopen = () => { attempts = 0; stopFallbackPoll(); setRealtimeConnection(socket!); };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(String(event.data)) as { type?: string; data?: { conversation_id?: string; notification_id?: string } };
          if (payload.type?.startsWith("message.") || payload.type === "conversation.updated") { queryClient.invalidateQueries({ queryKey: ["paymoment", "messages"] }); if (payload.data?.conversation_id) queryClient.invalidateQueries({ queryKey: ["paymoment", "messages", payload.data.conversation_id] }); }
          if (payload.type === "notification.created") {
            const notificationId = typeof payload.data?.notification_id === "string" ? payload.data.notification_id : undefined;
            void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, "unread-count"] });
            if (notificationId && !shownNotificationIds.current.has(notificationId)) {
              shownNotificationIds.current.add(notificationId);
              void queryClient.fetchQuery({ queryKey: [...NOTIFICATIONS_QUERY_KEY, "all"], queryFn: () => getNotifications("all"), staleTime: 0 }).then((items) => {
                const item = items.find((notification) => notification.id === notificationId);
                if (item) showRealtimeNotification(item);
              }).catch(() => { /* The notification list will retry on focus. */ });
            }
          }
          if (payload.type === "typing.updated" || payload.type === "presence.updated") window.dispatchEvent(new CustomEvent("paymoment:realtime", { detail: payload }));
        } catch { /* Ignore malformed realtime events. */ }
      };
      socket.onclose = () => {
        if (socket) setRealtimeConnection(null);
        if (!closed) {
          startFallbackPoll();
          const delay = Math.min(1_000 * 2 ** attempts++, 15_000);
          retry = setTimeout(connect, delay);
        }
      };
    };
    connect();
    return () => { closed = true; if (retry) clearTimeout(retry); stopFallbackPoll(); setRealtimeConnection(null); socket?.close(); };
  }, [queryClient]);
}

"use client";

import { useEffect } from "react";
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/lib/api/client";
import { getNotifications } from "@/modules/notifications/services/notifications.service";
import { NOTIFICATIONS_QUERY_KEY } from "@/modules/notifications/constants";
import { setRealtimeConnection } from "../services/realtime.client";

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
                if (item) toast(`${item.user?.name ?? "Someone"} ${item.text}`);
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

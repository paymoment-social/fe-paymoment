"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";

type Value = { activeId: string; setActiveId: (id: string) => void };
const MessagesContext = createContext<Value | null>(null);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveIdState] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("conversation") ?? "");
  const setActiveId = (id: string) => {
    setActiveIdState(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("conversation", id); else url.searchParams.delete("conversation");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  };
  const value = useMemo(() => ({ activeId, setActiveId }), [activeId]);
  return <MessagesContext value={value}>{children}</MessagesContext>;
}

export function useMessagesContext() {
  const value = use(MessagesContext);
  if (!value) throw new Error("MessagesProvider is missing");
  return value;
}

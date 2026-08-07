"use client";
import { createContext, use, useMemo, useState, type ReactNode } from "react";
import type { ChatMessage } from "../types";
type Value = { activeId: string; setActiveId: (id: string) => void; sent: Record<string, ChatMessage[]>; send: (conversationId: string, body: string, attachment?: ChatMessage["attachment"]) => void };
const MessagesContext = createContext<Value | null>(null);
export function MessagesProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState("c1");
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const value = useMemo(() => ({ activeId, setActiveId, sent, send: (conversationId: string, body: string, attachment?: ChatMessage["attachment"]) => setSent((current) => ({ ...current, [conversationId]: [...(current[conversationId] ?? []), { id: `sent-${Date.now()}`, sender: "me", body, time: "now", attachment }] })) }), [activeId, sent]);
  return <MessagesContext value={value}>{children}</MessagesContext>;
}
export function useMessagesContext() { const value = use(MessagesContext); if (!value) throw new Error("MessagesProvider is missing"); return value; }

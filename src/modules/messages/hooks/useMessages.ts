"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MESSAGES_QUERY_KEY } from "../constants";
import { createConversation, createMessageRequest, getConversationMessages, getConversations, getIncomingMessageRequests, markConversationRead, respondToMessageRequest, sendConversationMessage } from "../services/messages.service";
import type { ChatMessage } from "../types";

export function useMessages() { return useQuery({ queryKey: MESSAGES_QUERY_KEY, queryFn: getConversations }); }
export function useIncomingMessageRequests() { return useQuery({ queryKey: [...MESSAGES_QUERY_KEY, "requests"], queryFn: getIncomingMessageRequests }); }
export function useRespondToMessageRequest() { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, decision }: { id: string; decision: "accept" | "decline" }) => respondToMessageRequest(id, decision), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, "requests"] }); void queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY }); } }); }
export function useConversationMessages(conversationId: string) { return useInfiniteQuery({ queryKey: [...MESSAGES_QUERY_KEY, conversationId], queryFn: ({ pageParam }) => getConversationMessages(conversationId, pageParam), initialPageParam: undefined as string | undefined, getNextPageParam: (last) => last.nextCursor, enabled: Boolean(conversationId) }); }
export function useCreateConversation() { const queryClient = useQueryClient(); return useMutation({ mutationFn: createConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY }) }); }
export function useCreateMessageRequest() { return useMutation({ mutationFn: createMessageRequest }); }
export function useMarkConversationRead() { const queryClient = useQueryClient(); return useMutation({ mutationFn: markConversationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY }) }); }
export function useSendConversationMessage() { const queryClient = useQueryClient(); return useMutation({
  mutationFn: sendConversationMessage,
  onMutate: async ({ conversationId, body, mediaAssetIds }) => {
    const key = [...MESSAGES_QUERY_KEY, conversationId]; await queryClient.cancelQueries({ queryKey: key }); const previous = queryClient.getQueryData(key); const optimistic: ChatMessage = { id: `pending-${crypto.randomUUID()}`, senderId: "__self__", body, createdAt: new Date().toISOString(), attachments: mediaAssetIds.map((id) => ({ id, url: null, mimeType: "application/octet-stream", altText: null })) };
    queryClient.setQueryData<{ pages: Array<{ messages: ChatMessage[]; nextCursor: string | null }>; pageParams: unknown[] }>(key, (current) => current ? { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, messages: [optimistic, ...page.messages] } : page) } : current); return { previous };
  },
  onError: (_error, variables, context) => queryClient.setQueryData([...MESSAGES_QUERY_KEY, variables.conversationId], context?.previous),
  onSuccess: (_message, variables) => { queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, variables.conversationId] }); queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY }); },
}); }

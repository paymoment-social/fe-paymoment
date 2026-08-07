"use client";
import { useQuery } from "@tanstack/react-query";
import { MESSAGES_QUERY_KEY } from "../constants";
import { getConversations } from "../services/messages.service";
export function useMessages() { return useQuery({ queryKey: MESSAGES_QUERY_KEY, queryFn: getConversations }); }

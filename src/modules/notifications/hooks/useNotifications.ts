"use client";
import { useQuery } from "@tanstack/react-query";
import { NOTIFICATIONS_QUERY_KEY } from "../constants";
import { getNotifications } from "../services/notifications.service";

export function useNotifications() 
{ return useQuery({ 
    queryKey: NOTIFICATIONS_QUERY_KEY,
     queryFn: getNotifications }); }

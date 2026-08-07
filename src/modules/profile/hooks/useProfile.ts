"use client";
import { useQuery } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "../constants";
import { getProfile } from "../services/profile.service";
export function useProfile() { return useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: getProfile }); }

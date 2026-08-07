"use client";
import { useQuery } from "@tanstack/react-query";
import { REWARDS_QUERY_KEY } from "../constants";
import { getRewards } from "../services/rewards.service";
export function useRewards() { return useQuery({ queryKey: REWARDS_QUERY_KEY, queryFn: getRewards }); }

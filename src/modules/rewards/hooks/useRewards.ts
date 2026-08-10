"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { REWARDS_QUERY_KEY } from "../constants";
import { getRewards, redeemReward } from "../services/rewards.service";
export function useRewards() { return useQuery({ queryKey: REWARDS_QUERY_KEY, queryFn: getRewards }); }
export function useRedeemReward() { const client = useQueryClient(); return useMutation({ mutationFn: redeemReward, onSuccess: () => client.invalidateQueries({ queryKey: REWARDS_QUERY_KEY }) }); }

"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { REWARDS_QUERY_KEY } from "../constants";
import { claimMomentReward, getRewards, redeemReward } from "../services/rewards.service";
export function useRewards() { return useQuery({ queryKey: REWARDS_QUERY_KEY, queryFn: getRewards }); }
export function useRedeemReward() { const client = useQueryClient(); return useMutation({ mutationFn: redeemReward, onSuccess: () => { void client.invalidateQueries({ queryKey: REWARDS_QUERY_KEY }); void client.invalidateQueries({ queryKey: ["paymoment", "session"] }); void client.invalidateQueries({ queryKey: ["paymoment", "profile"] }); } }); }
export function useClaimMomentReward() { const client = useQueryClient(); return useMutation({ mutationFn: claimMomentReward, onSuccess: () => { void client.invalidateQueries({ queryKey: REWARDS_QUERY_KEY }); void client.invalidateQueries({ queryKey: ["paymoment", "session"] }); void client.invalidateQueries({ queryKey: ["paymoment", "profile"] }); } }); }

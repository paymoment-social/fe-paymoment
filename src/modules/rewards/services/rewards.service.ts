import { apiRequest, mutationHeaders } from "@/lib/api/client";
import { mapAuthor } from "@/modules/feed/services/feed.service";
import type { RewardItem, RewardsData } from "../types";

type ApiCatalog = { id: string; slug: string; title: string; description: string; costPoints: number; inventory: number | null; active: boolean; claimed: boolean; claimedCount: number; campaignCapacity: number | null; metadata?: Record<string, unknown> };
const iconBySlug: Record<string, string> = { "verified-badge": "solar:verified-check-bold", "profile-highlight": "solar:stars-bold", "early-access-1000": "solar:fire-bold" };
function mapCatalog(item: ApiCatalog): RewardItem { return { id: item.id, slug: item.slug, title: item.title, description: item.description, cost: item.costPoints, icon: iconBySlug[item.slug] ?? "solar:gift-bold", available: item.active && (item.inventory === null || item.inventory > 0), claimed: item.claimed, claimedCount: item.claimedCount, campaignCapacity: item.campaignCapacity, inventory: item.inventory, metadata: item.metadata ?? {} }; }
type ApiProfile = Parameters<typeof mapAuthor>[0];
export async function getRewards(): Promise<RewardsData> { const [balance, catalog, leaderboard] = await Promise.all([apiRequest<{ data: { balance: number } }>("/api/v1/rewards/balance"), apiRequest<{ data: { items: ApiCatalog[] } }>("/api/v1/rewards/catalog"), apiRequest<{ data: { leaders: Array<{ rank: number; points: number; user: ApiProfile }> } }>("/api/v1/rewards/leaderboard")]); return { balance: balance.data.balance, leaders: leaderboard.data.leaders.filter((leader) => leader.user).map((leader) => ({ rank: leader.rank, box: leader.points, trend: "same", user: mapAuthor(leader.user) })), catalog: catalog.data.items.map(mapCatalog) }; }
export async function redeemReward(id: string) { return apiRequest<{ data: { balance: number; redeemed: boolean } }>(`/api/v1/rewards/catalog/${id}/redeem`, { method: "POST", headers: mutationHeaders() }); }
export async function claimMomentReward(postId: string) { return apiRequest<{ data: { balance: number; claimed: boolean } }>(`/api/v1/rewards/moments/${postId}/claim`, { method: "POST", headers: mutationHeaders() }); }

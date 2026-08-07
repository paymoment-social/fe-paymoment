import { LEADERS, REWARD_CATALOG } from "../constants";
import type { RewardsData } from "../types";
export async function getRewards(): Promise<RewardsData> { await new Promise((resolve) => setTimeout(resolve, 300)); return { leaders: LEADERS, catalog: REWARD_CATALOG }; }

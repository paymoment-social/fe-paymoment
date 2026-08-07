import { PEOPLE, getFeedPosts } from "@/modules/feed";
import { TRENDING_TOPICS } from "../constants";
import type { DiscoverData } from "../types";

export async function getDiscoverData(): Promise<DiscoverData> {
  await new Promise((resolve) => setTimeout(resolve, 280));
  return { people: PEOPLE, moments: await getFeedPosts(), topics: TRENDING_TOPICS };
}

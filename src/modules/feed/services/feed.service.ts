import { SEED_POSTS } from "../constants";
import type { FeedPost } from "../types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getFeedPosts(): Promise<FeedPost[]> {
  await wait(360);
  return SEED_POSTS;
}

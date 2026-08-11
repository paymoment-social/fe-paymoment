import type { DiscoverPage } from "../types";

export function incrementTrendingTopics(topics: DiscoverPage["topics"], slugs: string[], limit?: number) {
  if (!slugs.length) return topics;
  const normalizedSlugs = [...new Set(slugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean))];
  const next = topics.map((topic) => normalizedSlugs.includes(topic.slug.toLowerCase()) ? { ...topic, posts: topic.posts + 1 } : topic);
  normalizedSlugs.filter((slug) => !next.some((topic) => topic.slug.toLowerCase() === slug)).forEach((slug) => next.push({ label: `#${slug}`, slug, posts: 1 }));
  next.sort((left, right) => right.posts - left.posts || left.slug.localeCompare(right.slug));
  return typeof limit === "number" ? next.slice(0, limit) : next;
}

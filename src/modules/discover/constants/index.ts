export const DISCOVER_QUERY_KEY = ["paymoment", "discover"] as const;
export const TRENDING_TOPICS_QUERY_KEY = [...DISCOVER_QUERY_KEY, "trending"] as const;
export const DISCOVER_FILTERS = ["all", "moments", "articles", "people", "topics"] as const;

import type { DiscoverData } from "../types";

export function filterDiscovery(data: DiscoverData, query: string): DiscoverData {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return data;
  return {
    people: data.people.filter((person) => `${person.name} ${person.handle}`.toLowerCase().includes(normalized)),
    moments: data.moments.filter((moment) => `${moment.body} ${moment.tag ?? ""} ${moment.author.handle}`.toLowerCase().includes(normalized)),
    topics: data.topics.filter((topic) => topic.label.toLowerCase().includes(normalized)),
  };
}

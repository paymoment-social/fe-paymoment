"use client";

import { useQuery } from "@tanstack/react-query";
import { DISCOVER_QUERY_KEY } from "../constants";
import { useDiscoverContext } from "../context/DiscoverContext";
import { getDiscoverData } from "../services/discover.service";
import { filterDiscovery } from "../utils/filterDiscovery";

export function useDiscover() {
  const { query } = useDiscoverContext();
  const result = useQuery({ queryKey: DISCOVER_QUERY_KEY, queryFn: getDiscoverData });
  return { ...result, data: result.data ? filterDiscovery(result.data, query) : undefined };
}

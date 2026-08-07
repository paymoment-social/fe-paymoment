"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
import { DISCOVER_FILTERS } from "../constants";
import type { DiscoverFilter } from "../types";

type DiscoverContextValue = { query: string; setQuery: (query: string) => void; filter: DiscoverFilter; setFilter: (filter: DiscoverFilter) => void };
const DiscoverContext = createContext<DiscoverContextValue | null>(null);

export function DiscoverProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") ?? "");
  const [filter, setFilterState] = useState<DiscoverFilter>(() => {
    if (typeof window === "undefined") return "all";
    const value = new URLSearchParams(window.location.search).get("type") as DiscoverFilter;
    return DISCOVER_FILTERS.includes(value) ? value : "all";
  });
  const syncUrl = useCallback((nextQuery: string, nextFilter: DiscoverFilter) => {
    const url = new URL(window.location.href);
    if (nextQuery) url.searchParams.set("q", nextQuery); else url.searchParams.delete("q");
    if (nextFilter === "all") url.searchParams.delete("type"); else url.searchParams.set("type", nextFilter);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, []);
  const updateQuery = useCallback((nextQuery: string) => { setQuery(nextQuery); syncUrl(nextQuery, filter); }, [filter, syncUrl]);
  const setFilter = useCallback((nextFilter: DiscoverFilter) => { setFilterState(nextFilter); syncUrl(query, nextFilter); }, [query, syncUrl]);
  const value = useMemo(() => ({ query, setQuery: updateQuery, filter, setFilter }), [query, updateQuery, filter, setFilter]);
  return <DiscoverContext value={value}>{children}</DiscoverContext>;
}

export function useDiscoverContext() {
  const context = use(DiscoverContext);
  if (!context) throw new Error("useDiscoverContext must be used inside DiscoverProvider");
  return context;
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, use, useCallback, useMemo, type ReactNode } from "react";
import { DISCOVER_FILTERS } from "../constants";
import type { DiscoverFilter } from "../types";

type DiscoverContextValue = { query: string; setQuery: (query: string) => void; filter: DiscoverFilter; setFilter: (filter: DiscoverFilter) => void };
const DiscoverContext = createContext<DiscoverContextValue | null>(null);

export function DiscoverProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const filterValue = searchParams.get("type") as DiscoverFilter;
  const filter = DISCOVER_FILTERS.includes(filterValue) ? filterValue : "all";
  const syncUrl = useCallback((nextQuery: string, nextFilter: DiscoverFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery) params.set("q", nextQuery); else params.delete("q");
    if (nextFilter === "all") params.delete("type"); else params.set("type", nextFilter);
    const nextSearch = params.toString();
    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);
  const updateQuery = useCallback((nextQuery: string) => syncUrl(nextQuery, filter), [filter, syncUrl]);
  const setFilter = useCallback((nextFilter: DiscoverFilter) => syncUrl(query, nextFilter), [query, syncUrl]);
  const value = useMemo(() => ({ query, setQuery: updateQuery, filter, setFilter }), [query, updateQuery, filter, setFilter]);
  return <DiscoverContext value={value}>{children}</DiscoverContext>;
}

export function useDiscoverContext() {
  const context = use(DiscoverContext);
  if (!context) throw new Error("useDiscoverContext must be used inside DiscoverProvider");
  return context;
}

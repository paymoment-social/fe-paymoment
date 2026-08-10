"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, use, useCallback, type ReactNode } from "react";
import type { BookmarkFilter } from "../types";
import { BOOKMARK_FILTERS } from "../constants";
type Value = { filter: BookmarkFilter; setFilter: (filter: BookmarkFilter) => void };
const BookmarksContext = createContext<Value | null>(null);
export function BookmarksProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedFilter = searchParams.get("filter");
  const filter: BookmarkFilter = BOOKMARK_FILTERS.includes(requestedFilter as BookmarkFilter) ? requestedFilter as BookmarkFilter : "all";
  const setFilter = useCallback((next: BookmarkFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter"); else params.set("filter", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);
  return <BookmarksContext value={{ filter, setFilter }}>{children}</BookmarksContext>;
}
export function useBookmarksContext() { const value = use(BookmarksContext); if (!value) throw new Error("BookmarksProvider is missing"); return value; }

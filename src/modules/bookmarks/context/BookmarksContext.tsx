"use client";
import { createContext, use, useState, type ReactNode } from "react";
import type { BookmarkFilter } from "../types";
type Value = { filter: BookmarkFilter; setFilter: (filter: BookmarkFilter) => void };
const BookmarksContext = createContext<Value | null>(null);
export function BookmarksProvider({ children }: { children: ReactNode }) { const [filter, setFilter] = useState<BookmarkFilter>("all"); return <BookmarksContext value={{ filter, setFilter }}>{children}</BookmarksContext>; }
export function useBookmarksContext() { const value = use(BookmarksContext); if (!value) throw new Error("BookmarksProvider is missing"); return value; }

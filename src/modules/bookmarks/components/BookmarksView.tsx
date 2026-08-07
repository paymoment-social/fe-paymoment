"use client";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/modules/feed";
import { BOOKMARK_FILTERS } from "../constants";
import { useBookmarksContext } from "../context/BookmarksContext";
import { useBookmarks } from "../hooks/useBookmarks";
export function BookmarksView() { const result = useBookmarks(); const { filter, setFilter } = useBookmarksContext(); return <div className="space-y-4"><div className="flex gap-2">{BOOKMARK_FILTERS.map((item) => <Button key={item} variant={filter === item ? "default" : "outline"} className="h-10 capitalize" onClick={() => setFilter(item)}>{item}</Button>)}</div>{result.data?.length ? <div className="space-y-3">{result.data.map((post) => <PostCard key={post.id} post={post} />)}</div> : <section className="rounded-xl border bg-card p-12 text-center"><Icon icon="solar:bookmark-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h2 className="mt-3 font-semibold">No saved moments here</h2><p className="mt-1 text-sm text-muted-foreground">Use the bookmark action on any moment to keep it for later.</p></section>}</div>; }

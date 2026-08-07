"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthorAvatar, PostCard, VerifiedMark, useFeedStore } from "@/modules/feed";
import { DISCOVER_FILTERS } from "../constants";
import { useDiscoverContext } from "../context/DiscoverContext";
import { useDiscover } from "../hooks/useDiscover";

export function DiscoverView() {
  const { query, setQuery, filter, setFilter } = useDiscoverContext();
  const result = useDiscover();
  const following = useFeedStore((state) => state.followingIds);
  const toggleFollow = useFeedStore((state) => state.toggleFollow);
  const data = result.data;
  const visibleCount = data ? (filter === "all" ? data.people.length + data.moments.length + data.topics.length : data[filter].length) : 0;

  return <div className="space-y-4">
    <div className="relative">
      <Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <label htmlFor="discover-search" className="sr-only">Search moments, people, and topics</label>
      <Input id="discover-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search PayMoment" autoComplete="off" className="h-12 rounded-xl bg-card pl-12" />
    </div>
    <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
      <TabsList className="grid h-11 w-full grid-cols-4 bg-card/70">{DISCOVER_FILTERS.map((item) => <TabsTrigger key={item} value={item} className="capitalize">{item}</TabsTrigger>)}</TabsList>
    </Tabs>
    {result.isLoading && <div className="space-y-3" aria-label="Loading discovery"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>}
    {result.isError && <section className="rounded-xl border border-destructive/30 bg-card p-5"><p className="font-medium">Search is temporarily unavailable</p><p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p><Button variant="outline" className="mt-3 h-10" onClick={() => void result.refetch()}>Try again</Button></section>}
    {data && <>
      {(filter === "all" || filter === "people") && data.people.length > 0 && <section className="rounded-xl border bg-card/55 p-5"><h2 className="font-semibold">People to follow</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{data.people.slice(0, filter === "all" ? 4 : undefined).map((person) => <div key={person.id} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3"><AuthorAvatar author={person} /><div className="min-w-0 flex-1"><div className="flex items-center gap-1"><p className="truncate text-sm font-medium">{person.name}</p>{person.verified && <VerifiedMark />}</div><p className="truncate text-xs text-muted-foreground">@{person.handle}</p></div><Button variant={following.includes(person.id) ? "outline" : "default"} size="sm" className="h-10 px-3" onClick={() => toggleFollow(person.id)}>{following.includes(person.id) ? "Following" : "Follow"}</Button></div>)}</div></section>}
      {(filter === "all" || filter === "topics") && data.topics.length > 0 && <section className="rounded-xl border bg-card/55 p-5"><h2 className="font-semibold">Trending topics</h2><div className="mt-3 grid gap-1 sm:grid-cols-2">{data.topics.map((topic) => <button key={topic.label} type="button" onClick={() => setQuery(topic.label)} className="flex min-h-12 items-center justify-between rounded-lg px-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="text-sm">{topic.label}</span><span className="text-xs text-muted-foreground">{topic.posts} posts</span></button>)}</div></section>}
      {(filter === "all" || filter === "moments") && <div className="space-y-3">{data.moments.map((post) => <PostCard key={post.id} post={post} />)}</div>}
      {visibleCount === 0 && <section className="rounded-xl border bg-card p-10 text-center"><Icon icon="solar:magnifer-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h2 className="mt-3 font-semibold">No matches{query ? ` for “${query}”` : ""}</h2><p className="mt-1 text-sm text-muted-foreground">Try another keyword or search category.</p>{query && <Button variant="outline" className="mt-4 h-10" onClick={() => setQuery("")}>Clear search</Button>}</section>}
    </>}
  </div>;
}

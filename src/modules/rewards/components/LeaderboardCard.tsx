"use client";

import { Icon } from "@iconify/react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { AuthorAvatar } from "@/modules/feed";
import { useRewards } from "../hooks/useRewards";
import type { RewardLeader } from "../types";
import { formatBox } from "../utils/formatBox";

export function LeaderboardCard({ compact = false }: { compact?: boolean }) {
  const rewards = useRewards();
  const columns = useMemo<ColumnDef<RewardLeader>[]>(() => [
    { accessorKey: "rank", header: "Rank", cell: ({ row }) => <span className={row.original.rank <= 3 ? "text-amber-300" : "text-muted-foreground"}>{row.original.rank}</span> },
    { id: "member", header: "Member", cell: ({ row }) => <div className="flex items-center gap-2"><AuthorAvatar author={row.original.user} className="size-8" /><span className="truncate text-sm">{row.original.user.handle}</span></div> },
    { accessorKey: "box", header: "Box", cell: ({ row }) => <span className="flex items-center justify-end gap-2 font-mono text-sm tabular-nums"><Icon icon="solar:box-bold" className="size-4 text-primary" aria-hidden="true" />{formatBox(row.original.box)}</span> },
  ], []);
  // TanStack Table exposes mutable table helpers that React Compiler skips safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: rewards.data?.leaders ?? [], columns, getCoreRowModel: getCoreRowModel() });
  if (!rewards.data) return <div className="h-64 animate-pulse rounded-xl bg-muted" aria-label="Loading leaderboard" />;
  return (
    <section className="rounded-xl border bg-card/55 p-4">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Leaderboard</h2><span className="text-xs text-muted-foreground">This week</span></div>
      <table className="w-full"><thead className="sr-only">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.slice(0, compact ? 5 : undefined).map((row) => <tr key={row.id} className={row.original.user.id === "me" ? "bg-secondary" : ""}>{row.getVisibleCells().map((cell, index) => <td key={cell.id} className={`py-2 ${index === 0 ? "w-8 pl-2 text-xs" : index === 2 ? "pr-2 text-right" : ""}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>
    </section>
  );
}

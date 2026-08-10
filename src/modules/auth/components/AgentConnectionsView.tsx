"use client";

import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectAgentSetup } from "./ConnectAgentView";
import { useAgentConnections, useRevokeAgentConnection } from "../hooks/useAgentConnections";
import type { AgentConnection } from "../services/agent.service";

export function AgentConnectionsView() {
  const connections = useAgentConnections();
  const activeConnections = connections.data?.filter((connection) => connection.status === "active") ?? [];
  const activeCount = activeConnections.length;

  return (
    <section className="space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Settings · Integrations</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">Agent connections</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Manage the agents that can securely access your PayMoment account.</p>
            </div>
            <div className="hidden rounded-xl border border-border bg-card px-4 py-3 text-right sm:block">
              <p className="text-2xl font-semibold tracking-tight">{activeCount}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Active</p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-border bg-card/70 p-4 sm:p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Connect an agent</p>
            <ConnectAgentSetup />
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-secondary"><Bot className="size-4" aria-hidden="true" /></span><h2 className="text-sm font-semibold">Agents</h2><span className="text-xs text-muted-foreground">{activeCount} active</span></div><Button render={<Link href="/connect-agent" />} variant="outline" size="sm" className="h-9 gap-1.5">Setup guide <ExternalLink className="size-3.5" aria-hidden="true" /></Button></div>
            {connections.isLoading && <div className="mt-3 h-28 animate-pulse rounded-xl bg-secondary" aria-label="Loading agent connections" />}
            {connections.isError && <div role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><p>Couldn&apos;t load your agent connections.</p><button type="button" onClick={() => void connections.refetch()} className="mt-2 min-h-9 rounded-lg px-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Try again</button></div>}
            {activeConnections.length === 0 && <div className="mt-3 rounded-xl border border-dashed border-border p-8 text-center"><Bot className="mx-auto size-7 text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm font-medium">No active agent yet</p><p className="mt-1 text-xs text-muted-foreground">Connect an agent above to use PayMoment from ChatGPT or Claude.</p></div>}
            {activeConnections.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2">{activeConnections.map((connection) => <AgentConnectionCard key={connection.clientId} connection={connection} />)}</div>}
          </section>
    </section>
  );
}

function AgentConnectionCard({ connection }: { connection: AgentConnection }) {
  const revoke = useRevokeAgentConnection();
  const active = connection.status === "active";
  return <article className="rounded-xl border border-border bg-card p-4"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold">{connection.name.slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${active ? "bg-emerald-400/10 text-emerald-300" : "bg-secondary text-muted-foreground"}`}>{active ? "Active" : "Revoked"}</span><h3 className="truncate text-sm font-semibold">{connection.name}</h3></div><p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{connection.clientId}</p></div></div><div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3"><span className="text-xs text-muted-foreground">{connection.lastUsedAt ? `Used ${formatRelativeDate(connection.lastUsedAt)}` : `Added ${formatRelativeDate(connection.grantedAt)}`}</span>{active && <Button type="button" variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" disabled={revoke.isPending} onClick={() => revoke.mutate(connection.clientId)}>{revoke.isPending ? "Revoking..." : "Revoke"}</Button>}</div></article>;
}

function formatRelativeDate(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

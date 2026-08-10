"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Clipboard, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAgentConnections, useRevokeAgentConnection } from "../hooks/useAgentConnections";

const MCP_URL = (process.env.NEXT_PUBLIC_MCP_URL ?? "https://mcp.paymom3nts.xyz/mcp").replace(/\/$/, "");

export function ConnectAgentView() {
  const [provider, setProvider] = useState<"chatgpt" | "claude">("chatgpt");
  const connections = useAgentConnections();

  return (
    <main className="min-h-dvh bg-background px-5 py-6 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/onboarding" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Link>
          <div className="flex items-center gap-1.5" aria-label="Setup progress">
            {[0, 1, 2, 3].map((item) => <span key={item} className={`h-1.5 w-8 rounded-full sm:w-10 ${item === 3 ? "bg-primary" : "bg-secondary"}`} />)}
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8 flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
            <Sparkles className="size-6" aria-hidden="true" />
          </div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">PayBox · Setup</p>
          <h1 className="text-4xl font-semibold tracking-[-0.065em] sm:text-5xl">Connect your agent</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">Add PayBox to ChatGPT or Claude — one tap, sign in once. This is where everything you just set up starts paying off.</p>

          <div className="mt-8 space-y-3">
            <Dialog>
              <DialogTrigger render={<Button type="button" className="min-h-14 w-full justify-center gap-3 rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setProvider("chatgpt")} />}>
                <ChatGptMark /> Start with ChatGPT
              </DialogTrigger>
              <McpInstructions provider={provider} />
            </Dialog>
            <Dialog>
              <DialogTrigger render={<Button type="button" className="min-h-14 w-full justify-center gap-3 rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setProvider("claude")} />}>
                <ClaudeMark /> Start with Claude
              </DialogTrigger>
              <McpInstructions provider={provider} />
            </Dialog>
          </div>

          <Link href="/" className="mx-auto mt-5 inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Skip — you can connect anytime from the dashboard <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </section>

        <section className="border-t border-border py-8">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-sm font-semibold">Your agents <span className="font-normal text-muted-foreground">{connections.data ? `${connections.data.filter((item) => item.status === "active").length} active` : ""}</span></h2><p className="mt-1 text-xs text-muted-foreground">Connections are saved securely to your PayMoment account.</p></div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">MCP</span>
          </div>
          {connections.isLoading && <div className="mt-4 h-24 animate-pulse rounded-xl bg-secondary" aria-label="Loading agents" />}
          {connections.isError && <div role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><p>Couldn&apos;t load your agents.</p><button type="button" onClick={() => void connections.refetch()} className="mt-2 min-h-10 rounded-lg px-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Try again</button></div>}
          {connections.data && connections.data.length === 0 && <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">No agents connected yet. Choose ChatGPT or Claude above to get started.</div>}
          {connections.data && connections.data.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{connections.data.map((connection) => <AgentCard key={connection.clientId} connection={connection} />)}</div>}
        </section>
      </div>
    </main>
  );
}

function AgentCard({ connection }: { connection: import("../services/agent.service").AgentConnection }) {
  const revoke = useRevokeAgentConnection();
  const isActive = connection.status === "active";
  return <article className="rounded-xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isActive ? "bg-emerald-400/10 text-emerald-300" : "bg-secondary text-muted-foreground"}`}>{isActive ? "Active" : "Revoked"}</span><h3 className="truncate text-sm font-semibold">{connection.name}</h3></div><p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{connection.clientId}</p></div><span className="text-xs text-muted-foreground">{connection.scopes.length} scopes</span></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="text-xs text-muted-foreground">{connection.lastUsedAt ? `Used ${formatRelativeDate(connection.lastUsedAt)}` : `Added ${formatRelativeDate(connection.grantedAt)}`}</span>{isActive && <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={revoke.isPending} onClick={() => revoke.mutate(connection.clientId)}>{revoke.isPending ? "Revoking..." : "Revoke"}</Button>}</div></article>;
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

function McpInstructions({ provider }: { provider: "chatgpt" | "claude" }) {
  const [copied, setCopied] = useState(false);
  const isChatGpt = provider === "chatgpt";
  const copyUrl = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <DialogContent className="max-w-3xl gap-0 overflow-hidden border-border bg-card p-0">
    <DialogHeader className="border-b border-border px-6 py-5 pr-12">
      <DialogTitle className="text-lg font-semibold">Connect {isChatGpt ? "ChatGPT" : "Claude"}</DialogTitle>
      <DialogDescription className="mt-1">Follow these steps to authorize your PayBox agent.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_15rem]">
      <ol className="space-y-5 text-sm">
        <InstructionStep number="1" title="Copy the URL below"><div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background p-2"><code className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{MCP_URL}</code><Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => void copyUrl()}>{copied ? <Check className="size-3.5" aria-hidden="true" /> : <Clipboard className="size-3.5" aria-hidden="true" />} {copied ? "Copied" : "Copy"}</Button></div></InstructionStep>
        <InstructionStep number="2" title={`Open ${isChatGpt ? "ChatGPT" : "Claude"} on the web`}><p className="mt-1 text-muted-foreground">Open the web app in your browser and sign in to the account where you want to use PayBox.</p><a href={isChatGpt ? "https://chatgpt.com/" : "https://claude.ai/"} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open {isChatGpt ? "ChatGPT" : "Claude"} <ExternalLink className="size-3.5" aria-hidden="true" /></a></InstructionStep>
        <InstructionStep number="3" title="Add a custom connector"><p className="mt-1 text-muted-foreground">Open the connector, plugin, or integrations settings, paste the copied URL, and choose OAuth when asked.</p></InstructionStep>
        <InstructionStep number="4" title="Save and authorize"><p className="mt-1 text-muted-foreground">Save the connector, connect it, and complete the PayMoment authorization screen.</p></InstructionStep>
      </ol>
      <div className="hidden min-h-48 rounded-xl border border-border bg-background p-4 lg:block"><div className="flex h-full items-center justify-center rounded-lg bg-secondary/60 text-center text-xs text-muted-foreground">Your agent setup<br />will appear here</div></div>
    </div>
    <DialogFooter className="border-border bg-background/40"><DialogClose render={<Button type="button" variant="outline" />}>Done</DialogClose></DialogFooter>
  </DialogContent>;
}

function InstructionStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-[11px] text-muted-foreground">{number}</span><div className="min-w-0"><p className="font-medium">{title}</p>{children}</div></li>;
}

function ChatGptMark() { return <span className="grid size-5 place-items-center rounded-full border border-current text-[10px] font-bold" aria-hidden="true">✳</span>; }
function ClaudeMark() { return <span className="text-sm font-semibold text-orange-300" aria-hidden="true">✦</span>; }

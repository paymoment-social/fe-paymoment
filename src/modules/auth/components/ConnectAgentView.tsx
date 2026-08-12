"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Clipboard, ExternalLink, Sparkles } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAgentConnections, useRevokeAgentConnection } from "../hooks/useAgentConnections";

const MCP_URL = (process.env.NEXT_PUBLIC_MCP_URL ?? "https://mcp.paymom3nts.xyz/mcp").replace(/\/$/, "");
const SETUP_VIDEO_URL = process.env.NEXT_PUBLIC_AGENT_SETUP_VIDEO_URL?.trim();

export function ConnectAgentView() {
  const connections = useAgentConnections();

  return (
    <main className="min-h-dvh bg-background px-4 py-4 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Link>
          <div className="flex items-center gap-1.5" aria-label="Setup progress">
            {[0, 1, 2, 3].map((item) => <span key={item} className={`h-1.5 w-8 rounded-full sm:w-10 ${item === 3 ? "bg-primary" : "bg-secondary"}`} />)}
          </div>
        </header>

        <section className="mx-auto max-w-2xl py-10 sm:py-14">
          <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-[0_18px_60px_color-mix(in_oklab,var(--background)_55%,transparent)] sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><Sparkles className="size-4" aria-hidden="true" /></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">PayMoment · Setup</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.065em] sm:text-4xl">Connect your agent</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Bring PayMoment into the tools you already use. Connect once, then authorize access securely.</p></div>
            </div>

            <ConnectAgentSetup />
          </div>
        </section>

        <section className="border-t border-border py-5">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-sm font-semibold">Your agents <span className="font-normal text-muted-foreground">{connections.data ? `${connections.data.filter((item) => item.status === "active").length} active` : ""}</span></h2><p className="mt-1 text-xs text-muted-foreground">Connections are saved securely to your PayMoment account.</p></div>
            <span className="rounded-full border border-border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">MCP</span>
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

export function ConnectAgentSetup({ onSkip }: { onSkip?: () => void }) {
  const [provider, setProvider] = useState<"chatgpt" | "claude">("chatgpt");
  return <>
    <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
      <Dialog>
        <DialogTrigger render={<Button type="button" className="min-h-12 w-full justify-center gap-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setProvider("chatgpt")} />}>
          <Icon icon="simple-icons:openai" className="size-5" aria-hidden="true" /> <span>Connect ChatGPT</span>
        </DialogTrigger>
        <McpInstructions provider={provider} />
      </Dialog>
      <Dialog>
        <DialogTrigger render={<Button type="button" className="min-h-12 w-full justify-center gap-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setProvider("claude")} />}>
          <Icon icon="thesvg-color:claude" className="size-5" aria-hidden="true" /> <span>Connect Claude</span>
        </DialogTrigger>
        <McpInstructions provider={provider} />
      </Dialog>
    </div>
    {onSkip ? <button type="button" onClick={onSkip} className="mx-auto mt-3 inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Skip — you can connect anytime from the dashboard <ArrowUpRight className="size-3.5" aria-hidden="true" /></button> : <Link href="/" className="mx-auto mt-3 inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Skip for now <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>}
  </>;
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

export function McpInstructions({ provider }: { provider: "chatgpt" | "claude" }) {
  const [copied, setCopied] = useState(false);
  const isChatGpt = provider === "chatgpt";
  const copyUrl = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <DialogContent className="max-h-[92dvh] w-[calc(100vw-2rem)] max-w-5xl gap-0 overflow-y-auto border-border bg-card p-0 sm:max-w-5xl [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:size-10">
    <DialogHeader className="border-b border-border px-5 py-4 pr-14 sm:px-6 sm:py-5">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
          <Icon icon={isChatGpt ? "simple-icons:openai" : "thesvg-color:claude"} className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">PayMoment · Agent setup</p>
          <DialogTitle className="mt-1 text-lg font-semibold">Connect {isChatGpt ? "ChatGPT" : "Claude"}</DialogTitle>
        </div>
      </div>
      <DialogDescription className="mt-1 max-w-2xl">Follow these steps to securely authorize PayMoment in your AI account.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:items-stretch lg:gap-7">
      <ol className="space-y-4 text-sm">
        <InstructionStep number="1" title="Copy the URL below"><div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background p-2"><code className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{MCP_URL}</code><Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => void copyUrl()}>{copied ? <Check className="size-3.5" aria-hidden="true" /> : <Clipboard className="size-3.5" aria-hidden="true" />} {copied ? "Copied" : "Copy"}</Button></div></InstructionStep>
        <InstructionStep number="2" title={`Open ${isChatGpt ? "ChatGPT" : "Claude"} on the web`}><p className="mt-1 text-muted-foreground">Open the web app in your browser and sign in to the account where you want to use PayMoment.</p><a href={isChatGpt ? "https://chatgpt.com/" : "https://claude.ai/"} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open {isChatGpt ? "ChatGPT" : "Claude"} <ExternalLink className="size-3.5" aria-hidden="true" /></a></InstructionStep>
        <InstructionStep number="3" title="Add a custom connector"><p className="mt-1 text-muted-foreground">Open the connector, plugin, or integrations settings, paste the copied URL, and choose OAuth when asked.</p></InstructionStep>
        <InstructionStep number="4" title="Save and authorize"><p className="mt-1 text-muted-foreground">Save the connector, connect it, and complete the PayMoment authorization screen.</p></InstructionStep>
      </ol>
      <div className="min-h-56 overflow-hidden rounded-xl border border-border bg-background p-2 lg:min-h-full">{SETUP_VIDEO_URL ? <iframe title={`${isChatGpt ? "ChatGPT" : "Claude"} PayMoment setup video`} src={SETUP_VIDEO_URL} className="h-full min-h-56 w-full rounded-lg lg:min-h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-secondary via-secondary/70 to-primary/10 px-6 py-8 text-center lg:min-h-full"><Image src="/paymoment.png" alt="PayMoment" width={876} height={179} priority className="h-auto w-full max-w-sm object-contain" /><p className="mt-6 max-w-xs text-sm font-medium text-foreground">Connect PayMoment to your AI workspace</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Copy the MCP URL, add it as a connector, then approve access with your PayMoment account.</p></div>}</div>
    </div>
    <DialogFooter className="m-0 rounded-b-xl border-border bg-background/40"><DialogClose render={<Button type="button" className="min-h-12 min-w-20 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90" />}>Done</DialogClose></DialogFooter>
  </DialogContent>;
}

function InstructionStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-[11px] text-muted-foreground">{number}</span><div className="min-w-0"><p className="font-medium">{title}</p>{children}</div></li>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ChatGptMark() {
  return <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none"><path d="M12 3.1a4.1 4.1 0 0 1 7.08 2.82v.4a4.1 4.1 0 0 1 2.05 7.64l-.35.2a4.1 4.1 0 0 1-4.1 6.94l-.35-.2a4.1 4.1 0 0 1-7.08 2.82l-.35-.2a4.1 4.1 0 0 1-7.08-2.82v-.4a4.1 4.1 0 0 1-2.05-7.64l.35-.2a4.1 4.1 0 0 1 4.1-6.94l.35.2A4.1 4.1 0 0 1 12 3.1Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/><path d="m8.15 7.05 7.7 4.45v5.05M15.85 7.05 8.15 11.5v5.05M5.6 10.05v3.9l4.45 2.6M18.4 10.05v3.9l-4.45 2.6M12 5.6v4.95l4.45 2.6M12 18.4v-4.95l-4.45-2.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ClaudeMark() {
  return <svg aria-hidden="true" className="size-5 text-[#D97757]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.75c.5 4.5 2.05 7.15 6.25 8.25-4.2 1.1-5.75 3.75-6.25 8.25-.5-4.5-2.05-7.15-6.25-8.25C9.95 8.9 11.5 6.25 12 1.75ZM4.25 14.2c.25 2.35 1.05 3.75 3.25 4.3-2.2.55-3 1.95-3.25 4.3-.25-2.35-1.05-3.75-3.25-4.3 2.2-.55 3-1.95 3.25-4.3ZM19.75 14.2c.25 2.35 1.05 3.75 3.25 4.3-2.2.55-3 1.95-3.25 4.3-.25-2.35-1.05-3.75-3.25-4.3 2.2-.55 3-1.95 3.25-4.3Z"/></svg>;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Eye, LockKeyhole, PencilLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { useOAuthConsentDecision, useOAuthConsentRequest } from "../hooks/useOAuthConsent";
import { useSession } from "../hooks/useSession";
import type { ConnectionDuration } from "../services/agent.service";

export function OAuthConsentView({ requestId }: { requestId: string }) {
  const consent = useOAuthConsentRequest(requestId);
  const decision = useOAuthConsentDecision(requestId);
  const session = useSession();
  const [expiresInDays, setExpiresInDays] = useState<ConnectionDuration>("never");

  function decide(value: "approve" | "deny") {
    decision.mutate({ decision: value, expiresInDays }, { onSuccess: (redirectUrl) => window.location.assign(redirectUrl) });
  }

  if (!requestId) return <ConsentError title="Invalid connection request" description="The authorization link is missing its request ID." />;
  if (consent.isLoading) return <ConsentSkeleton />;
  if (consent.isError) {
    const expired = consent.error instanceof ApiError && consent.error.status === 404;
    return (
      <ConsentError
        title={expired ? "Connection request expired" : "Couldn't load this request"}
        description={expired ? "Return to ChatGPT and start the PayMoment connection again." : consent.error.message}
        retry={expired ? undefined : () => void consent.refetch()}
      />
    );
  }

  const request = consent.data;
  if (!request) return <ConsentError title="Connection request unavailable" description="Return to ChatGPT and start the connection again." />;

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="oauth-consent-title">
        <header className="flex min-h-16 items-center gap-3 border-b border-border px-5">
          <Image src="/paymoment.png" alt="PayMoment" width={142} height={31} className="h-auto w-[8.875rem] object-contain" priority />
          <span className="ml-auto rounded-full border border-border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">OAuth</span>
        </header>

        <div className="border-b border-border bg-accent/30 px-5 py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <LockKeyhole className="size-4" aria-hidden="true" /> Secure connection
          </div>
          <h1 id="oauth-consent-title" className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Connect {request.client.name}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Review what {request.client.name} can access before connecting your PayMoment account.</p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Requested access</h2>
            <ul className="mt-3 space-y-2">
              {request.permissions.map((permission) => {
                const PermissionIcon = permission.scope === "paymoment.read" ? Eye : PencilLine;
                return (
                  <li key={permission.scope} className="flex gap-3 rounded-xl border border-border bg-secondary/60 p-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><PermissionIcon className="size-5" aria-hidden="true" /></span>
                    <span className="min-w-0 pt-0.5"><strong className="block text-sm font-semibold">{permission.title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{permission.description}</span></span>
                  </li>
                );
              })}
            </ul>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); decide("approve"); }} className="space-y-4">
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Connection expires</legend>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Choose how long {request.client.name} can access your account.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {request.expiration.options.map((duration) => (
                  <label key={duration} className="cursor-pointer">
                    <input type="radio" name="connection-duration" value={duration} checked={expiresInDays === duration} onChange={() => setExpiresInDays(duration)} className="peer sr-only" />
                    <span className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-secondary/60 px-2 text-xs font-semibold text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">{duration === "never" ? "No expiry" : `${duration} ${duration === 1 ? "day" : "days"}`}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex items-start gap-2 text-xs leading-5 text-emerald-400">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{expiresInDays === "never" ? "This connection has no automatic expiration." : `Access ends automatically after ${expiresInDays} ${expiresInDays === 1 ? "day" : "days"}.`} You can revoke it anytime from Connections.</span>
            </div>

            {decision.isError && <div role="alert" className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{decision.error.message}</span></div>}

            <div className="grid gap-2">
              <Button type="submit" className="min-h-11 w-full text-sm font-semibold" disabled={decision.isPending} aria-busy={decision.isPending}>
                {decision.isPending && decision.variables?.decision === "approve" ? "Connecting..." : "Allow access"}
              </Button>
              <Button type="button" variant="outline" className="min-h-11 w-full text-sm font-semibold" disabled={decision.isPending} aria-busy={decision.isPending} onClick={() => decide("deny")}>
                {decision.isPending && decision.variables?.decision === "deny" ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session.data?.display_name ?? "PayMoment user"}</span>. By continuing, you allow {request.client.name} to use PayMoment within the permissions above.
          </p>
        </div>
      </section>
    </main>
  );
}

function ConsentSkeleton() {
  return <main className="grid min-h-dvh place-items-center bg-background px-4 py-8"><section className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-5" aria-label="Loading connection request"><Skeleton className="h-8 w-36" /><Skeleton className="h-24 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-11 w-full" /></section></main>;
}

function ConsentError({ title, description, retry }: { title: string; description: string; retry?: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center" role="alert">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive"><AlertCircle className="size-5" aria-hidden="true" /></span>
        <h1 className="mt-4 text-xl font-semibold tracking-[-0.04em]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-5 grid gap-2">
          {retry && <Button type="button" className="min-h-10" onClick={retry}>Try again</Button>}
          <Button variant="outline" className="min-h-10" render={<Link href="/connections" />}>Open Connections</Button>
        </div>
      </section>
    </main>
  );
}

"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="max-w-md space-y-4 rounded-xl border bg-card p-6 text-center">
        <Icon icon="solar:cloud-cross-linear" className="mx-auto size-10 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-semibold">Couldn’t load PayMoment</h1>
          <p className="mt-1 text-sm text-muted-foreground">This is usually a temporary hiccup. Your local moments are safe.</p>
        </div>
        <Button className="h-10 px-5" onClick={reset}>Try again</Button>
      </section>
    </main>
  );
}

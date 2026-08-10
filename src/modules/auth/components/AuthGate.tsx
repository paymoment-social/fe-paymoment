"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "../hooks/useSession";

export function AuthGate({ children, requireOnboarding = true }: { children: ReactNode; requireOnboarding?: boolean }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session.error instanceof ApiError && session.error.status === 401) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (session.data && requireOnboarding && !session.data.onboarding_completed) {
      router.replace("/onboarding");
    } else if (session.data?.onboarding_completed && pathname === "/onboarding") {
      router.replace("/");
    }
  }, [pathname, requireOnboarding, router, session.data, session.error]);

  if (session.isLoading || (session.data && requireOnboarding && !session.data.onboarding_completed)) {
    return <main className="mx-auto min-h-dvh w-full max-w-5xl space-y-4 px-4 py-6"><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></main>;
  }
  if (session.error) {
    if (session.error instanceof ApiError && session.error.status === 401) return <main className="min-h-dvh bg-background" />;
    return <main className="grid min-h-dvh place-items-center px-4"><section className="w-full max-w-md rounded-xl border bg-card p-6"><h1 className="text-lg font-semibold">Couldn&apos;t verify your session</h1><p className="mt-2 text-sm text-muted-foreground">{session.error.message}</p><Button className="mt-5 h-10" onClick={() => void session.refetch()}>Try again</Button></section></main>;
  }
  return children;
}

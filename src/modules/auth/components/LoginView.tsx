"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LockKeyhole } from "lucide-react";

export function LoginView() {
  const router = useRouter();

  return (
    <main className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[minmax(21rem,0.9fr)_minmax(34rem,1.1fr)]">
      <section className="relative hidden min-h-dvh overflow-hidden border-r border-border bg-[#0d0c13] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(184,162,255,0.22),transparent_28%),radial-gradient(circle_at_86%_78%,rgba(128,86,232,0.24),transparent_35%)]" />
        <div className="absolute -bottom-36 -left-24 h-[34rem] w-[34rem] rounded-full border border-primary/20 bg-primary/5 blur-[1px]" />
        <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 p-10 xl:p-12">
          <Image src="/payboxlogo.png" alt="" width={38} height={38} className="object-contain" priority />
          <span className="text-xl font-semibold tracking-[-0.04em]">PayMoment</span>
        </div>

        <div className="relative z-10 max-w-xl p-10 pb-14 xl:p-12 xl:pb-16">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-primary/80">The social layer for PayBox</p>
          <h1 className="max-w-lg text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white xl:text-6xl">
            Turn every payment into a <span className="text-primary">Moment.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/60">
            Share what you are building, discover the people behind the payments, and earn Box along the way.
          </p>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-[30rem]">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Image src="/payboxlogo.png" alt="" width={32} height={32} className="object-contain" priority />
              <span className="font-semibold tracking-[-0.04em]">PayMoment</span>
            </Link>
            <Link href="/" className="flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Back home <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mb-9">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Secure access
            </div>
            <h2 className="text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Welcome back.</h2>
            <p className="mt-4 text-base leading-6 text-muted-foreground">Sign in to keep your Moments moving.</p>
          </div>

          <div className="space-y-4">
            <button type="button" disabled className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed">
              <span>Continue with</span>
              <Image src="/paybox-lockup-white.svg" alt="PayBox" width={72} height={17} className="object-contain" />
              <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Coming soon</span>
            </button>
            <button type="button" onClick={() => router.push("/onboarding")} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <GoogleIcon /> Continue with Google
            </button>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Sign in to continue to PayMoment.</p>

          <p className="mt-12 text-center text-xs leading-5 text-muted-foreground">
            By continuing, you agree to PayMoment&apos;s <Link href="/" className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">Terms</Link> and <Link href="/" className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.39Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.61-2.38l-3.22-2.51c-.89.6-2.02.96-3.39.96-2.61 0-4.83-1.76-5.62-4.13H3.05v2.59A9.99 9.99 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.38 13.94A6.01 6.01 0 0 1 6.06 12c0-.67.11-1.32.32-1.94V7.47H3.05A10 10 0 0 0 2 12c0 1.61.39 3.13 1.05 4.53l3.33-2.59Z" /><path fill="#EA4335" d="M12 5.93c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 2.94 14.7 2 12 2a9.99 9.99 0 0 0-8.95 5.47l3.33 2.59C7.17 7.69 9.39 5.93 12 5.93Z" /></svg>;
}

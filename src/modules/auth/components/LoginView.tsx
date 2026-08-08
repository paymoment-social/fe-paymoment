"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowUpRight, Check, LockKeyhole } from "lucide-react";

type LoginMethod = "google" | "apple" | "email" | null;

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeMethod, setActiveMethod] = useState<LoginMethod>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/onboarding");
  };

  const handleSocialLogin = (method: Exclude<LoginMethod, "email" | null>) => {
    setSubmitted(true);
    setActiveMethod(method);
    setMessage("Setting up your PayMoment profile...");
    router.push("/onboarding");
  };

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

          <div className="space-y-3">
            <button type="button" onClick={() => handleSocialLogin("google")} disabled={submitted} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60">
              <GoogleIcon /> Continue with Google
            </button>
            <button type="button" onClick={() => handleSocialLogin("apple")} disabled={submitted} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60">
              <AppleIcon /> Continue with Apple
            </button>
          </div>

          <div className="my-8 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or use email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setSubmitted(false); setMessage(""); }} placeholder="you@example.com" className="min-h-14 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <button type="submit" disabled={submitted || !email} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55">
              {submitted && activeMethod === "email" ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
              {submitted && activeMethod === "email" ? "Request received" : "Continue with email"}
            </button>
          </form>

          <div aria-live="polite" className="min-h-10 pt-4 text-center text-xs leading-5 text-muted-foreground">
            {message}
          </div>

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

function AppleIcon() {
  return <svg aria-hidden="true" className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09ZM12.03 7.25C11.88 5.02 13.69 3.18 15.78 3c.29 2.58-2.34 4.5-3.75 4.25Z" /></svg>;
}

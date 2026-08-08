"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const INTERESTS = ["Payments", "AI", "Building in public", "Creator economy", "Web3", "Product design"];

type OnboardingData = {
  name: string;
  username: string;
  birthDate: string;
  bio: string;
  interests: string[];
};

export function OnboardingView() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({ name: "", username: "", birthDate: "", bio: "", interests: [] });

  const usernameError = useMemo(() => {
    if (!data.username) return "";
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(data.username)) return "Use 3–15 letters, numbers, or underscores.";
    return "";
  }, [data.username]);

  const canContinue = step === 0 ? Boolean(data.name.trim() && data.username && !usernameError) : step === 1 ? Boolean(data.birthDate) : true;

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const continueOnboarding = () => {
    if (step < 2) setStep((current) => current + 1);
    else router.push("/");
  };

  const toggleInterest = (interest: string) => {
    update("interests", data.interests.includes(interest) ? data.interests.filter((item) => item !== interest) : [...data.interests, interest]);
  };

  return (
    <main className="min-h-dvh bg-background px-4 py-4 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Image src="/payboxlogo.png" alt="" width={32} height={32} className="object-contain" priority />
            <span className="font-semibold tracking-[-0.04em]">PayMoment</span>
          </Link>
          <span className="text-xs text-muted-foreground">Step {step + 1} of 3</span>
        </header>

        <div className="mt-6 flex gap-2" aria-label={`Onboarding progress: step ${step + 1} of 3`}>
          {[0, 1, 2].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full transition-colors ${item <= step ? "bg-primary" : "bg-secondary"}`} />)}
        </div>

        <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-8">
          {step === 0 && <StepProfile data={data} update={update} usernameError={usernameError} />}
          {step === 1 && <StepBirthday birthDate={data.birthDate} update={update} />}
          {step === 2 && <StepInterests data={data} update={update} toggleInterest={toggleInterest} />}

          <div className="mt-10 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
            <button type="button" onClick={continueOnboarding} disabled={!canContinue} className="flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45">
              {step === 2 ? "Finish setup" : "Continue"} {step === 2 ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">You can update these details later from your profile.</p>
      </div>
    </main>
  );
}

function StepProfile({ data, update, usernameError }: { data: OnboardingData; update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void; usernameError: string }) {
  return <div>
    <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-primary">Make it yours</p>
    <h1 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">What should we call you?</h1>
    <p className="mt-4 text-base leading-6 text-muted-foreground">Your name and username help people recognize you on PayMoment.</p>
    <div className="mt-6 space-y-4">
      <div className="space-y-2"><label htmlFor="onboarding-name" className="text-sm font-medium">Name</label><input id="onboarding-name" type="text" autoComplete="name" value={data.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" className="min-h-14 w-full rounded-xl border border-input bg-card px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20" /></div>
      <div className="space-y-2"><label htmlFor="onboarding-username" className="text-sm font-medium">Username</label><div className="flex min-h-14 items-center rounded-xl border border-input bg-card px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"><span className="text-muted-foreground">@</span><input id="onboarding-username" type="text" autoComplete="username" value={data.username} onChange={(event) => update("username", event.target.value.replace(/^@/, ""))} placeholder="yourhandle" className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground/70" /></div><p className={`text-xs ${usernameError ? "text-destructive" : "text-muted-foreground"}`}>{usernameError || "This is how people will find you."}</p></div>
    </div>
  </div>;
}

function StepBirthday({ birthDate, update }: { birthDate: string; update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void }) {
  return <div>
    <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-primary">A little about you</p>
    <h1 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">When&apos;s your birthday?</h1>
    <p className="mt-4 max-w-lg text-base leading-6 text-muted-foreground">This won&apos;t be shown publicly. It helps us keep PayMoment safe and relevant for you.</p>
    <DatePicker value={birthDate} onChange={(value) => update("birthDate", value)} />
  </div>;
}

function DatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const today = new Date();
  const selectedDate = value ? parseDate(value) : undefined;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => selectedDate ?? new Date(today.getFullYear() - 18, today.getMonth(), 1));
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month);
  const dates = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1);

  const selectDate = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    onChange(formatDateValue(date));
    setOpen(false);
  };

  const moveMonth = (amount: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));

  return <div ref={pickerRef} className="relative mt-8 space-y-2">
    <label htmlFor="birth-date-trigger" className="text-sm font-medium">Date of birth</label>
    <button id="birth-date-trigger" type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-input bg-card px-4 text-left text-base outline-none transition-colors hover:border-primary/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20">
      <CalendarDays className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      <span className={value ? "text-foreground" : "text-muted-foreground/70"}>{value ? formatDateLabel(selectedDate) : "Pick your date of birth"}</span>
    </button>
    {open && <div role="dialog" aria-label="Choose date of birth" className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl shadow-black/30">
      <div className="mb-3 flex items-center justify-between"><button type="button" onClick={() => moveMonth(-1)} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Previous month"><ChevronLeft className="size-4" aria-hidden="true" /></button><p className="text-sm font-semibold">{monthLabel}</p><button type="button" onClick={() => moveMonth(1)} disabled={month.getFullYear() >= today.getFullYear() && month.getMonth() >= today.getMonth()} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30" aria-label="Next month"><ChevronRight className="size-4" aria-hidden="true" /></button></div>
      <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="grid grid-cols-7 gap-0.5">{dates.map((day, index) => day === null ? <span key={`empty-${index}`} className="size-8" /> : <button key={day} type="button" onClick={() => selectDate(day)} disabled={new Date(month.getFullYear(), month.getMonth(), day) > today} className={`grid size-8 place-items-center rounded-lg text-sm transition-colors hover:bg-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 ${selectedDate && selectedDate.getFullYear() === month.getFullYear() && selectedDate.getMonth() === month.getMonth() && selectedDate.getDate() === day ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}`}>{day}</button>)}</div>
    </div>}
    <p className="text-xs text-muted-foreground">Your date of birth is private.</p>
  </div>;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatDateLabel(date?: Date) {
  return date ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date) : "Pick your date of birth";
}

function StepInterests({ data, update, toggleInterest }: { data: OnboardingData; update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void; toggleInterest: (interest: string) => void }) {
  return <div>
    <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-primary">Finish your profile</p>
    <h1 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">What are you into?</h1>
    <p className="mt-4 text-base leading-6 text-muted-foreground">Choose a few interests so your first feed feels like yours. Everything here is optional.</p>
    <div className="mt-6 space-y-4"><div className="space-y-2"><label htmlFor="onboarding-bio" className="text-sm font-medium">Bio <span className="font-normal text-muted-foreground">(optional)</span></label><textarea id="onboarding-bio" value={data.bio} onChange={(event) => update("bio", event.target.value)} maxLength={160} placeholder="Tell people what you are building..." className="min-h-24 w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20" /><p className="text-right text-xs text-muted-foreground">{data.bio.length}/160</p></div><fieldset><legend className="text-sm font-medium">Interests <span className="font-normal text-muted-foreground">(optional)</span></legend><div className="mt-2 flex flex-wrap gap-2">{INTERESTS.map((interest) => <button key={interest} type="button" aria-pressed={data.interests.includes(interest)} onClick={() => toggleInterest(interest)} className={`min-h-9 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${data.interests.includes(interest) ? "border-primary bg-primary/20 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>{interest}</button>)}</div></fieldset></div>
  </div>;
}

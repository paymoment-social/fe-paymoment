import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-dvh place-items-center px-4"><section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center"><Icon icon="solar:map-point-search-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold">Page not found</h1><p className="mt-1 text-sm text-muted-foreground">This page may have moved, been removed, or never existed.</p><Button render={<Link href="/" />} className="mt-5 h-10 px-5">Return home</Button></section></main>;
}

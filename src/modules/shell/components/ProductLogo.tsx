import Image from "next/image";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export function ProductLogo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><span className="relative grid size-10 place-items-center" aria-hidden="true"><span className="absolute inset-1 rounded-xl bg-primary/25 blur-md" /><Image src="/payboxlogo.png" alt="" width={40} height={40} priority className="relative size-10 object-contain drop-shadow-[0_0_0.9rem_color-mix(in_oklab,var(--primary)_42%,transparent)]" /></span>{!compact && <span className="text-[1.45rem] font-semibold tracking-[-0.035em]">PayMoment</span>}</div>;
}
export function BoxIcon({ className }: { className?: string }) { return <Icon icon="solar:box-bold" className={cn("text-primary", className)} aria-hidden="true" />; }

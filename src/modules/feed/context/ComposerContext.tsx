"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";

type ComposerContextValue = { open: boolean; setOpen: (open: boolean) => void };
const ComposerContext = createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <ComposerContext value={value}>{children}</ComposerContext>;
}

export function useComposer() {
  const context = use(ComposerContext);
  if (!context) throw new Error("useComposer must be used inside ComposerProvider");
  return context;
}

"use client";
import { createContext, use, useMemo, useState, type ReactNode } from "react";
type Value = { mobileMenuOpen: boolean; setMobileMenuOpen: (open: boolean) => void };
const ShellContext = createContext<Value | null>(null);
export function ShellProvider({ children }: { children: ReactNode }) { const [mobileMenuOpen, setMobileMenuOpen] = useState(false); const value = useMemo(() => ({ mobileMenuOpen, setMobileMenuOpen }), [mobileMenuOpen]); return <ShellContext value={value}>{children}</ShellContext>; }
export function useShellContext() { const value = use(ShellContext); if (!value) throw new Error("ShellProvider is missing"); return value; }

import { Suspense } from "react";
import { LoginView } from "@/modules/auth/components/LoginView";

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-dvh bg-background" />}><LoginView /></Suspense>;
}

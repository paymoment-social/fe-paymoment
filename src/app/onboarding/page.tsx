import { OnboardingView } from "@/modules/auth/components/OnboardingView";
import { AuthGate } from "@/modules/auth/components/AuthGate";

export default function OnboardingPage() {
  return <AuthGate requireOnboarding={false}><OnboardingView /></AuthGate>;
}

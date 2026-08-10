import { PayMomentShell } from "@/modules/shell";
import { AuthGate } from "@/modules/auth/components/AuthGate";

export default function HomePage() {
  return <AuthGate><PayMomentShell section="for-you" /></AuthGate>;
}

import { AuthGate } from "@/modules/auth/components/AuthGate";
import { ConnectAgentView } from "@/modules/auth/components/ConnectAgentView";

export default function ConnectAgentPage() {
  return <AuthGate><ConnectAgentView /></AuthGate>;
}

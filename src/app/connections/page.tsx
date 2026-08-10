import { AuthGate } from "@/modules/auth/components/AuthGate";
import { AgentConnectionsView } from "@/modules/auth/components/AgentConnectionsView";

export default function ConnectionsPage() {
  return <AuthGate><AgentConnectionsView /></AuthGate>;
}

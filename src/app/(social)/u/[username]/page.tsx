import { AuthGate } from "@/modules/auth/components/AuthGate";
import { PublicProfileView } from "@/modules/profile/components/PublicProfileView";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <AuthGate><PublicProfileView username={username} /></AuthGate>;
}

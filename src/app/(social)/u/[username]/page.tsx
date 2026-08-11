import { PublicProfileView } from "@/modules/profile/components/PublicProfileView";
import { MomentShell } from "@/modules/shell";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <MomentShell active="profile"><PublicProfileView username={username} /></MomentShell>;
}

import { PostDetailView } from "@/modules/feed";
import { AuthGate } from "@/modules/auth/components/AuthGate";
import { MomentShell } from "@/modules/shell";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuthGate><MomentShell><PostDetailView postId={id} /></MomentShell></AuthGate>;
}

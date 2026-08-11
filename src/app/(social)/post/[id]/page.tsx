import { PostDetailView } from "@/modules/feed";
import { MomentShell } from "@/modules/shell";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MomentShell><PostDetailView postId={id} /></MomentShell>;
}

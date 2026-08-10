import { ArticleEditorPage } from "@/modules/feed/components/ArticleEditorPage";
import { AuthGate } from "@/modules/auth/components/AuthGate";
import { MomentShell } from "@/modules/shell";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuthGate><MomentShell><ArticleEditorPage postId={id} /></MomentShell></AuthGate>;
}

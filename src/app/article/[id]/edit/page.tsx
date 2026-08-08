import { ArticleEditorPage } from "@/modules/feed/components/ArticleEditorPage";
import { MomentShell } from "@/modules/shell";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MomentShell><ArticleEditorPage postId={id} /></MomentShell>;
}

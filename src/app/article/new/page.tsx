import { ArticleEditorPage } from "@/modules/feed/components/ArticleEditorPage";
import { AuthGate } from "@/modules/auth/components/AuthGate";
import { MomentShell } from "@/modules/shell";

export default function NewArticlePage() {
  return <AuthGate><MomentShell><ArticleEditorPage /></MomentShell></AuthGate>;
}

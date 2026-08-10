"use client";

import { Placeholder } from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TiptapImage from "@tiptap/extension-image";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/modules/auth/hooks/useCurrentUser";
import { postQueryKey, usePost } from "../hooks/useFeed";
import { createArticle, updateArticle, uploadFeedMedia } from "../services/feed.service";
import type { FeedPost } from "../types";

const ResizableArticleImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-width") ?? element.style.width ?? "100%",
        renderHTML: (attributes) => ({ "data-width": attributes.width, style: `width: ${attributes.width};` }),
      },
    };
  },
});

export function ArticleEditorPage({ postId }: { postId?: string }) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const articleQuery = usePost(postId ?? "");
  const post = articleQuery.data;
  const verified = Boolean(currentUser.verified);

  if (!verified) return <AccessMessage onBack={() => router.back()} />;
  if (postId) {
    if (articleQuery.isLoading) return <section className="mx-auto mt-12 max-w-lg rounded-2xl border bg-card/50 p-8 text-center text-sm text-muted-foreground">Loading article...</section>;
    if (!post || !post.article) return <AccessMessage title="Article not found" description="This article is unavailable or has been removed." onBack={() => router.back()} />;
    if (post.author.id !== currentUser.id) return <AccessMessage title="You cannot edit this article" description="Only the author can edit an article." onBack={() => router.back()} />;
  }

  return <ArticleEditorForm key={post?.id ?? "new"} post={post} onBack={() => router.back()} onSaved={(id) => router.push(`/post/${id}`)} />;
}

function ArticleEditorForm({ post, onBack, onSaved }: { post?: FeedPost; onBack: () => void; onSaved: (id: string) => void }) {
  const queryClient = useQueryClient();
  const article = post?.article;
  const [eyebrow, setEyebrow] = useState(article?.eyebrow ?? "PayMoment for AI Agents");
  const [title, setTitle] = useState(article?.title ?? "");
  const [linkUrl, setLinkUrl] = useState("");
  const [bannerImage, setBannerImage] = useState(article?.banner?.image ?? "");
  const [bannerFile, setBannerFile] = useState<File>();
  const [bannerColor, setBannerColor] = useState(article?.banner?.color ?? "#17181B");
  const [bannerPosition, setBannerPosition] = useState<"left" | "center" | "right">(article?.banner?.position ?? "center");
  const bannerInput = useRef<HTMLInputElement>(null);
  const inlineImageInput = useRef<HTMLInputElement>(null);
  const linkSelection = useRef<{ from: number; to: number } | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const editor = useEditor({
    immediatelyRender: false,
    content: article?.contentHtml ?? "",
    extensions: [StarterKit, TextStyle, Color, Highlight.configure({ multicolor: true }), ResizableArticleImage.configure({ allowBase64: true }), TextAlign.configure({ types: ["heading", "paragraph", "image"] }), Table.configure({ resizable: true }), TableRow, TableHeader, TableCell, Placeholder.configure({ placeholder: "Start writing your article..." })],
    editorProps: {
      attributes: {
        class: "article-editor-content min-h-[22rem] px-5 py-4 text-[16px] leading-8 outline-none [&_a]:!text-primary [&_a]:!underline [&_a]:underline-offset-4 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold",
      },
    },
  });

  const saveArticle = useMutation({
    mutationFn: async () => {
      const cleanTitle = title.trim();
      const text = editor?.getText().trim() ?? "";
      if (!cleanTitle || !text || !editor) throw new Error("Add a title and some article content first.");
      const description = text.length > 180 ? `${text.slice(0, 177).trimEnd()}...` : text;
      const banner = bannerFile ? await uploadFeedMedia(bannerFile, "article") : undefined;
    const input = { eyebrow: eyebrow.trim() || "PayMoment for AI Agents", title: cleanTitle, description, contentHtml: editor.getHTML(), bannerMediaId: banner?.id ?? article?.bannerMediaId, bannerColor, bannerPosition };
      return post ? updateArticle(post.id, { ...input, draftVersion: article?.draftVersion ?? 1 }) : createArticle({ ...input, publish: true });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(postQueryKey(saved.id), saved);
      void queryClient.invalidateQueries({ queryKey: ["paymoment", "feed"] });
      toast.success(post ? "Article updated" : "Article published");
      onSaved(saved.id);
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "The article could not be saved."),
  });

  function readImage(file: File | undefined, onLoad: (source: string) => void) {
    if (!file || !file.type.startsWith("image/")) return toast.error("Choose an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5 MB");
    const reader = new FileReader();
    reader.onload = () => onLoad(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);
    saveArticle.mutate();
  }

  function applyLink() {
    const href = linkUrl.trim();
    if (!href || !editor) return;
    const selection = linkSelection.current ?? editor.state.selection;
    if (selection.from === selection.to) {
      toast.error("Select the text you want to link first");
      return;
    }
    editor.chain().focus().setTextSelection(selection).setLink({ href }).run();
    linkSelection.current = null;
    setLinkUrl("");
  }

  return (
    <main className="py-5 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" className="size-10 rounded-full" onClick={onBack} aria-label="Back">
            <Icon icon="solar:arrow-left-linear" className="size-5" aria-hidden="true" />
          </Button>
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Article studio</p><h1 className="text-2xl font-semibold tracking-[-0.03em]">{post ? "Edit article" : "Write an article"}</h1></div>
        </header>

        <form onSubmit={submit} className="overflow-hidden rounded-2xl border bg-card/45">
          <div className="space-y-5 p-5 sm:p-8">
            <div className="space-y-1.5"><label htmlFor="article-eyebrow" className="text-sm font-semibold">Eyebrow</label><Input id="article-eyebrow" value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} maxLength={80} placeholder="PayMoment for AI Agents" /></div>
            <div className="space-y-1.5"><label htmlFor="article-title" className="text-sm font-semibold">Title</label><Input id="article-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Give your agent a wallet it can actually use." className="h-14 text-xl font-medium" autoFocus /></div>
            <div className="space-y-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Article banner</p><p className="text-xs text-muted-foreground">Add a cover image and choose its visual position.</p></div><input ref={bannerInput} type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; readImage(file, setBannerImage); setBannerFile(file); }} /><Button type="button" variant="outline" className="h-10 rounded-full" onClick={() => bannerInput.current?.click()}><Icon icon="solar:gallery-add-linear" className="size-4" aria-hidden="true" /> {bannerImage ? "Change image" : "Add image"}</Button></div><div className="relative h-36 overflow-hidden rounded-xl border" style={{ backgroundColor: bannerColor, backgroundImage: bannerImage ? `url(${bannerImage})` : undefined, backgroundPosition: bannerPosition, backgroundSize: "cover" }}><div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /><span className="absolute bottom-3 left-3 text-xs font-medium text-white">Banner preview</span></div><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-xs text-muted-foreground">Banner color <input type="color" value={bannerColor} onChange={(event) => setBannerColor(event.target.value)} className="size-8 cursor-pointer rounded-md border-0 bg-transparent p-0" /></label><label className="flex items-center gap-2 text-xs text-muted-foreground">Position <select value={bannerPosition} onChange={(event) => setBannerPosition(event.target.value as typeof bannerPosition)} className="h-9 rounded-lg border bg-background px-2 text-xs text-foreground"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label></div></div>
            <div className="overflow-x-auto rounded-xl border bg-background/70 [&_.tableWrapper]:my-5 [&_.tableWrapper]:overflow-x-auto [&_table]:!border [&_table]:!border-white/35 [&_th]:!border [&_th]:!border-white/35 [&_th]:!bg-primary/10 [&_td]:!border [&_td]:!border-white/35">
              <div className="sticky top-3 z-10 mx-2 mt-2 flex flex-wrap items-center gap-0.5 rounded-xl border bg-popover/95 p-1.5 shadow-lg backdrop-blur-xl">
                <select aria-label="Text style" defaultValue="text" onChange={(event) => event.target.value === "heading" ? editor?.chain().focus().toggleHeading({ level: 2 }).run() : editor?.chain().focus().setParagraph().run()} className="h-9 rounded-lg bg-transparent px-2 text-sm font-medium text-foreground outline-none hover:bg-muted"><option value="text">Text</option><option value="heading">Heading</option></select>
                <ToolbarButton label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>B</ToolbarButton>
                <ToolbarButton label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
                <ToolbarButton label="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}><s>S</s></ToolbarButton>
                <ToolbarButton label="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></ToolbarButton>
                <ToolbarButton label="Heading" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
                <ToolbarButton label="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
                <ToolbarButton label="Ordered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<ToolbarButton label="Text alignment" active={editor?.isActive({ textAlign: "center" }) || editor?.isActive({ textAlign: "right" })} onClick={() => undefined}><Icon icon={editor?.isActive({ textAlign: "center" }) ? "solar:align-horizontal-center-linear" : editor?.isActive({ textAlign: "right" }) ? "solar:align-right-linear" : "solar:align-left-linear"} className="size-4" aria-hidden="true" /></ToolbarButton>} />
                  <DropdownMenuContent align="start" className="w-40 p-1">
                    <DropdownMenuItem onClick={() => editor?.chain().focus().setTextAlign("left").run()}><Icon icon="solar:align-left-linear" aria-hidden="true" /> Align left</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor?.chain().focus().setTextAlign("center").run()}><Icon icon="solar:align-horizontal-center-linear" aria-hidden="true" /> Align center</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor?.chain().focus().setTextAlign("right").run()}><Icon icon="solar:align-right-linear" aria-hidden="true" /> Align right</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <label className="grid min-h-9 cursor-pointer place-items-center rounded-md px-2 text-xs font-semibold text-muted-foreground hover:bg-muted" aria-label="Text color">A<input type="color" className="sr-only" defaultValue="#B8A2FF" onChange={(event) => editor?.chain().focus().setColor(event.target.value).run()} /></label>
                <label className="grid min-h-9 cursor-pointer place-items-center rounded-md bg-yellow-300/20 px-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-300/30" aria-label="Highlight color">HL<input type="color" className="sr-only" defaultValue="#8056E8" onChange={(event) => editor?.chain().focus().toggleHighlight({ color: event.target.value }).run()} /></label>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<ToolbarButton label="Link" active={editor?.isActive("link")} onClick={() => { if (editor) linkSelection.current = { from: editor.state.selection.from, to: editor.state.selection.to }; }}><Icon icon="solar:link-linear" className="size-4" aria-hidden="true" /></ToolbarButton>} />
                  <DropdownMenuContent align="start" className="w-72 space-y-2 p-3">
                    <label htmlFor="article-link-url" className="text-xs font-semibold">Link URL</label>
                    <div className="flex gap-2"><Input id="article-link-url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" type="url" inputMode="url" autoComplete="url" className="h-9 min-w-0" /><Button type="button" className="h-9 shrink-0 px-3" onClick={applyLink} disabled={!linkUrl.trim()}>Apply</Button></div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {editor?.isActive("image") && <><span className="px-1 text-[11px] text-muted-foreground">Image</span>{["25%", "50%", "75%", "100%"].map((width) => <ToolbarButton key={width} label={`Set image width ${width}`} active={editor.getAttributes("image").width === width} onClick={() => editor.chain().focus().updateAttributes("image", { width }).run()}>{width}</ToolbarButton>)}</>}
                <ToolbarButton label="Insert table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</ToolbarButton>
                <input ref={inlineImageInput} type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { toast.error("Choose an image under 5 MB"); return; } void uploadFeedMedia(file, "article").then((media) => editor?.chain().focus().setImage({ src: media.gatewayUrl, alt: "Article image" }).run()).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "The image could not be uploaded.")); }} />
                <ToolbarButton label="Insert image" onClick={() => inlineImageInput.current?.click()}><Icon icon="solar:gallery-add-linear" className="size-4" aria-hidden="true" /></ToolbarButton>
                <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>↶</ToolbarButton>
                <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>↷</ToolbarButton>
              </div>
              <EditorContent editor={editor} />
            </div>
            <p className="text-xs text-muted-foreground">Use headings and lists to make longer articles easy to scan.</p>
          </div>
          {submitError && <p role="alert" className="px-4 text-sm text-destructive sm:px-8">{submitError}</p>}
          <footer className="flex flex-col-reverse gap-2 border-t bg-background/35 p-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" className="h-11 rounded-full px-5" onClick={onBack}>Cancel</Button>
            <Button type="submit" className="h-11 rounded-full px-6" disabled={!title.trim() || !editor?.getText().trim() || saveArticle.isPending} aria-busy={saveArticle.isPending}>{saveArticle.isPending ? "Saving..." : post ? "Save changes" : "Publish article"}</Button>
          </footer>
        </form>
      </div>
    </main>
  );
}

function ToolbarButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} aria-pressed={active} onClick={onClick} className={`min-h-9 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{children}</button>;
}

function AccessMessage({ title = "Article studio is for verified users", description = "Verify your PayMoment account to publish and edit articles.", onBack }: { title?: string; description?: string; onBack: () => void }) {
  return <section className="mx-auto mt-12 max-w-lg rounded-2xl border bg-card/50 p-8 text-center"><Icon icon="solar:lock-keyhole-linear" className="mx-auto size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><Button type="button" variant="outline" className="mt-5 h-10 rounded-full px-5" onClick={onBack}>Go back</Button></section>;
}

"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/modules/auth/hooks/useSession";
import { getDiscoverData } from "@/modules/discover/services/discover.service";
import { AuthorAvatar, VerifiedMark } from "@/modules/feed";
import { uploadFeedMedia } from "@/modules/feed/services/feed.service";
import { cn } from "@/lib/utils";
import { sendRealtimeCommand } from "@/modules/shell/services/realtime.client";
import { useMessagesContext } from "../context/MessagesContext";
import { useConversationMessages, useCreateMessageRequest, useIncomingMessageRequests, useMarkConversationRead, useMessages, useRespondToMessageRequest, useSendConversationMessage } from "../hooks/useMessages";

function formatTime(value: string) { return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export function MessagesView() {
  const conversations = useMessages();
  const session = useSession();
  const { activeId, setActiveId } = useMessagesContext();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [typingByConversation, setTypingByConversation] = useState<Record<string, string[]>>({});
  const [presenceByConversation, setPresenceByConversation] = useState<Record<string, "available" | "away">>({});
  const endRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef(false);
  const createMessageRequest = useCreateMessageRequest();
  const { mutate: markConversationRead } = useMarkConversationRead();
  const sendMessage = useSendConversationMessage();
  const filtered = (conversations.data ?? []).filter((item) => `${item.user.name} ${item.user.handle}`.toLowerCase().includes(search.toLowerCase()));
  const active = (conversations.data ?? []).find((item) => item.id === activeId) ?? filtered[0];
  const messages = useConversationMessages(active?.id ?? "");
  const recipients = useQuery({ queryKey: ["paymoment", "message-recipients", recipientSearch], queryFn: () => getDiscoverData(recipientSearch, "people"), enabled: newOpen });
  const chronological = useMemo(() => messages.data?.pages.flatMap((page) => page.messages).reverse() ?? [], [messages.data]);
  const activeTyping = active ? typingByConversation[active.id] ?? [] : [];
  const activePresence = active ? presenceByConversation[active.id] : undefined;

  useEffect(() => { if (active && active.id !== activeId) setActiveId(active.id); }, [active, activeId, setActiveId]);
  useEffect(() => { if (active?.id && active.unread) markConversationRead(active.id); }, [active?.id, active?.unread, markConversationRead]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [active?.id, chronological.length]);
  useEffect(() => {
    if (!active?.id) return;
    if (!draft.trim()) {
      if (typingRef.current) sendRealtimeCommand({ type: "typing.set", conversation_id: active.id, is_typing: false });
      typingRef.current = false;
      return;
    }
    if (!typingRef.current) sendRealtimeCommand({ type: "typing.set", conversation_id: active.id, is_typing: true });
    typingRef.current = true;
    const timeout = window.setTimeout(() => {
      sendRealtimeCommand({ type: "typing.set", conversation_id: active.id, is_typing: false });
      typingRef.current = false;
    }, 2_500);
    return () => window.clearTimeout(timeout);
  }, [active?.id, draft]);
  useEffect(() => () => {
    if (active?.id && typingRef.current) sendRealtimeCommand({ type: "typing.set", conversation_id: active.id, is_typing: false });
  }, [active?.id]);
  useEffect(() => {
    const onRealtime = (event: Event) => {
      const payload = (event as CustomEvent<{ type?: string; data?: { conversation_id?: string; user_id?: string; is_typing?: boolean; status?: "available" | "away" } }>).detail;
      const conversationId = payload?.data?.conversation_id;
      const userId = payload?.data?.user_id;
      if (!conversationId || !userId) return;
      if (payload.type === "typing.updated") {
        setTypingByConversation((current) => ({ ...current, [conversationId]: payload.data?.is_typing ? [...new Set([...(current[conversationId] ?? []), userId])] : (current[conversationId] ?? []).filter((id) => id !== userId) }));
        if (payload.data?.is_typing) window.setTimeout(() => setTypingByConversation((current) => ({ ...current, [conversationId]: (current[conversationId] ?? []).filter((id) => id !== userId) })), 3_000);
      }
      if (payload.type === "presence.updated" && payload.data?.status) setPresenceByConversation((current) => ({ ...current, [conversationId]: payload.data!.status! }));
    };
    window.addEventListener("paymoment:realtime", onRealtime);
    return () => window.removeEventListener("paymoment:realtime", onRealtime);
  }, []);
  useEffect(() => { if (active?.id) sendRealtimeCommand({ type: "presence.set", conversation_id: active.id, status: "available" }); }, [active?.id]);

  async function attach(file?: File) {
    if (!file) return;
    setUploading(true);
    try { const media = await uploadFeedMedia(file, "message"); setAttachmentIds((current) => [...current, media.id]); }
    catch (error) { toast.error(error instanceof Error ? error.message : "The attachment could not be uploaded."); }
    finally { setUploading(false); }
  }

  if (conversations.isLoading) return <div className="grid h-full min-h-0 gap-3 md:grid-cols-[17rem_1fr]" aria-label="Loading messages"><Skeleton className="h-full min-h-0 rounded-xl" /><Skeleton className="h-full min-h-0 rounded-xl" /></div>;
  if (conversations.isError) return <ErrorState message={conversations.error.message} retry={() => void conversations.refetch()} />;

  return <div className="flex h-full min-h-0 flex-col gap-3">
    <MessageRequestsButton onAccepted={setActiveId} />
    {active && (activeTyping.length > 0 || activePresence) && <p role="status" className="text-right text-xs text-muted-foreground">{activeTyping.length > 0 ? `${active.user.name} is typing...` : activePresence === "available" ? `${active.user.name} is available` : `${active.user.name} is away`}</p>}
    <section className="grid min-h-0 flex-1 grid-rows-[12rem_minmax(0,1fr)] overflow-hidden rounded-xl border bg-card/55 md:grid-cols-[17rem_minmax(0,1fr)] md:grid-rows-1">
      <aside className="flex min-h-0 flex-col border-b md:border-b-0 md:border-r"><div className="shrink-0 border-b p-3"><div className="flex items-center justify-between"><h2 className="font-semibold">Messages</h2><Button variant="ghost" size="icon" className="size-10 rounded-full" aria-label="New message" onClick={() => setNewOpen(true)}><Icon icon="solar:pen-new-square-linear" className="size-5" /></Button></div><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" autoComplete="off" className="mt-2 h-10" /></div><div className="min-h-0 flex-1 overflow-y-auto p-2">{filtered.map((conversation) => <button key={conversation.id} type="button" onClick={() => setActiveId(conversation.id)} className={cn("flex min-h-12 w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active?.id === conversation.id && "bg-secondary")}><AuthorAvatar author={conversation.user} className="size-10" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1"><p className="truncate text-sm font-medium">{conversation.user.name}</p>{conversation.user.verified && <VerifiedMark />}</div><p className="truncate text-xs text-muted-foreground">{conversation.lastMessage?.body || "No messages yet"}</p></div>{conversation.unread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</button>)}{!filtered.length && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No conversations found.</p>}</div></aside>
      {active ? <div className="flex min-h-0 min-w-0 flex-col"><header className="flex shrink-0 items-center gap-3 border-b p-3"><AuthorAvatar author={active.user} className="size-10" /><div><div className="flex items-center gap-1"><p className="text-sm font-semibold">{active.user.name}</p>{active.user.verified && <VerifiedMark />}</div><p className="text-xs text-muted-foreground">@{active.user.handle}</p></div></header><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{messages.isLoading ? <Skeleton className="h-40 w-full" /> : messages.isError ? <ErrorState message={messages.error.message} retry={() => void messages.refetch()} /> : <div className="space-y-3">{messages.hasNextPage && <Button variant="outline" size="sm" className="mx-auto flex" onClick={() => void messages.fetchNextPage()} disabled={messages.isFetchingNextPage}>{messages.isFetchingNextPage ? "Loading" : "Load earlier messages"}</Button>}{chronological.map((message) => { const mine = message.senderId === session.data?.id || message.senderId === "__self__"; return <div key={message.id} className={cn("w-fit max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-5", mine ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary")}><p>{message.body}</p>{message.attachments.map((attachment) => attachment.url ? <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 rounded-lg bg-background/15 p-2 text-xs underline"><Icon icon={attachment.mimeType.startsWith("image/") ? "solar:gallery-linear" : "solar:file-linear"} className="size-4" />Open attachment</a> : <p key={attachment.id} className="mt-1 text-xs opacity-70">Uploading attachment…</p>)}<p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(message.createdAt)}</p></div>; })}<div ref={endRef} /></div>}</div><form className="shrink-0 border-t p-3" onSubmit={(event) => { event.preventDefault(); const body = draft.trim(); if (!body && !attachmentIds.length) return; sendMessage.mutate({ conversationId: active.id, body, mediaAssetIds: attachmentIds }, { onSuccess: () => { setDraft(""); setAttachmentIds([]); }, onError: (error) => toast.error(error.message) }); }}><div className="flex items-center gap-2"><label className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-secondary" aria-label="Attach a file"><Icon icon="solar:paperclip-linear" className="size-5" /><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="sr-only" disabled={uploading} onChange={(event) => { void attach(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label><Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message" autoComplete="off" className="h-11" /><Button type="submit" size="icon" disabled={sendMessage.isPending || uploading || (!draft.trim() && !attachmentIds.length)} className="size-11 shrink-0 rounded-full" aria-label="Send message"><Icon icon="solar:plain-bold" className="size-5" /></Button></div>{attachmentIds.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{attachmentIds.length} attachment{attachmentIds.length === 1 ? "" : "s"} ready to send.</p>}</form></div> : <EmptyMessages onNew={() => setNewOpen(true)} />}
    </section>
    <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent className="bg-popover"><DialogHeader><DialogTitle>New message request</DialogTitle><DialogDescription>Choose someone to ask for permission to start a private conversation.</DialogDescription></DialogHeader><Input value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} placeholder="Search people" autoComplete="off" />{recipients.isLoading ? <Skeleton className="h-24" /> : <div className="max-h-72 space-y-1 overflow-y-auto">{(recipients.data?.people ?? []).map((person) => <button key={person.id} type="button" disabled={createMessageRequest.isPending} className="flex min-h-12 w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-secondary disabled:opacity-60" onClick={() => createMessageRequest.mutate(person.id, { onSuccess: () => { toast.success("Message request sent"); setNewOpen(false); }, onError: (error) => toast.error(error.message) })}><AuthorAvatar author={person} className="size-9" /><span className="text-sm font-medium">{person.name}</span><span className="ml-auto text-xs text-muted-foreground">@{person.handle}</span></button>)}{!recipients.data?.people.length && <p className="py-6 text-center text-sm text-muted-foreground">No people found.</p>}</div>}</DialogContent></Dialog>
  </div>;
}

function EmptyMessages({ onNew }: { onNew: () => void }) { return <section className="rounded-xl border bg-card p-12 text-center"><Icon icon="solar:chat-round-line-linear" className="mx-auto size-10 text-primary" /><h2 className="mt-3 font-semibold">No conversations yet</h2><p className="mt-1 text-sm text-muted-foreground">Start a private conversation with someone you follow.</p><Button className="mt-4 h-10" onClick={onNew}>New message</Button></section>; }
function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <section className="rounded-xl border border-destructive/30 bg-card p-5"><p className="font-medium">Couldn&apos;t load messages</p><p className="mt-1 text-sm text-muted-foreground">{message}</p><Button variant="outline" className="mt-3 h-10" onClick={retry}>Try again</Button></section>; }

function MessageRequestsButton({ onAccepted }: { onAccepted: (conversationId: string) => void }) {
  const requests = useIncomingMessageRequests();
  const respond = useRespondToMessageRequest();
  const [open, setOpen] = useState(false);
  const pending = requests.data ?? [];
  return <><div className="flex justify-end"><Button variant="outline" className="h-10 gap-2" onClick={() => setOpen(true)}><Icon icon="solar:inbox-in-linear" className="size-4" aria-hidden="true" />Message requests{pending.length ? <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{pending.length}</span> : null}</Button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-md bg-popover"><DialogHeader><DialogTitle>Message requests</DialogTitle><DialogDescription>Accept a request to start a private conversation.</DialogDescription></DialogHeader>{requests.isLoading ? <Skeleton className="h-20" /> : requests.isError ? <p role="alert" className="text-sm text-destructive">Could not load message requests.</p> : pending.length ? <div className="space-y-2">{pending.map((request) => <div key={request.id} className="flex items-center gap-3 rounded-lg border p-3"><AuthorAvatar author={request.requester} className="size-10" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{request.requester.name}</p><p className="truncate text-xs text-muted-foreground">@{request.requester.handle}</p></div><Button size="sm" className="h-9" disabled={respond.isPending} onClick={() => respond.mutate({ id: request.id, decision: "accept" }, { onSuccess: (result) => { if (result.conversation_id) onAccepted(result.conversation_id); setOpen(false); }, onError: (error) => toast.error(error.message) })}>Accept</Button><Button size="sm" variant="outline" className="h-9" disabled={respond.isPending} onClick={() => respond.mutate({ id: request.id, decision: "decline" }, { onError: (error) => toast.error(error.message) })}>Decline</Button></div>)}</div> : <p className="py-6 text-center text-sm text-muted-foreground">No pending message requests.</p>}</DialogContent></Dialog></>;
}

"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const defaultOptions = ["", ""];
export type PollDraft = { question: string; options: { id: string; label: string; voterIds: string[] }[] };

export function PollComposerDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (poll: PollDraft) => void }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(defaultOptions);

  function reset() {
    setQuestion("");
    setOptions(defaultOptions);
  }

  function close(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanOptions = options.map((option) => option.trim()).filter(Boolean);
    if (!question.trim() || cleanOptions.length < 2) {
      toast.error("Add a question and at least two options");
      return;
    }
    const id = `poll-option-${crypto.randomUUID()}`;
    onCreated({ question: question.trim(), options: cleanOptions.map((label, index) => ({ id: `${id}-${index}`, label, voterIds: [] })) });
    reset();
    onOpenChange(false);
    toast.success("Poll added to your post");
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="border-border bg-popover sm:max-w-lg">
        <DialogHeader><DialogTitle>Create a community poll</DialogTitle><DialogDescription>Ask a focused question and see which option your community chooses.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><label htmlFor="poll-question" className="text-sm font-semibold">Question</label><Input id="poll-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={160} placeholder="What should we build next?" autoFocus /></div>
          <div className="space-y-2"><div className="flex items-center justify-between"><label className="text-sm font-semibold">Options</label><span className="text-xs text-muted-foreground">{options.length}/4</span></div>{options.map((option, index) => <div key={index} className="flex items-center gap-2"><Input aria-label={`Poll option ${index + 1}`} value={option} onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={`Option ${index + 1}`} maxLength={80} />{options.length > 2 && <Button type="button" variant="ghost" size="icon" className="size-10 shrink-0" aria-label={`Remove option ${index + 1}`} onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Icon icon="solar:trash-bin-trash-linear" className="size-4" aria-hidden="true" /></Button>}</div>)}{options.length < 4 && <Button type="button" variant="outline" className="h-10 rounded-full" onClick={() => setOptions((current) => [...current, ""])}><Icon icon="solar:add-circle-linear" className="size-4" aria-hidden="true" /> Add option</Button>}</div>
          <div className="flex justify-end"><Button type="submit" className="h-10 rounded-full px-5" disabled={!question.trim() || options.filter((option) => option.trim()).length < 2}>Publish poll</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

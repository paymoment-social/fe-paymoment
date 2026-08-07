"use client";

import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthorAvatar } from "@/modules/feed";
import { useProfileContext } from "../context/ProfileContext";
import type { ProfileData } from "../types";

export function EditProfileDialog({ profile, open, onOpenChange }: { profile: ProfileData; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { saveProfile } = useProfileContext();
  const [draft, setDraft] = useState(profile);
  const avatarInput = useRef<HTMLInputElement>(null);

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function chooseAvatar(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      toast.error("Choose an image smaller than 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("avatar", String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.name.trim();
    const handle = draft.handle.trim().replace(/^@/, "");
    if (!name || !handle || !draft.bio?.trim()) {
      toast.error("Name, username, and bio are required");
      return;
    }
    saveProfile({ ...draft, name, handle, bio: draft.bio.trim() });
    onOpenChange(false);
    toast.success("Profile updated");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(82dvh,44rem)] gap-0 overflow-hidden rounded-2xl border-border bg-popover p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4 pr-14">
          <DialogTitle className="text-lg font-semibold">Edit profile</DialogTitle>
          <DialogDescription>Shape how people discover and connect with you on PayMoment.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid min-h-0 grid-rows-[1fr_auto] overflow-hidden">
          <div className="overflow-y-auto px-5 py-2">
            <div className="flex items-center justify-between gap-4 border-b py-4">
              <div><p className="text-sm font-semibold">Profile photo</p><p className="mt-1 text-xs text-muted-foreground">PNG or JPG, up to 2 MB.</p></div>
              <button type="button" className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onClick={() => avatarInput.current?.click()} aria-label="Change profile photo">
                <AuthorAvatar author={draft} className="size-16 border-2 border-primary/30" />
                <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"><Icon icon="solar:camera-add-bold" className="size-4" aria-hidden="true" /></span>
              </button>
              <input ref={avatarInput} type="file" accept="image/*" className="sr-only" onChange={(event) => chooseAvatar(event.target.files?.[0])} />
            </div>

            <ProfileField label="Name" htmlFor="profile-name"><Input id="profile-name" name="name" autoComplete="name" maxLength={50} value={draft.name} onChange={(event) => update("name", event.target.value)} className="h-10 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0" /></ProfileField>
            <ProfileField label="Username" htmlFor="profile-handle"><div className="flex items-center"><span className="mr-1 text-muted-foreground">@</span><Input id="profile-handle" name="username" autoComplete="username" maxLength={30} value={draft.handle} onChange={(event) => update("handle", event.target.value.replace(/[^a-zA-Z0-9._]/g, ""))} className="h-10 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0" /></div></ProfileField>
            <ProfileField label="Bio" htmlFor="profile-bio"><Textarea id="profile-bio" name="bio" maxLength={160} rows={3} value={draft.bio ?? ""} onChange={(event) => update("bio", event.target.value)} className="min-h-20 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /><p className="text-right text-xs tabular-nums text-muted-foreground">{draft.bio?.length ?? 0}/160</p></ProfileField>
            <ProfileField label="Interests" htmlFor="profile-interests"><Input id="profile-interests" value={draft.interests} onChange={(event) => update("interests", event.target.value)} placeholder="AI, payments, product design" className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></ProfileField>
            <ProfileField label="Link" htmlFor="profile-link"><Input id="profile-link" type="url" inputMode="url" autoComplete="url" value={draft.website} onChange={(event) => update("website", event.target.value)} placeholder="https://your-site.com" className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></ProfileField>
            <ProfileField label="Location" htmlFor="profile-location"><Input id="profile-location" autoComplete="address-level2" value={draft.location} onChange={(event) => update("location", event.target.value)} className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></ProfileField>
          </div>

          <div className="border-t bg-background/35 p-4"><Button type="submit" className="h-12 w-full rounded-full bg-gradient-to-r from-primary to-violet-600 font-semibold text-primary-foreground hover:opacity-90">Save profile</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="border-b py-3"><label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label><div className="mt-1">{children}</div></div>;
}

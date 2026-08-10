"use client";

import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthorAvatar } from "@/modules/feed";
import { ApiError } from "@/lib/api/client";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import type { ProfileData } from "../types";

export function EditProfileDialog({ profile, open, onOpenChange }: { profile: ProfileData; open: boolean; onOpenChange: (open: boolean) => void }) {
  const saveProfile = useUpdateProfile();
  const [draft, setDraft] = useState(profile);
  const [formError, setFormError] = useState<string>();
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    const name = draft.name.trim();
    const handle = draft.handle.trim().replace(/^@/, "");
    if (!name || !handle) {
      setFormError("Name and username are required.");
      return;
    }
    try {
      await saveProfile.mutateAsync({ ...draft, name, handle, bio: draft.bio?.trim() ?? "" });
      onOpenChange(false);
      toast.success("Profile updated");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.fields.username ?? error.message : "Your profile could not be updated. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(90dvh,44rem)] max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl border-border bg-popover p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-5 py-4 pr-14">
          <DialogTitle className="text-lg font-semibold">Edit profile</DialogTitle>
          <DialogDescription>Shape how people discover and connect with you on PayMoment.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5">
            <div className="flex items-center justify-between gap-4 border-b py-5">
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
            <ProfileField label="Interests" htmlFor="profile-interests"><Input id="profile-interests" value={draft.interestSlugs.join(", ")} onChange={(event) => { const slugs = event.target.value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean); setDraft((current) => ({ ...current, interests: slugs.join(", "), interestSlugs: slugs })); }} placeholder="technology, design" className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /><p className="text-xs text-muted-foreground">Use interest slugs separated by commas.</p></ProfileField>
            <ProfileField label="Link" htmlFor="profile-link"><Input id="profile-link" type="url" inputMode="url" autoComplete="url" value={draft.website} onChange={(event) => update("website", event.target.value)} placeholder="https://your-site.com" className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></ProfileField>
            <ProfileField label="Location" htmlFor="profile-location"><Input id="profile-location" autoComplete="address-level2" value={draft.location} onChange={(event) => update("location", event.target.value)} className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></ProfileField>
          </div>

          <div className="shrink-0 border-t bg-background/90 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm">{formError && <p role="alert" className="mb-3 text-sm text-destructive">{formError}</p>}<Button type="submit" disabled={saveProfile.isPending} aria-busy={saveProfile.isPending} className="h-12 w-full rounded-full bg-gradient-to-r from-primary to-violet-600 font-semibold text-primary-foreground hover:opacity-90">{saveProfile.isPending ? "Saving..." : "Save profile"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-1.5 border-b py-4"><label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label><div>{children}</div></div>;
}

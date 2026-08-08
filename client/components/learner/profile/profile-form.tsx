"use client";

import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, updateProfile } from "@/services/auth.service";
import { removeAvatar } from "@/services/upload.service";

export function ProfileForm() {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone ?? "");
        setAvatarUrl(user.avatarUrl ?? null);
        updateUser(user);
      })
      .catch(() => setError("Failed to load your profile"))
      .finally(() => setLoading(false));
  }, [updateUser]);

  async function handleSave() {
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      const user = await updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      updateUser(user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-5">
      <p className="text-sm font-semibold">Profile info</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Your name and how we can reach you.
      </p>

      <div className="mt-5 space-y-5">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div>
          <label className="text-xs font-medium text-muted-foreground">Avatar</label>
          <div className="mt-1">
            <AvatarUpload
              userId={authUser?.id ?? ""}
              currentUrl={avatarUrl}
              onUploadComplete={(url) => {
                setAvatarUrl(url);
                if (authUser) updateUser({ ...authUser, avatarUrl: url });
              }}
              onRemove={async () => {
                await removeAvatar();
                setAvatarUrl(null);
                if (authUser) updateUser({ ...authUser, avatarUrl: null });
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="p-name" className="text-xs font-medium text-muted-foreground">
            Name
          </label>
          <input
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="p-email" className="text-xs font-medium text-muted-foreground">
            Email
          </label>
          <input
            id="p-email"
            value={email}
            disabled
            className="mt-1 block w-full cursor-not-allowed rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Email cannot be changed.</p>
        </div>

        <div>
          <label htmlFor="p-phone" className="text-xs font-medium text-muted-foreground">
            Phone
          </label>
          <input
            id="p-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-5">
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="size-3.5" />
            Saved
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        >
          <Save className="size-3.5" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

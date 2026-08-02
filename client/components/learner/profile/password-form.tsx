"use client";

import { useState } from "react";
import { KeyRound, Check } from "lucide-react";
import { changePassword } from "@/services/auth.service";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!currentPassword) {
      setError("Enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col rounded-xl border bg-card p-5">
      <p className="text-sm font-semibold">Password</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Update your password to keep your account secure.
      </p>

      <div className="mt-5 space-y-5">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && (
          <p className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="size-3.5" />
            Password changed
          </p>
        )}

        <div>
          <label htmlFor="pw-current" className="text-xs font-medium text-muted-foreground">
            Current password
          </label>
          <input
            id="pw-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="pw-new" className="text-xs font-medium text-muted-foreground">
            New password
          </label>
          <input
            id="pw-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">At least 6 characters</p>
        </div>

        <div>
          <label htmlFor="pw-confirm" className="text-xs font-medium text-muted-foreground">
            Confirm new password
          </label>
          <input
            id="pw-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <button
          type="submit"
          disabled={saving}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        >
          <KeyRound className="size-3.5" />
          {saving ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}

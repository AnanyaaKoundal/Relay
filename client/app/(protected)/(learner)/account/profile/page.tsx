"use client";

import { UserRound } from "lucide-react";
import { ProfileForm } from "@/components/learner/profile/profile-form";
import { PasswordForm } from "@/components/learner/profile/password-form";

export default function ProfileSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account details and password
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm />
        <PasswordForm />
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <UserRound className="size-3.5" />
        Account settings are applied to all devices.
      </div>
    </div>
  );
}

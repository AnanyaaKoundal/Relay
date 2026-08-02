"use client";

import { AtSign, Link, Code, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InstructorProfile } from "@/types/studio.types";

type PreviewProps = {
  profile: InstructorProfile;
  headline: string;
  bio: string;
  expertise: string;
  twitter: string;
  linkedin: string;
  github: string;
  website: string;
};

const SOCIALS: { key: "twitter" | "linkedin" | "github" | "website"; icon: LucideIcon }[] = [
  { key: "twitter", icon: AtSign },
  { key: "linkedin", icon: Link },
  { key: "github", icon: Code },
  { key: "website", icon: Globe },
];

export function InstructorPreview({
  profile,
  headline,
  bio,
  expertise,
  twitter,
  linkedin,
  github,
  website,
}: PreviewProps) {
  const initial = profile.name?.charAt(0)?.toUpperCase() ?? "U";
  const expertiseTags = expertise
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const handles: Record<"twitter" | "linkedin" | "github" | "website", string> = {
    twitter,
    linkedin,
    github,
    website,
  };

  const activeSocials = SOCIALS.filter((s) => handles[s.key]);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-chart-1/10 text-lg font-semibold text-chart-1">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{profile.name ?? "Instructor"}</p>
          <p className="text-xs text-muted-foreground">Instructor on Relay</p>
        </div>
      </div>

      {headline || bio || expertiseTags.length > 0 || activeSocials.length > 0 ? (
        <div className="mt-5 space-y-4">
          {headline && <p className="text-sm font-medium text-foreground">{headline}</p>}
          {bio && <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>}
          {expertiseTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {expertiseTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {activeSocials.length > 0 && (
            <div className="flex gap-4 border-t pt-4">
              {activeSocials.map(({ key, icon: Icon }) => (
                <span key={key} className="text-muted-foreground" title={key}>
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Your profile preview will appear here as you type.
        </p>
      )}
    </div>
  );
}

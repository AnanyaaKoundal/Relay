"use client";

import { AtSign, Link as LinkIcon, Code, Globe } from "lucide-react";
import type { InstructorProfilePublic } from "@/types/course.types";

const SOCIALS: { key: "twitter" | "linkedin" | "github" | "website"; icon: typeof Globe }[] = [
  { key: "twitter", icon: AtSign },
  { key: "linkedin", icon: LinkIcon },
  { key: "github", icon: Code },
  { key: "website", icon: Globe },
];

type Props = {
  name: string;
  profile?: InstructorProfilePublic | null;
};

export function InstructorCard({ name, profile }: Props) {
  const initial = name.charAt(0)?.toUpperCase() ?? "U";
  const expertiseTags = (profile?.expertise ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const activeSocials = SOCIALS.filter((s) => profile?.[s.key]);

  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-6 sm:flex-row">
      <div className="flex shrink-0 items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-chart-1/10 text-xl font-semibold text-chart-1">
          {initial}
        </div>
        <div className="sm:hidden">
          <p className="font-semibold">{name}</p>
          {profile?.headline && <p className="text-sm text-muted-foreground">{profile.headline}</p>}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="hidden text-base font-semibold sm:block">{name}</p>
        {profile?.headline && <p className="hidden text-sm text-muted-foreground sm:block">{profile.headline}</p>}

        {profile?.bio && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}

        {expertiseTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {expertiseTags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {activeSocials.length > 0 && (
          <div className="mt-4 flex gap-4 border-t pt-4 text-muted-foreground">
            {activeSocials.map(({ key, icon: Icon }) => (
              <span key={key} className="inline-flex items-center gap-1.5 text-xs" title={key}>
                <Icon className="size-4" />
                {profile?.[key]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

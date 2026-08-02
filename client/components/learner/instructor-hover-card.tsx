"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const POPOVER_WIDTH = 288;

export function InstructorHoverCard({ name, profile }: Props) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const hasContent = Boolean(
    profile &&
      (profile.headline || profile.bio || profile.expertise || profile.twitter ||
        profile.linkedin || profile.github || profile.website),
  );

  const position = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8));
    setPos({ top: rect.bottom + 8, left });
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    position();
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [open, position]);

  if (!profile || !hasContent) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {name}
      </span>
    );
  }

  const initial = name.charAt(0)?.toUpperCase() ?? "U";
  const expertiseTags = (profile.expertise ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const activeSocials = SOCIALS.filter((s) => profile[s.key]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
        onMouseEnter={() => {
          cancelClose();
          position();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <span className="flex size-4 items-center justify-center rounded-full bg-chart-1/10 text-[9px] font-semibold text-chart-1">
          {initial}
        </span>
        {name}
      </span>

      {open && pos && createPortal(
        <div
          role="tooltip"
          className="fixed z-50 rounded-xl border bg-popover p-4 shadow-lg"
          style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-chart-1/10 text-sm font-semibold text-chart-1">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">Instructor on Relay</p>
            </div>
          </div>

          {profile.headline && <p className="mt-3 text-xs font-medium">{profile.headline}</p>}
          {profile.bio && <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{profile.bio}</p>}

          {expertiseTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {expertiseTags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {activeSocials.length > 0 && (
            <div className="mt-3 flex gap-3 border-t pt-3 text-muted-foreground">
              {activeSocials.map(({ key, icon: Icon }) => (
                <Icon key={key} className="size-3.5" />
              ))}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

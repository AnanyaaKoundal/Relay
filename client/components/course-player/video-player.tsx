"use client";

import { AlertCircle } from "lucide-react";

type VideoPlayerProps = {
  videoUrl: string | null;
  title: string;
};

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center aspect-video rounded-xl bg-muted p-8 text-center">
        <AlertCircle className="size-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No video available for this lesson yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black">
      <video
        src={videoUrl}
        controls
        className="w-full aspect-video"
        title={title}
      />
    </div>
  );
}

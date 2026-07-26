"use client";

import { AlertCircle, Play } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { useVideoPlayer } from "@/hooks/use-video-player";
import { ControlBar } from "./ControlBar";

type VideoPlayerProps = {
  videoUrl: string | null;
  hlsUrl: string | null;
  processingStatus?: string;
  title: string;
};

export function VideoPlayer({
  videoUrl,
  hlsUrl,
  processingStatus,
  title,
}: VideoPlayerProps) {
  const player = useVideoPlayer({ videoUrl, hlsUrl, processingStatus });

  if (processingStatus === "PROCESSING" || processingStatus === "PENDING") {
    return (
      <div className="flex flex-col items-center justify-center aspect-video rounded-xl bg-muted p-8 text-center">
        <Spinner size="8" className="text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Video is being processed. It will be available shortly.
        </p>
      </div>
    );
  }

  if (!player.resolvedHls && !player.resolvedMp4) {
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
    <div className="space-y-2">
      {player.hlsFailed && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="size-3.5 shrink-0" />
          HD streaming is unavailable. Playing standard quality.
        </div>
      )}

      <div
        ref={player.containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-black group"
        onMouseMove={player.resetHideTimer}
        onMouseLeave={() => {
          if (!player.settingsMenu) player.setSettingsMenu(null);
        }}
      >
        <video
          ref={player.videoRef}
          className="w-full aspect-video cursor-pointer"
          title={title}
          onClick={player.togglePlay}
        />

        {/* Big play button when paused */}
        {!player.playing && (
          <button
            type="button"
            onClick={player.togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="size-8 text-white fill-white ml-1" />
            </div>
          </button>
        )}

        <ControlBar
          playing={player.playing}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          muted={player.muted}
          isFullscreen={player.isFullscreen}
          showControls={player.showControls}
          settingsMenu={player.settingsMenu}
          setSettingsMenu={player.setSettingsMenu}
          levels={player.levels}
          currentLevel={player.currentLevel}
          isAuto={player.isAuto}
          playbackRate={player.playbackRate}
          inPip={player.inPip}
          resetHideTimer={player.resetHideTimer}
          togglePlay={player.togglePlay}
          toggleMute={player.toggleMute}
          handleSeek={player.handleSeek}
          handleVolume={player.handleVolume}
          toggleFullscreen={player.toggleFullscreen}
          selectLevel={player.selectLevel}
          selectSpeed={player.selectSpeed}
          togglePip={player.togglePip}
        />
      </div>
    </div>
  );
}

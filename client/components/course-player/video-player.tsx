"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  ChevronLeft,
} from "lucide-react";
import { resolveUrl } from "@/lib/utils";

type VideoPlayerProps = {
  videoUrl: string | null;
  hlsUrl: string | null;
  processingStatus?: string;
  title: string;
};

type QualityLevel = {
  height: number;
  bitrate: number;
  label: string;
};

type SettingsMenu = null | "main" | "quality" | "speed";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function VideoPlayer({
  videoUrl,
  hlsUrl,
  processingStatus,
  title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settingsMenu, setSettingsMenu] = useState<SettingsMenu>(null);

  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isAuto, setIsAuto] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [inPip, setInPip] = useState(false);

  const hlsFailed = processingStatus === "FAILED";
  const resolvedHls = hlsFailed ? null : resolveUrl(hlsUrl);
  const resolvedMp4 = resolveUrl(videoUrl);

  // ─── HLS setup ───
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!resolvedHls && !resolvedMp4) return;

    if (resolvedHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.loadSource(resolvedHls);
      hls.attachMedia(video);

      let recoveryAttempts = 0;

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setLevels(
          data.levels.map((l) => ({
            height: l.height || 0,
            bitrate: l.bitrate,
            label: (l.height || 0) > 0 ? `${l.height}p` : "Auto",
          })),
        );
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentLevel(data.level);
        setIsAuto(hls.autoLevelEnabled);
        recoveryAttempts = 0;
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          if (recoveryAttempts < 2) {
            hls.recoverMediaError();
            recoveryAttempts++;
          } else {
            hls.destroy();
          }
        } else {
          hls.destroy();
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
        setLevels([]);
        setCurrentLevel(-1);
        setIsAuto(true);
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl") && resolvedHls) {
      video.src = resolvedHls;
      return;
    }

    if (resolvedMp4) {
      video.src = resolvedMp4;
    }
  }, [resolvedHls, resolvedMp4]);

  // ─── Video event listeners ───
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const onRateChange = () => setPlaybackRate(video.playbackRate);
    const onEnterPip = () => setInPip(true);
    const onLeavePip = () => setInPip(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("ratechange", onRateChange);
    video.addEventListener("enterpictureinpicture", onEnterPip);
    video.addEventListener("leavepictureinpicture", onLeavePip);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("ratechange", onRateChange);
      video.removeEventListener("enterpictureinpicture", onEnterPip);
      video.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, []);

  // ─── Fullscreen change listener ───
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ─── Auto-hide controls ───
  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    if (playing && !settingsMenu) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing, settingsMenu]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [playing, settingsMenu, resetHideTimer]);

  // ─── Close settings on click outside ───
  useEffect(() => {
    if (!settingsMenu) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-settings-popup]")) {
        setSettingsMenu(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [settingsMenu]);

  // ─── Controls ───
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (v) v.currentTime = Number(e.target.value);
  }, []);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (v) {
      v.volume = Number(e.target.value);
      if (v.muted && Number(e.target.value) > 0) v.muted = false;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
  }, []);

  const selectLevel = useCallback((levelIndex: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.nextLevel = levelIndex;
    setCurrentLevel(levelIndex);
    setIsAuto(levelIndex === -1);
  }, []);

  const selectSpeed = useCallback((speed: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
    setSettingsMenu("main");
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {
      // PiP not supported or denied
    }
  }, []);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          v.paused ? v.play() : v.pause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 5);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          v.muted = !v.muted;
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  if (processingStatus === "PROCESSING" || processingStatus === "PENDING") {
    return (
      <div className="flex flex-col items-center justify-center aspect-video rounded-xl bg-muted p-8 text-center">
        <Loader2 className="size-8 text-muted-foreground/50 mb-3 animate-spin" />
        <p className="text-sm text-muted-foreground">
          Video is being processed. It will be available shortly.
        </p>
      </div>
    );
  }

  if (!resolvedHls && !resolvedMp4) {
    return (
      <div className="flex flex-col items-center justify-center aspect-video rounded-xl bg-muted p-8 text-center">
        <AlertCircle className="size-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No video available for this lesson yet.
        </p>
      </div>
    );
  }

  const hasHlsLevels = levels.length > 1;
  const currentSpeedLabel = playbackRate === 1 ? "Normal" : `${playbackRate}x`;

  return (
    <div className="space-y-2">
      {hlsFailed && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="size-3.5 shrink-0" />
          HD streaming is unavailable. Playing standard quality.
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-black group"
        onMouseMove={resetHideTimer}
        onMouseLeave={() => {
          if (!settingsMenu) setShowControls(false);
        }}
      >
        <video
          ref={videoRef}
          className="w-full aspect-video cursor-pointer"
          title={title}
          onClick={togglePlay}
        />

        {/* Big play button when paused */}
        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="size-8 text-white fill-white ml-1" />
            </div>
          </button>
        )}

        {/* Bottom control bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-8 transition-opacity duration-300 ${showControls || !playing || settingsMenu ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 mb-2 rounded-full appearance-none bg-white/30 accent-primary cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />

          <div className="flex items-center gap-2 text-white text-xs">
            {/* Play/Pause */}
            <button type="button" onClick={togglePlay} className="p-1 hover:bg-white/10 rounded">
              {playing ? <Pause className="size-4" /> : <Play className="size-4 fill-white" />}
            </button>

            {/* Volume */}
            <button type="button" onClick={toggleMute} className="p-1 hover:bg-white/10 rounded">
              {muted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="w-16 h-1 rounded-full appearance-none bg-white/30 accent-white cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />

            {/* Time */}
            <span className="tabular-nums ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Settings gear */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsMenu(settingsMenu ? null : "main");
                }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Settings className="size-4" />
              </button>

              {/* Settings popup */}
              {settingsMenu && (
                <div
                  data-settings-popup
                  className="absolute bottom-full right-0 mb-2 min-w-50 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-white/10 text-white text-xs shadow-xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Main menu */}
                  {settingsMenu === "main" && (
                    <div className="p-1">
                      {hasHlsLevels && (
                        <button
                          type="button"
                          onClick={() => setSettingsMenu("quality")}
                          className="flex w-full items-center justify-between px-3 py-2 hover:bg-white/10 rounded"
                        >
                          <span>Quality</span>
                          <span className="text-white/50">
                            {isAuto ? "Auto" : levels[currentLevel]?.label ?? "Auto"}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSettingsMenu("speed")}
                        className="flex w-full items-center justify-between px-3 py-2 hover:bg-white/10 rounded"
                      >
                        <span>Playback speed</span>
                        <span className="text-white/50">{currentSpeedLabel}</span>
                      </button>
                      <button
                        type="button"
                        onClick={togglePip}
                        className="flex w-full items-center justify-between px-3 py-2 hover:bg-white/10 rounded"
                      >
                        <span>Picture-in-Picture</span>
                        <PictureInPicture2 className={`size-3.5 ${inPip ? "text-primary" : "text-white/50"}`} />
                      </button>
                    </div>
                  )}

                  {/* Quality submenu */}
                  {settingsMenu === "quality" && (
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => setSettingsMenu("main")}
                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/10 rounded"
                      >
                        <ChevronLeft className="size-3.5" />
                        <span>Quality</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { selectLevel(-1); setSettingsMenu("main"); }}
                        className={`flex w-full items-center justify-between px-3 py-2 hover:bg-white/10 rounded ${isAuto ? "text-primary font-medium" : ""
                          }`}
                      >
                        <span>Auto</span>
                        {isAuto && <span className="text-primary text-[10px]">&#10003;</span>}
                      </button>
                      {levels.map((level, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => { selectLevel(index); setSettingsMenu("main"); }}
                          className={`flex w-full items-center justify-between px-3 py-2 hover:bg-white/10 rounded ${currentLevel === index && !isAuto ? "text-primary font-medium" : ""
                            }`}
                        >
                          <span>{level.label}</span>
                          {currentLevel === index && !isAuto && (
                            <span className="text-primary text-[10px]">&#10003;</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Speed submenu */}
                  {settingsMenu === "speed" && (
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => setSettingsMenu("main")}
                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/10 rounded"
                      >
                        <ChevronLeft className="size-3.5" />
                        <span>Playback speed</span>
                      </button>
                      {SPEEDS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => selectSpeed(s)}
                          className={`flex w-full items-center justify-between px-3 py-2 hover:bg-white/10 rounded ${playbackRate === s ? "text-primary font-medium" : ""
                            }`}
                        >
                          <span>{s === 1 ? "Normal" : `${s}x`}</span>
                          {playbackRate === s && (
                            <span className="text-primary text-[10px]">&#10003;</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button type="button" onClick={toggleFullscreen} className="p-1 hover:bg-white/10 rounded">
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

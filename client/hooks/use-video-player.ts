"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { resolveUrl } from "@/lib/utils";

export type QualityLevel = {
  height: number;
  bitrate: number;
  label: string;
};

export type SettingsMenu = null | "main" | "quality" | "speed";

export const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function useVideoPlayer({
  videoUrl,
  hlsUrl,
  processingStatus,
}: {
  videoUrl: string | null;
  hlsUrl: string | null;
  processingStatus?: string;
}) {
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

  return {
    videoRef,
    containerRef,
    playing,
    currentTime,
    duration,
    volume,
    muted,
    isFullscreen,
    showControls,
    settingsMenu,
    setSettingsMenu,
    levels,
    currentLevel,
    isAuto,
    playbackRate,
    inPip,
    hlsFailed,
    resolvedHls,
    resolvedMp4,
    resetHideTimer,
    togglePlay,
    toggleMute,
    handleSeek,
    handleVolume,
    toggleFullscreen,
    selectLevel,
    selectSpeed,
    togglePip,
  };
}

"use client";

import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react";
import { formatTime } from "@/hooks/use-video-player";
import type { SettingsMenu } from "@/hooks/use-video-player";
import { SettingsPopup } from "./SettingsPopup";
import type { QualityLevel } from "@/hooks/use-video-player";

export function ControlBar({
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
  resetHideTimer,
  togglePlay,
  toggleMute,
  handleSeek,
  handleVolume,
  toggleFullscreen,
  selectLevel,
  selectSpeed,
  togglePip,
}: {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  settingsMenu: SettingsMenu;
  setSettingsMenu: (menu: SettingsMenu) => void;
  levels: QualityLevel[];
  currentLevel: number;
  isAuto: boolean;
  playbackRate: number;
  inPip: boolean;
  resetHideTimer: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVolume: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleFullscreen: () => void;
  selectLevel: (i: number) => void;
  selectSpeed: (s: number) => void;
  togglePip: () => void;
}) {
  return (
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

          <SettingsPopup
            settingsMenu={settingsMenu}
            setSettingsMenu={setSettingsMenu}
            levels={levels}
            currentLevel={currentLevel}
            isAuto={isAuto}
            playbackRate={playbackRate}
            inPip={inPip}
            selectLevel={selectLevel}
            selectSpeed={selectSpeed}
            togglePip={togglePip}
          />
        </div>

        {/* Fullscreen */}
        <button type="button" onClick={toggleFullscreen} className="p-1 hover:bg-white/10 rounded">
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </button>
      </div>
    </div>
  );
}

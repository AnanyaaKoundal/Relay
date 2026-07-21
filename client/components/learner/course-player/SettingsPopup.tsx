"use client";

import { ChevronLeft, PictureInPicture2 } from "lucide-react";
import type { QualityLevel, SettingsMenu } from "@/hooks/use-video-player";
import { SPEEDS } from "@/hooks/use-video-player";

export function SettingsPopup({
  settingsMenu,
  setSettingsMenu,
  levels,
  currentLevel,
  isAuto,
  playbackRate,
  inPip,
  selectLevel,
  selectSpeed,
  togglePip,
}: {
  settingsMenu: SettingsMenu;
  setSettingsMenu: (menu: SettingsMenu) => void;
  levels: QualityLevel[];
  currentLevel: number;
  isAuto: boolean;
  playbackRate: number;
  inPip: boolean;
  selectLevel: (i: number) => void;
  selectSpeed: (s: number) => void;
  togglePip: () => void;
}) {
  if (!settingsMenu) return null;

  const hasHlsLevels = levels.length > 1;
  const currentSpeedLabel = playbackRate === 1 ? "Normal" : `${playbackRate}x`;

  return (
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
  );
}

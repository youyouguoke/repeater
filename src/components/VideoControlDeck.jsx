import React from 'react';
import { Play, Pause, RotateCcw, SkipBack, ChevronLeft, ChevronRight } from 'lucide-react';
import { trackEvent, EVENTS } from '../lib/analytics';

const loopOptions = [
  { label: '1x', value: 1 },
  { label: '5x', value: 5 },
  { label: '10x', value: 10 },
  { label: '∞', value: Infinity },
];

const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

const quickLoopOptions = [
  { label: 'Last 3s', value: 3 },
  { label: 'Last 5s', value: 5 },
  { label: 'Last 10s', value: 10 },
];

const VideoControlDeck = ({
  isPlaying,
  onLoopPlay,
  loopCount,
  onLoopChange,
  speed,
  onSpeedChange,
  onReplaySegment,
  onResetRegion,
  onSetStart,
  onSetEnd,
  onStepFrame,
  onQuickLoop,
  regionStart,
  regionEnd,
  currentTime,
  duration,
}) => {
  const formatTime = (time) => {
    if (!time && time !== 0) return '00:00.0';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col gap-2 md:hidden">
        <div className="flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Looping</span>
          <span className="font-mono-utility text-mono-utility text-primary">
            {formatTime(regionStart)} → {formatTime(regionEnd)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Speed</span>
          <span className="font-mono-utility text-mono-utility">{speed}x</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Repeats</span>
          <span className="font-mono-utility text-mono-utility">{loopCount === Infinity ? '∞' : loopCount}</span>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Left: Status (desktop) + Frame Step */}
        <div className="space-y-3">
          {/* Desktop Status */}
          <div className="hidden md:flex bg-surface-container-low p-4 rounded-xl border border-outline-variant flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-label-sm font-label-sm text-on-surface-variant">Looping</span>
              <span className="font-mono-utility text-mono-utility text-primary">
                {formatTime(regionStart)} → {formatTime(regionEnd)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-label-sm font-label-sm text-on-surface-variant">Speed</span>
              <span className="font-mono-utility text-mono-utility">{speed}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-label-sm font-label-sm text-on-surface-variant">Repeats</span>
              <span className="font-mono-utility text-mono-utility">{loopCount === Infinity ? '∞' : loopCount}</span>
            </div>
          </div>

          {/* Frame Step - Video Unique Feature */}
          <div className="space-y-2">
            <p className="text-label-sm font-label-sm text-on-surface-variant">Frame Step</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onStepFrame(-1);
                  trackEvent(EVENTS.VIDEO_FRAME_STEP, { direction: 'backward' });
                }}
                className="flex-1 h-10 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Frame
              </button>
              <button
                onClick={() => {
                  onStepFrame(1);
                  trackEvent(EVENTS.VIDEO_FRAME_STEP, { direction: 'forward' });
                }}
                className="flex-1 h-10 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
              >
                Frame
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Loop - Video Unique Feature */}
          <div className="space-y-2">
            <p className="text-label-sm font-label-sm text-on-surface-variant">Quick Loop</p>
            <div className="flex gap-2">
              {quickLoopOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onQuickLoop(option.value);
                    trackEvent(EVENTS.VIDEO_QUICK_LOOP, { seconds: option.value });
                  }}
                  className="flex-1 h-10 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Main Actions */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onReplaySegment();
                trackEvent(EVENTS.REPLAY_SEGMENT);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-xl border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface"
              title="Replay segment"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onLoopPlay}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-primary text-on-primary hover:opacity-90'
                  : 'bg-primary-container text-on-primary-container hover:opacity-90'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>
            <button
              onClick={() => {
                onResetRegion();
                trackEvent(EVENTS.LOOP_RESET);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-xl border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface"
              title="Reset loop"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          </div>

          {/* Set A/B buttons */}
          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                onSetStart();
                trackEvent(EVENTS.LOOP_SET_START);
              }}
              className="flex-1 h-10 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
            >
              Set A ({formatTime(regionStart)})
            </button>
            <button
              onClick={() => {
                onSetEnd();
                trackEvent(EVENTS.LOOP_SET_END);
              }}
              className="flex-1 h-10 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
            >
              Set B ({formatTime(regionEnd)})
            </button>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-3">
          {/* Repeat Count */}
          <div className="space-y-2">
            <p className="text-label-sm font-label-sm text-on-surface-variant">Repeat Count</p>
            <div className="flex p-1 bg-surface-container-low rounded-lg border border-outline-variant">
              {loopOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    onLoopChange(option.value);
                    trackEvent(EVENTS.LOOP_COUNT_CHANGE, { count: option.label });
                  }}
                  className={`flex-1 py-2 text-label-sm font-label-sm rounded-md transition-all ${
                    loopCount === option.value
                      ? 'bg-white text-primary shadow-sm border border-outline-variant/10'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Playback Speed */}
          <div className="space-y-2">
            <p className="text-label-sm font-label-sm text-on-surface-variant">Playback Speed</p>
            <div className="flex p-1 bg-surface-container-low rounded-lg border border-outline-variant overflow-x-auto no-scrollbar">
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onSpeedChange(s);
                    trackEvent(EVENTS.SPEED_CHANGE, { speed: s + 'x' });
                  }}
                  className={`flex-1 min-w-[48px] py-2 text-label-sm font-label-sm rounded-md transition-all ${
                    speed === s
                      ? 'bg-white text-primary shadow-sm border border-outline-variant/10'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts - Hidden on mobile */}
      <div className="hidden md:block pt-3 border-t border-outline-variant">
        <div className="pt-3 flex items-center justify-center gap-6 text-[10px] text-on-surface-variant font-mono">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[9px] font-mono">Space</kbd>
            Play
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[9px] font-mono">A</kbd>
            Set A
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[9px] font-mono">B</kbd>
            Set B
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[9px] font-mono">R</kbd>
            Reset
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[9px] font-mono">← →</kbd>
            Frame
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoControlDeck;

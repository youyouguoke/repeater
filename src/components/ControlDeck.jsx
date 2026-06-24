import React from 'react';
import { Pause, Play, RotateCcw, SkipBack } from 'lucide-react';
import { trackEvent, EVENTS } from '../lib/analytics';

const ControlDeck = ({
  isPlaying,
  onLoopPlay,
  loopCount,
  currentLoop = 0,
  onLoopChange,
  speed,
  onSpeedChange,
  onReplaySegment,
  onResetRegion,
  onSetStart,
  onSetEnd,
  regionStart = "00:00.0",
  regionEnd = "00:00.0"
}) => {

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const loopOptions = [
    { value: 1, label: '1x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' },
    { value: Infinity, label: '∞' }
  ];

  return (
    <div className="space-y-3">
      {/* Top Row: Replay + Play + Reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onReplaySegment();
            trackEvent(EVENTS.REPLAY_SEGMENT);
          }}
          className="flex-1 h-10 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay
        </button>
        <button
          onClick={onLoopPlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0 ${
            isPlaying
              ? 'bg-primary text-on-primary hover:opacity-90'
              : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
        <button
          onClick={() => {
            onResetRegion();
            trackEvent(EVENTS.LOOP_RESET);
          }}
          className="flex-1 h-10 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
        >
          <SkipBack className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Mobile: Single Column / Desktop: Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left Column: Start + End (reordered on mobile via CSS) */}
        <div className="space-y-2 md:order-1">
          {/* Start */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant w-10 flex-shrink-0">Start</span>
            <div className="flex-1 bg-surface-container-low rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-on-surface">{regionStart}</span>
              <button
                onClick={() => {
                  onSetStart();
                  trackEvent(EVENTS.LOOP_SET_START);
                }}
                className="px-2 py-1 bg-surface-container-high border border-outline-variant rounded text-[10px] font-medium hover:bg-surface-container transition-colors"
              >
                Set A
              </button>
            </div>
          </div>
          {/* End - moved before Loop on mobile */}
          <div className="flex items-center gap-2 md:order-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant w-10 flex-shrink-0">End</span>
            <div className="flex-1 bg-surface-container-low rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-on-surface">{regionEnd}</span>
              <button
                onClick={() => {
                  onSetEnd();
                  trackEvent(EVENTS.LOOP_SET_END);
                }}
                className="px-2 py-1 bg-surface-container-high border border-outline-variant rounded text-[10px] font-medium hover:bg-surface-container transition-colors"
              >
                Set B
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Loop + Speed (reordered on mobile via CSS) */}
        <div className="space-y-2 md:order-2">
          {/* Loop - moved after End on mobile */}
          <div className="flex items-center gap-2 md:order-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant w-10 flex-shrink-0">Loop</span>
            <div className="flex-1 bg-surface-container-low rounded-lg p-2 grid grid-cols-4 gap-1.5">
              {loopOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    onLoopChange(option.value);
                    trackEvent(EVENTS.LOOP_COUNT_CHANGE, { count: option.label });
                  }}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    loopCount === option.value
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {/* Speed */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant w-10 flex-shrink-0">Speed</span>
            <div className="flex-1 bg-surface-container-low rounded-lg p-2 flex gap-1.5">
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onSpeedChange(s);
                    trackEvent(EVENTS.SPEED_CHANGE, { speed: s + 'x' });
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    speed === s
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint - Hidden on mobile */}
      <div className="hidden md:block pt-2 border-t border-outline-variant">
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
        </div>
      </div>
    </div>
  );
};

export default ControlDeck;

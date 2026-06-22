import React from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

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
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
      {/* Main Controls Row */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={onLoopPlay}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            isPlaying
              ? 'bg-primary text-on-primary hover:opacity-90'
              : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>
      </div>

      {/* Loop Range Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-container-low rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">Start</span>
            <span className="text-xl font-mono font-bold text-on-surface">{regionStart}</span>
          </div>
          <button
            onClick={onSetStart}
            className="w-full py-2 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
          >
            Set Current
          </button>
        </div>

        <div className="bg-surface-container-low rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">End</span>
            <span className="text-xl font-mono font-bold text-on-surface">{regionEnd}</span>
          </div>
          <button
            onClick={onSetEnd}
            className="w-full py-2 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
          >
            Set Current
          </button>
        </div>
      </div>

      {/* Loop Count */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">Loop Count</span>
          {loopCount !== Infinity && isPlaying && (
            <span className="text-sm font-mono text-primary">
              {currentLoop + 1}/{loopCount}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {loopOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => onLoopChange(option.value)}
              className={`py-2 rounded-lg text-sm font-mono font-medium transition-all ${
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

      {/* Speed Control */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">Speed</span>
          <span className="text-sm font-mono text-primary">{speed}x</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`flex-1 py-2 rounded-lg text-sm font-mono font-medium transition-all ${
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onReplaySegment}
          className="flex-1 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay
        </button>
        <button
          onClick={onResetRegion}
          className="flex-1 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
        >
          <SkipBack className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-6 pt-4 border-t border-outline-variant">
        <div className="flex items-center justify-center gap-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[10px] font-mono">Space</kbd>
            Play/Pause
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[10px] font-mono">A</kbd>
            Set A
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[10px] font-mono">B</kbd>
            Set B
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-surface-container border border-outline-variant rounded text-[10px] font-mono">R</kbd>
            Reset
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlDeck;

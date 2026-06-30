import React, { useRef, useEffect, useState, useCallback } from 'react';

const VideoTimeline = ({
  duration,
  currentTime,
  loopStart,
  loopEnd,
  onLoopStartChange,
  onLoopEndChange,
  onSeek,
  isPlaying,
}) => {
  const trackRef = useRef(null);
  const draggingRef = useRef(null); // 用 ref 存储拖动状态，避免闭包问题
  const [dragging, setDragging] = useState(null); // 'a', 'b', or 'playhead'，仅用于 UI
  const [hoverTime, setHoverTime] = useState(null);

  const timeToPercent = useCallback((time) => {
    if (!duration || duration <= 0) return 0;
    return Math.max(0, Math.min(100, (time / duration) * 100));
  }, [duration]);

  const percentToTime = useCallback((percent) => {
    if (!duration || duration <= 0) return 0;
    return (percent / 100) * duration;
  }, [duration]);

  const getTimeFromEvent = useCallback((e) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    return percentToTime(percent);
  }, [percentToTime]);

  const handleMouseDown = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = type; // 立即更新 ref
    setDragging(type); // 触发 UI 更新
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !trackRef.current) return;
    const time = getTimeFromEvent(e);

    if (draggingRef.current === 'a') {
      const newStart = Math.min(time, loopEnd - 0.5);
      onLoopStartChange?.(Math.max(0, newStart));
    } else if (draggingRef.current === 'b') {
      const newEnd = Math.max(time, loopStart + 0.5);
      onLoopEndChange?.(Math.min(duration, newEnd));
    } else if (draggingRef.current === 'playhead') {
      onSeek?.(time);
    }
  }, [loopStart, loopEnd, duration, getTimeFromEvent, onLoopStartChange, onLoopEndChange, onSeek]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null; // 立即更新 ref
    setDragging(null); // 触发 UI 更新
  }, []);

  const handleTrackClick = useCallback((e) => {
    if (dragging) return;
    const time = getTimeFromEvent(e);
    onSeek?.(time);
  }, [dragging, getTimeFromEvent, onSeek]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startPercent = timeToPercent(loopStart || 0);
  const endPercent = timeToPercent(loopEnd || duration || 0);
  const currentPercent = timeToPercent(currentTime || 0);

  const formatTime = (time) => {
    if (!time && time !== 0) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="relative px-2 py-3 select-none">
      {/* Time labels */}
      <div className="flex justify-between text-[10px] text-on-surface-variant font-mono mb-1">
        <span>{formatTime(0)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-12 flex items-center cursor-pointer"
        onClick={handleTrackClick}
        onMouseMove={(e) => setHoverTime(getTimeFromEvent(e))}
        onMouseLeave={() => setHoverTime(null)}
      >
        {/* Background track */}
        <div className="absolute w-full h-1.5 bg-surface-container-highest rounded-full" />

        {/* Loop range */}
        {loopStart !== undefined && loopEnd !== undefined && (
          <div
            className="absolute h-1.5 bg-primary-container/40 rounded-full"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />
        )}

        {/* Hover indicator */}
        {hoverTime !== null && !dragging && (
          <div
            className="absolute h-8 w-0.5 bg-on-surface/20 pointer-events-none"
            style={{ left: `${timeToPercent(hoverTime)}%` }}
          />
        )}

        {/* Marker A */}
        <div
          className="absolute -translate-x-1/2 cursor-grab active:cursor-grabbing group"
          style={{ left: `${startPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'a')}
          onTouchStart={(e) => handleMouseDown(e, 'a')}
        >
          <div className="flex flex-col items-center">
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1 shadow-sm">
              A
            </span>
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-sm group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Marker B */}
        <div
          className="absolute -translate-x-1/2 cursor-grab active:cursor-grabbing group"
          style={{ left: `${endPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'b')}
          onTouchStart={(e) => handleMouseDown(e, 'b')}
        >
          <div className="flex flex-col items-center">
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1 shadow-sm">
              B
            </span>
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-sm group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `${currentPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'playhead')}
          onTouchStart={(e) => handleMouseDown(e, 'playhead')}
        >
          <div className="h-8 w-0.5 bg-on-surface shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
          <div className="w-2 h-2 bg-on-surface rounded-full -translate-x-[3px] -mt-1" />
        </div>
      </div>

      {/* Time display under markers */}
      <div className="flex justify-between text-[11px] font-mono text-primary mt-1">
        <span>A: {formatTime(loopStart)}</span>
        <span>B: {formatTime(loopEnd)}</span>
      </div>
    </div>
  );
};

export default VideoTimeline;

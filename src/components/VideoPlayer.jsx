import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

const VideoPlayer = forwardRef(({
  file,
  isPlaying,
  speed,
  loopStart,
  loopEnd,
  loopCount,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  onReady,
}, ref) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const loopCounterRef = useRef(0);
  const isLoopingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    getVideo: () => videoRef.current,
    seek: (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    stepFrame: (direction) => {
      if (!videoRef.current || !duration) return;
      const frameTime = 1 / 30; // assume 30fps
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + direction * frameTime));
      videoRef.current.currentTime = newTime;
    },
    getCurrentTime: () => videoRef.current?.currentTime || 0,
  }));

  useEffect(() => {
    if (videoRef.current && file) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.load();
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate?.(time);

    // Loop logic
    if (loopStart !== undefined && loopEnd !== undefined && loopStart < loopEnd) {
      if (time >= loopEnd) {
        if (loopCount === Infinity) {
          videoRef.current.currentTime = loopStart;
        } else if (loopCounterRef.current < loopCount - 1) {
          loopCounterRef.current += 1;
          videoRef.current.currentTime = loopStart;
        } else {
          loopCounterRef.current = 0;
          videoRef.current.pause();
          onEnded?.();
        }
      }
    }
  }, [loopStart, loopEnd, loopCount, onTimeUpdate, onEnded]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      onDurationChange?.(dur);
      onReady?.(dur);
    }
  }, [onDurationChange, onReady]);

  const handleEnded = useCallback(() => {
    loopCounterRef.current = 0;
    onEnded?.();
  }, [onEnded]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        playsInline
        preload="metadata"
      />
      {!file && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest">
          <div className="text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-2">movie</span>
            <p className="text-sm">Upload a video to start</p>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

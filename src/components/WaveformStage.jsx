import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Loader2 } from 'lucide-react';

let globalActiveUrl = null;
let globalActiveFile = null;

const safeRevoke = (url) => {
  if (!url) return;
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 5000);
};

const WaveformStage = forwardRef(({ file, isPlaying, speed, loopCount, onTimeUpdate, onReady, onFinish, onRegionUpdate, onLoopProgress }, ref) => {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const wavesurfer = useRef(null);
  const regionsPlugin = useRef(null);
  const activeRegion = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);
  const retryRef = useRef(0);
  const loadIdRef = useRef(0);
  const isMounted = useRef(true);
  const onReadyRef = useRef(onReady);
  const onFinishRef = useRef(onFinish);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onRegionUpdateRef = useRef(onRegionUpdate);
  const onLoopProgressRef = useRef(onLoopProgress);
  const loopCountRef = useRef(loopCount);
  const currentLoopRef = useRef(0);
  const userSeekedRef = useRef(false);
  const regionChangedRef = useRef(false);
  const lastLoopTimeRef = useRef(0);
  const ignoreRegionOutUntilRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (wavesurfer.current) {
      wavesurfer.current.destroy();
      wavesurfer.current = null;
    }

    loadingRef.current = false;

    const regions = RegionsPlugin.create();
    regionsPlugin.current = regions;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const options = {
      container: containerRef.current,
      waveColor: '#c3c6d7',
      progressColor: '#004ac6',
      cursorColor: '#0b1c30',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 120,
      normalize: true,
      sampleRate: isMobile ? 3000 : 8000,
      plugins: [regions],
      dragToSeek: false,
      interact: !isMobile,
    };

    options.media = audioEl;

    const ws = WaveSurfer.create(options);
    wavesurfer.current = ws;

    ws.on('ready', () => {
      const dur = ws.getDuration();
      setIsLoading(false);

      // Inject custom styles for region handles
      const wrapper = ws.getWrapper();
      const root = wrapper?.getRootNode();
      if (root instanceof ShadowRoot) {
        const style = document.createElement('style');
        style.textContent = `
          .wrapper, .scroll {
            overflow: visible !important;
          }
          [part*="region"] {
            z-index: 10 !important;
          }
          [part*="region-handle"] {
            width: 24px !important;
            background-color: transparent !important;
            z-index: 100 !important;
            cursor: ew-resize !important;
            pointer-events: auto !important;
            border: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          [part*="region-handle"]::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 24px;
            background-color: #004ac6;
            border-radius: 4px;
            transform: translate(-50%, -50%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transition: transform 0.1s ease, background-color 0.1s;
            pointer-events: none;
          }
          [part*="region-handle"]:hover::after {
            background-color: #2563eb;
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: 0 0 12px rgba(0, 74, 198, 0.4);
          }
          [part*="region-handle"]::before {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            background-color: rgba(0, 74, 198, 0.3);
            transform: translateX(-50%);
            z-index: -1;
            pointer-events: none;
          }
          [part*="region-handle"]:first-child::after {
            content: "A";
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto;
            height: auto;
            padding: 1.5px 6px;
            border-radius: 4px;
            background-color: #004ac6;
            position: absolute;
            top: -22px;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            white-space: nowrap;
            pointer-events: none;
          }
          [part*="region-handle"]:last-child::after {
            content: "B";
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto;
            height: auto;
            padding: 1.5px 6px;
            border-radius: 4px;
            background-color: #004ac6;
            position: absolute;
            top: -22px;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            white-space: nowrap;
            pointer-events: none;
          }
        `;
        root.appendChild(style);
      }

      if (onReadyRef.current) onReadyRef.current(dur);

      regions.clearRegions();
      const region = regions.addRegion({
        start: 0,
        end: dur,
        color: 'rgba(0, 74, 198, 0.15)',
        drag: true,
        resize: true,
        loop: true,
      });
      activeRegion.current = region;
      currentLoopRef.current = 0;
      if (onLoopProgressRef.current) onLoopProgressRef.current(0);

      if (onRegionUpdateRef.current) {
        onRegionUpdateRef.current(region.start, region.end);
      }

      if (loopCountRef.current === Infinity) {
        region.setOptions({ loop: true });
      } else {
        region.setOptions({ loop: false });
      }
    });

    ws.on('error', (err) => {
      const msg = String(err && (err.message || err));
      if (msg.includes('AbortError') || msg.includes('aborted')) {
        console.warn("WaveSurfer aborted previous load (benign):", msg);
      } else if (msg.includes('Failed to fetch')) {
        console.warn("WaveSurfer fetch failed:", msg);
        if (!loadingRef.current) {
          setError("Failed to load audio: Source unavailable");
          setIsLoading(false);
        }
      } else {
        console.error("WaveSurfer Error:", err);
        setError(`Error: ${msg}`);
        setIsLoading(false);
      }
    });

    ws.on('audioprocess', (time) => {
      if (onTimeUpdateRef.current) onTimeUpdateRef.current(time);
    });

    ws.on('interaction', (newTime) => {
      userSeekedRef.current = true;
      if (onTimeUpdateRef.current) onTimeUpdateRef.current(newTime);
    });

    ws.on('finish', () => {
      if (onFinishRef.current) onFinishRef.current();
    });

    regions.on('region-created', (region) => {
      regions.getRegions().forEach(r => {
        if (r !== region) r.remove();
      });
      activeRegion.current = region;
      regionChangedRef.current = true;
      currentLoopRef.current = 0;
      if (onLoopProgressRef.current) onLoopProgressRef.current(0);

      if (onRegionUpdateRef.current) {
        onRegionUpdateRef.current(region.start, region.end);
      }

      if (loopCountRef.current === Infinity) {
        region.setOptions({ loop: true });
      } else {
        region.setOptions({ loop: false });
      }
    });

    regions.on('region-updated', (region) => {
      activeRegion.current = region;
      regionChangedRef.current = true;
      currentLoopRef.current = 0;
      if (onLoopProgressRef.current) onLoopProgressRef.current(0);
      if (onRegionUpdateRef.current) {
        onRegionUpdateRef.current(region.start, region.end);
      }
    });

    regions.on('region-out', (region) => {
      if (activeRegion.current === region) {
        if (loopCountRef.current === Infinity) {
          const now = Date.now();
          if (now < ignoreRegionOutUntilRef.current) return;
          if (now - lastLoopTimeRef.current < 200) return;
          lastLoopTimeRef.current = now;
          region.play();
          return;
        } else {
          const now = Date.now();
          if (now < ignoreRegionOutUntilRef.current) return;
          if (now - lastLoopTimeRef.current < 200) return;
          lastLoopTimeRef.current = now;

          if (currentLoopRef.current + 1 < loopCountRef.current) {
            currentLoopRef.current++;
            if (onLoopProgressRef.current) onLoopProgressRef.current(currentLoopRef.current);
            region.play();
          }
        }
      }
    });

    return () => {
      if (wavesurfer.current) wavesurfer.current.destroy();
    };
  }, []);

  useEffect(() => {
    let timerId;
    if (file && wavesurfer.current) {
      retryRef.current = 0;
      loadIdRef.current += 1;
      const thisLoadId = loadIdRef.current;
      setIsLoading(true);
      setError(null);

      const attempt = async () => {
        if (!isMounted.current || loadIdRef.current !== thisLoadId) return;

        loadingRef.current = true;

        if (file !== globalActiveFile) {
          if (globalActiveUrl) {
            safeRevoke(globalActiveUrl);
          }
          globalActiveUrl = URL.createObjectURL(file);
          globalActiveFile = file;
        }

        try {
          await wavesurfer.current.load(globalActiveUrl);
        } catch (err) {
          console.warn("WaveSurfer load error:", err);
          if (isMounted.current && loadIdRef.current === thisLoadId && retryRef.current < 2) {
            const msg = String(err && (err.message || err));
            if (msg.includes('AbortError') || msg.includes('user aborted')) {
              retryRef.current++;
              timerId = setTimeout(attempt, 200);
            } else {
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
            setError("Failed to load file. Please try again.");
          }
        } finally {
          if (isMounted.current && loadIdRef.current === thisLoadId) {
            loadingRef.current = false;
          }
        }
      };

      timerId = setTimeout(attempt, 200);
    } else {
      setIsLoading(false);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [file]);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);
  useEffect(() => { onRegionUpdateRef.current = onRegionUpdate; }, [onRegionUpdate]);
  useEffect(() => { onLoopProgressRef.current = onLoopProgress; }, [onLoopProgress]);
  useEffect(() => {
    loopCountRef.current = loopCount;
    if (activeRegion.current) {
      if (loopCount === Infinity) {
        activeRegion.current.setOptions({ loop: true });
      } else {
        activeRegion.current.setOptions({ loop: false });
      }
    }
  }, [loopCount]);

  useEffect(() => {
    if (!wavesurfer.current) return;
    if (isPlaying) {
      const region = activeRegion.current;
      const currentTime = wavesurfer.current.getCurrentTime();
      const isAtEnd = region && (currentTime >= region.end - 0.1);
      const isFinished = loopCountRef.current !== Infinity && currentLoopRef.current >= loopCountRef.current;

      if (userSeekedRef.current || regionChangedRef.current) {
        userSeekedRef.current = false;
        regionChangedRef.current = false;
        currentLoopRef.current = 0;
        if (onLoopProgressRef.current) onLoopProgressRef.current(0);
        ignoreRegionOutUntilRef.current = Date.now() + 500;

        if (region) {
          region.play();
        } else {
          wavesurfer.current.seekTo(0);
          wavesurfer.current.play();
        }
        return;
      }

      if (isFinished || isAtEnd) {
        currentLoopRef.current = 0;
        if (onLoopProgressRef.current) onLoopProgressRef.current(0);
        ignoreRegionOutUntilRef.current = Date.now() + 500;

        if (region) {
          region.play();
        } else {
          wavesurfer.current.seekTo(0);
          wavesurfer.current.play();
        }
      } else {
        wavesurfer.current.play();
      }
    } else {
      wavesurfer.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const ws = wavesurfer.current;
    if (!ws) return;
    const t = ws.getCurrentTime();
    ws.setPlaybackRate(speed);
    if (Number.isFinite(t)) {
      const d = ws.getDuration();
      ws.setTime(Math.min(d, Math.max(0, t)));
    }
  }, [speed]);

  useImperativeHandle(ref, () => ({
    replaySegment: () => {
      currentLoopRef.current = 0;
      if (onLoopProgressRef.current) onLoopProgressRef.current(0);
      ignoreRegionOutUntilRef.current = Date.now() + 500;

      if (activeRegion.current) {
        activeRegion.current.play();
      } else {
        wavesurfer.current?.seekTo(0);
        wavesurfer.current?.play();
      }
    },
    resetRegion: () => {
      if (activeRegion.current && wavesurfer.current) {
        const dur = wavesurfer.current.getDuration();
        activeRegion.current.setOptions({ start: 0, end: dur });
        if (onRegionUpdateRef.current) {
          onRegionUpdateRef.current(0, dur);
        }
      }
    },
    setStartMarker: () => {
      if (activeRegion.current && wavesurfer.current) {
        const currentTime = wavesurfer.current.getCurrentTime();
        activeRegion.current.setOptions({ start: currentTime });
        if (onRegionUpdateRef.current) {
          onRegionUpdateRef.current(currentTime, activeRegion.current.end);
        }
      }
    },
    setEndMarker: () => {
      if (activeRegion.current && wavesurfer.current) {
        const currentTime = wavesurfer.current.getCurrentTime();
        activeRegion.current.setOptions({ end: currentTime });
        if (onRegionUpdateRef.current) {
          onRegionUpdateRef.current(activeRegion.current.start, currentTime);
        }
      }
    },
    fineTune: (type, delta) => {
      if (activeRegion.current) {
        const { start, end } = activeRegion.current;
        let newStart = start;
        let newEnd = end;

        if (type === 'start') {
          newStart = Math.max(0, start + delta);
          activeRegion.current.setOptions({ start: newStart });
        } else {
          newEnd = Math.min(wavesurfer.current.getDuration(), end + delta);
          activeRegion.current.setOptions({ end: newEnd });
        }

        if (onRegionUpdateRef.current) {
          onRegionUpdateRef.current(newStart, newEnd);
        }
      }
    }
  }));

  return (
    <div className="w-full relative">
      <audio ref={audioRef} className="hidden" preload="metadata" />

      <div className="relative w-full" style={{ minHeight: '120px', touchAction: 'pan-y' }}>
        <div ref={containerRef} className="w-full" style={{ touchAction: 'pan-y' }} />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-high/80 backdrop-blur-sm z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm font-medium text-on-surface-variant tracking-wide">Loading Waveform...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/90 backdrop-blur-sm z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3 p-6 bg-error-container/20 border border-error/30 rounded-xl shadow-2xl">
              <span className="text-error font-medium text-center">{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error text-xs rounded-full transition-colors border border-error/20"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default WaveformStage;

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Maximize, Loader2, Upload } from 'lucide-react';

// Module-level cache to prevent Blob URL revocation during React Strict Mode remounts
  let globalActiveUrl = null;
  let globalActiveFile = null;

  // Helper to safely revoke with delay to prevent ERR_ABORTED if browser is still reading
  const safeRevoke = (url) => {
      if (!url) return;
      setTimeout(() => {
          URL.revokeObjectURL(url);
      }, 5000); 
  };

  const WaveformStage = forwardRef(({ file, isPlaying, playMode, speed, loopCount, isVideo, onTimeUpdate, onReady, onFinish, onRegionUpdate, onLoopProgress, onOpenFile }, ref) => {
    const containerRef = useRef(null);
    const mediaRef = useRef(null); // Ref for video element
    const audioRef = useRef(null); // Ref for audio element (fallback)
    const wavesurfer = useRef(null);
    const regionsPlugin = useRef(null);
    const activeRegion = useRef(null);
    // fallbackUrlRef removed as we use globalActiveUrl
    const [showVideo, setShowVideo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadingRef = useRef(false);
    const retryRef = useRef(0);
    const loadIdRef = useRef(0);
    const isMounted = useRef(true);
    const onReadyRef = useRef(onReady);
    const onFinishRef = useRef(onFinish);
    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onRegionUpdateRef = useRef(null);
    const onLoopProgressRef = useRef(onLoopProgress);
    const loopCountRef = useRef(loopCount);
    const playModeRef = useRef(playMode);
    const currentLoopRef = useRef(0);
    const userSeekedRef = useRef(false);
    const regionChangedRef = useRef(false);
    const lastLoopTimeRef = useRef(0);
    const ignoreRegionOutUntilRef = useRef(0);
  
    // Sync local video display flag with incoming isVideo/file
  useEffect(() => {
    setShowVideo(isVideo);
  }, [isVideo, file]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const mediaEl = showVideo ? mediaRef.current : audioRef.current;
    if (!mediaEl) return;

    // Destroy previous instance if any
    if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
    }
    
    // Reset loading state as we have a fresh instance
    loadingRef.current = false;

    // Create Regions Plugin instance
    const regions = RegionsPlugin.create();
    regionsPlugin.current = regions;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const options = {
      container: containerRef.current,
      waveColor: '#334155',
      progressColor: '#475569',
      cursorColor: '#ffffff',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 100,
      normalize: true,
      // Lower sample rate for videos/mobile to speed up waveform generation
      sampleRate: isVideo ? (isMobile ? 100 : 3000) : 8000, 
      plugins: [regions],
    };

    // Always use a media element (video for isVideo, audio otherwise)
            options.media = mediaEl;
            
            // Removed custom fetchParams as they might be causing 'TypeError: Failed to fetch'
            // with Blob URLs in some environments.

            const ws = WaveSurfer.create(options);

    wavesurfer.current = ws;

    // Event Listeners
    ws.on('ready', () => {
      const dur = ws.getDuration();
      setIsLoading(false);
      
      // Inject custom styles into Shadow DOM to ensure handles are visible and styled correctly
      // This overcomes Shadow DOM isolation that blocks global CSS
      const wrapper = ws.getWrapper();
      const root = wrapper?.getRootNode();
      if (root instanceof ShadowRoot) {
          const style = document.createElement('style');
          style.textContent = `
              /* Force wrapper overflow visible to prevent clipping */
              .wrapper, .scroll {
                  overflow: visible !important;
              }
              
              /* Region Styles */
              [part*="region"] {
                  z-index: 10 !important;
              }
              
              /* Handle Styles */
        [part*="region-handle"] {
          width: 12px !important;
          background-color: transparent !important;
          z-index: 100 !important;
          cursor: ew-resize !important;
          pointer-events: auto !important;
          border: none !important;
        }
        
        /* Handle Knob (Visual) */
        [part*="region-handle"]::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 24px;
          background-color: #FACC15; /* Bright Yellow */
          border-radius: 4px;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          transition: transform 0.1s ease, background-color 0.1s;
          pointer-events: none; /* Let clicks pass to the handle div */
        }
              
              /* Hover Effect */
              [part*="region-handle"]:hover::after {
                  background-color: #EAB308;
                  transform: translate(-50%, -50%) scale(1.1);
                  box-shadow: 0 0 12px rgba(250, 204, 21, 0.6);
              }
              
              /* Vertical Line Indicator */
              [part*="region-handle"]::before {
                  content: "";
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: 50%;
                  width: 2px;
                  background-color: rgba(255, 255, 255, 0.5);
                  transform: translateX(-50%);
                  z-index: -1;
                  pointer-events: none;
              }
          `;
          root.appendChild(style);
          
          // Also force the host element (container) to handle overflow if needed
          if (containerRef.current) {
             containerRef.current.style.overflow = 'visible';
          }
      }

      if (onReadyRef.current) onReadyRef.current(dur);

      // Create default region (Full song)
      regions.clearRegions();
      const region = regions.addRegion({
        start: 0,
        end: dur,
        color: 'rgba(139, 92, 246, 0.3)', // Purple with opacity
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

      // Apply loop settings for new region
      if (playModeRef.current === 'sequential') {
          region.setOptions({ loop: false });
      } else {
        if (loopCountRef.current === Infinity) {
          region.setOptions({ loop: true });
        } else {
          region.setOptions({ loop: false });
        }
      }
    });

    ws.on('error', (err) => {
        // Suppress benign abort or fetch noise
        const msg = String(err && (err.message || err));
        if (msg.includes('AbortError') || msg.includes('aborted')) {
          console.warn("WaveSurfer aborted previous load (benign):", msg);
        } else if (msg.includes('Failed to fetch')) {
          console.warn("WaveSurfer fetch failed, likely due to previous abort or unsupported source:", msg);
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

    // Interaction listener to track user seeking
    ws.on('interaction', (newTime) => {
      userSeekedRef.current = true;
      // Manually trigger time update for UI
      if (onTimeUpdateRef.current) onTimeUpdateRef.current(newTime);
    });

    ws.on('finish', () => {
       if (onFinishRef.current) onFinishRef.current();
    });

    // Region events
    regions.on('region-created', (region) => {
       // Enforce single region
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

       if (loopCountRef.current === Infinity && playModeRef.current !== 'sequential') {
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
           // Sequential mode: Just continue playing, ignore loop logic
           if (playModeRef.current === 'sequential') {
               return;
           }

           if (loopCountRef.current === Infinity) {
              // Handled by region.loop = true
           } else {
              // Finite loop handling
           const now = Date.now();
           if (now < ignoreRegionOutUntilRef.current) {
               return;
           }
           if (now - lastLoopTimeRef.current < 200) {
               // Prevent double-triggering region-out
               return;
           }
           lastLoopTimeRef.current = now;

           if (currentLoopRef.current + 1 < loopCountRef.current) {
              console.log(`Looping: ${currentLoopRef.current + 1}/${loopCountRef.current}`);
              currentLoopRef.current++;
              if (onLoopProgressRef.current) onLoopProgressRef.current(currentLoopRef.current);
               region.play();
            } else {
               // Finished loops, continue playing or stop?
               // Usually continue playing the rest of the song or stop.
               // Let's continue.
            }
          }
       }
    });
    
    // Cleanup
    return () => {
      if (wavesurfer.current) wavesurfer.current.destroy();
    };
  }, [showVideo]);

  // Handle File Loading
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
             
             // Use global persistent URL for the same file to support Strict Mode
             if (file !== globalActiveFile) {
               if (globalActiveUrl) {
                 safeRevoke(globalActiveUrl);
               }
               globalActiveUrl = URL.createObjectURL(file);
               globalActiveFile = file;
             }

             try {
               // Use standard load method (v7 API)
               // Pass file blob to avoid fetching if possible, though WaveSurfer might still decode
               await wavesurfer.current.load(globalActiveUrl); 
             } catch (err) {
               console.warn("WaveSurfer load error (likely benign in Strict Mode):", err);
               // Retry logic for genuine aborts that are not just rapid file switches
               if (isMounted.current && loadIdRef.current === thisLoadId && retryRef.current < 2) {
                   const msg = String(err && (err.message || err));
                   if (msg.includes('AbortError') || msg.includes('user aborted')) {
                       retryRef.current++;
                       console.log(`Retrying load (${retryRef.current}/2)...`);
                       timerId = setTimeout(attempt, 200); // Retry after delay
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
         
         // Debounce load to avoid Strict Mode double-fetch which causes net::ERR_ABORTED
         timerId = setTimeout(attempt, 200);
     } else {
        setIsLoading(false);
     }
     
     return () => {
       if (timerId) clearTimeout(timerId);
     };
  }, [file, showVideo]); // Reload when file or mode changes
  
  // Cleanup logic: We DO NOT revoke the URL on unmount to support Strict Mode.
  // The URL is only revoked when a NEW file replaces the old one.
  // This means one ObjectURL is always active as long as the app is running, which is acceptable.

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);
  useEffect(() => {
    onRegionUpdateRef.current = onRegionUpdate;
  }, [onRegionUpdate]);
  useEffect(() => {
    onLoopProgressRef.current = onLoopProgress;
  }, [onLoopProgress]);
  useEffect(() => {
    loopCountRef.current = loopCount;
    // Update active region loop setting based on playMode and loopCount
    if (activeRegion.current) {
        if (playModeRef.current === 'sequential') {
            activeRegion.current.setOptions({ loop: false });
        } else {
            // Loop mode
            if (loopCount === Infinity) {
                activeRegion.current.setOptions({ loop: true });
            } else {
                activeRegion.current.setOptions({ loop: false });
            }
        }
    }
  }, [loopCount]);

  useEffect(() => {
    playModeRef.current = playMode;
    // Update active region loop setting immediately
    if (activeRegion.current) {
        if (playMode === 'sequential') {
            activeRegion.current.setOptions({ loop: false });
        } else {
            // Loop mode
            if (loopCountRef.current === Infinity) {
                activeRegion.current.setOptions({ loop: true });
            } else {
                activeRegion.current.setOptions({ loop: false });
            }
        }
    }
  }, [playMode]);

  // Handle Play/Pause
  useEffect(() => {
    if (!wavesurfer.current) return;
    if (isPlaying) {
      const region = activeRegion.current;
      const currentTime = wavesurfer.current.getCurrentTime();
      // Check if we need to reset (finished loops or starting from end)
      // Use a small threshold for end detection
      const isAtEnd = region && (currentTime >= region.end - 0.1);
      const isFinished = loopCountRef.current !== Infinity && currentLoopRef.current >= loopCountRef.current;
      
      // If switching to sequential mode, always just resume from current time
      if (playModeRef.current === 'sequential') {
          wavesurfer.current.play();
          return;
      }

      // Check for user seek in loop mode or if region has changed
      if (userSeekedRef.current || regionChangedRef.current) {
         userSeekedRef.current = false;
         regionChangedRef.current = false;
         
         // If user seeked or region changed, restart loop logic
         currentLoopRef.current = 0;
         if (onLoopProgressRef.current) onLoopProgressRef.current(0);
         ignoreRegionOutUntilRef.current = Date.now() + 500; // Ignore spurious region-out events for 500ms
         
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
          ignoreRegionOutUntilRef.current = Date.now() + 500; // Ignore spurious region-out events for 500ms
          
          if (region) {
              region.play(); // Seeks to start and plays
          } else {
              wavesurfer.current.seekTo(0);
              wavesurfer.current.play();
          }
      } else {
          // Resume from current position
          wavesurfer.current.play();
      }
    } else {
      wavesurfer.current.pause();
    }
  }, [isPlaying]);

  // Handle Speed
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

  // Handle Loop Setting
  // Moved logic to ref update above
  // useEffect(() => {
  //    if (activeRegion.current) {
  //        activeRegion.current.setOptions({ loop: true }); 
  //    }
  // }, [loopCount]);

  const toggleFullScreen = () => {
    const video = mediaRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      // iOS Safari
      video.webkitEnterFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
  };

  // Expose methods
  useImperativeHandle(ref, () => ({
    replaySegment: () => {
      currentLoopRef.current = 0;
      if (onLoopProgressRef.current) onLoopProgressRef.current(0);
      ignoreRegionOutUntilRef.current = Date.now() + 500; // Ignore spurious region-out events for 500ms
      
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
        
        // Manually trigger update to ensure UI reflects changes immediately
        if (onRegionUpdateRef.current) {
           onRegionUpdateRef.current(newStart, newEnd);
        }
      }
    }
  }));

  // Render
  return (
    <div className={`w-full h-full flex flex-col items-center relative ${isVideo ? 'justify-start' : 'justify-center'}`}>
      {!file && (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-6 pointer-events-auto">
          <button
            onClick={onOpenFile}
            className="group relative flex flex-col items-center justify-center w-full max-w-[240px] aspect-square rounded-3xl bg-gray-800/20 hover:bg-gray-800/40 border-2 border-dashed border-gray-700 hover:border-accent/50 transition-all duration-500 ease-out hover:scale-105 active:scale-95"
          >
            {/* Glow effect behind */}
            <div className="absolute inset-0 rounded-3xl bg-accent/5 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            
            {/* Icon Container */}
            <div className="relative w-20 h-20 mb-6 rounded-2xl bg-gray-900/50 flex items-center justify-center shadow-inner border border-gray-800 group-hover:border-accent/30 transition-colors duration-500">
               <Upload className="w-8 h-8 text-gray-500 group-hover:text-accent transition-colors duration-300" />
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xl font-bold text-gray-300 group-hover:text-white tracking-wide transition-colors">
                Open Media
              </span>
              <span className="text-xs font-medium text-gray-500 group-hover:text-accent/80 uppercase tracking-widest transition-colors">
                Audio or Video
              </span>
            </div>
          </button>
        </div>
      )}
      {/* Video Player */}
      {isVideo && (
        <div className="flex-1 min-h-0 w-full mb-4 flex justify-center items-center overflow-hidden">
          <div className="relative w-fit h-full flex flex-col justify-center">
            <video 
               ref={mediaRef} 
               className="max-w-full max-h-full rounded-lg shadow-lg bg-black block object-contain"
               playsInline
               webkit-playsinline="true"
               x5-video-player-type="h5"
               x5-video-player-fullscreen="true"
               x5-playsinline="true"
               preload="metadata"
               onError={(e) => {
                 const target = e.nativeEvent?.target;
                 const err = target?.error;
                 const code = err?.code;
                 const msg = err?.message || '';
                 console.error("Video Element Error:", { code, msg });
                 setShowVideo(false);
               }}
            />
            <button 
               onClick={toggleFullScreen}
               className="absolute bottom-3 right-3 p-2 bg-black/60 text-white rounded-full opacity-60 hover:opacity-100 transition-opacity backdrop-blur-sm z-10"
               title="Full Screen"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      )}
      {/* Hidden audio element for non-video or fallback */}
      {!isVideo && (
        <audio
           ref={audioRef}
           className="hidden"
           preload="metadata"
        />
      )}
      
      {/* Waveform Container */}
      <div className="relative w-full shrink-0 h-[100px] mb-6 px-3">
        <div ref={containerRef} className="w-full" />
         
         {/* Loading Overlay */}
         {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50 rounded-lg">
               <div className="flex flex-col items-center gap-3 animate-pulse">
                  <Loader2 className="w-10 h-10 text-accent animate-spin" />
                  <span className="text-sm font-medium text-slate-200 tracking-wide">Loading Waveform...</span>
               </div>
            </div>
         )}

         {/* Error Overlay */}
         {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-50 rounded-lg">
               <div className="flex flex-col items-center gap-3 p-6 bg-red-900/20 border border-red-500/30 rounded-xl shadow-2xl">
                  <span className="text-red-400 font-medium text-center">{error}</span>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs rounded-full transition-colors border border-red-500/20"
                  >
                    Reload Page
                  </button>
               </div>
            </div>
         )}
      </div>
      
      {/* Time Display */}
      {file && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 text-4xl font-mono font-bold text-white drop-shadow-lg">
          {/* We need time state here or pass it up. 
              Since we update onTimeUpdate, let's use a local ref or expect parent to pass formatted time?
              Actually, passing time back down causes re-renders. 
              Let's make this component self-contained for display or use a separate component.
              For now, I'll let the parent handle the time display logic if I passed onTimeUpdate.
              Wait, the design says "Time: Suspended above waveform". 
              I'll render it here if I have the time.
          */}
        </div>
      )}
    </div>
  );
});

export default WaveformStage;

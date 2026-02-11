import React, { useState, useRef, useEffect } from 'react';
import TopBar from './components/TopBar';
import WaveformStage from './components/WaveformStage';
import ControlDeck from './components/ControlDeck';

function App() {
  const [file, setFile] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState('loop'); // 'loop' | 'sequential'
  const [loopCount, setLoopCount] = useState(5);
  const [speed, setSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [regionStart, setRegionStart] = useState(0);
  const [regionEnd, setRegionEnd] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(0);

  const waveformRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastPauseTimeRef = useRef(0);
  const prevIsPlayingRef = useRef(isPlaying);

  // Capture the time when playback pauses
  useEffect(() => {
    if (prevIsPlayingRef.current && !isPlaying) {
      lastPauseTimeRef.current = currentTime;
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, currentTime]);
  
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsVideo(uploadedFile.type.startsWith('video/'));
      setIsPlaying(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const toggleLoopPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If we are already in loop mode but paused, just resume without resetting
      // Since we only have loop mode now, playMode is effectively always 'loop'
      
      setPlayMode('loop');
      setIsPlaying(true);
      
      // Check if user seeked while paused
      // If time difference is significant (> 0.1s), treat as a seek and restart loop
      const timeDiff = Math.abs(currentTime - lastPauseTimeRef.current);
      if (timeDiff > 0.1) {
         console.log("User seeked while paused, restarting loop");
         waveformRef.current?.replaySegment();
      }
    }
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleRegionUpdate = (start, end) => {
    setRegionStart(start);
    setRegionEnd(end);
  };

  const handleLoopProgress = (loop) => {
    setCurrentLoop(loop);
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "00:00.0";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10); // 1 decimal place
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="h-screen bg-background text-white flex flex-col font-sans select-none overflow-hidden">
      <TopBar onOpenClick={triggerFileUpload} />
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="audio/*,video/mp4,video/webm" 
        className="hidden" 
      />

      <main className="flex-1 flex flex-col justify-center items-center relative w-full max-w-3xl mx-auto px-0 pb-96 pt-20 overflow-hidden">
        
        
        {/* Time Display - Floating above waveform */}
        {file && (
        <div className="mb-4 text-center shrink-0 z-10 mt-auto">
           <div className="text-5xl font-mono font-bold tracking-tighter text-white drop-shadow-2xl">
             {formatTime(currentTime)}
           </div>
           <div className="text-gray-500 text-sm mt-1 font-mono">
             / {formatTime(duration)}
           </div>
        </div>
        )}

        {/* Slogan for Audio Files */}
        {file && !isVideo && (
          <div className="mb-6 flex flex-col items-center select-none opacity-80">
            <div className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400">Master the Details</div>
            <div className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-600 mt-1">One Loop at a Time</div>
          </div>
        )}

        {/* Waveform Stage */}
        <div className={`w-full relative min-h-0 ${!file || isVideo ? 'flex-1 flex flex-col' : 'h-64'}`}>
          <WaveformStage 
            ref={waveformRef}
            file={file}
            isVideo={isVideo}
            isPlaying={isPlaying}
            playMode={playMode}
            speed={speed}
            loopCount={loopCount}
            onTimeUpdate={handleTimeUpdate}
            onRegionUpdate={handleRegionUpdate}
            onLoopProgress={handleLoopProgress}
            onReady={(dur) => setDuration(dur)}
            onFinish={() => setIsPlaying(false)}
            onOpenFile={triggerFileUpload}
          />
        </div>

        {/* File Name Display */}
        {file && (
          <div className="mt-4 text-xs text-white/30 font-mono tracking-wider text-center max-w-[90%] break-words px-4 z-10 relative select-text cursor-text">
            {file.name.replace(/\.[^/.]+$/, "")}
          </div>
        )}
      </main>

      <ControlDeck 
        isPlaying={isPlaying}
        playMode={playMode}
        onLoopPlay={toggleLoopPlay}
        loopCount={loopCount}
        currentLoop={currentLoop}
        onLoopChange={setLoopCount}
        speed={speed}
        onSpeedChange={setSpeed}
        onReplaySegment={() => {
          waveformRef.current?.replaySegment();
          setPlayMode('loop');
          setIsPlaying(true);
        }}
        onResetRegion={() => waveformRef.current?.resetRegion()}
        onFineTune={(type, delta) => waveformRef.current?.fineTune(type, delta)}
        regionStart={formatTime(regionStart)}
        regionEnd={formatTime(regionEnd)}
      />
    </div>
  );
}

export default App;

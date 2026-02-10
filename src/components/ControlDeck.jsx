import React from 'react';
import { Pause, RotateCw, RefreshCw, X, Repeat } from 'lucide-react';

const ControlDeck = ({ 
  isPlaying, 
  playMode,
  onLoopPlay,
  loopCount, 
  currentLoop = 0,
  onLoopChange, 
  speed, 
  onSpeedChange, 
  onReplaySegment, 
  onResetRegion, 
  onFineTune,
  regionStart = "00:00.0",
  regionEnd = "00:00.0"
}) => {
  
  const speedOptions = [1.0, 1.25, 1.5, 2.0, 0.5, 0.75];
  
  const cycleSpeed = () => {
    const currentIndex = speedOptions.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    onSpeedChange(speedOptions[nextIndex]);
  };

  const cycleLoop = () => {
    // Toggle sequence: 3 -> 5 -> 10 -> Infinity
    if (loopCount === 3) onLoopChange(5);
    else if (loopCount === 5) onLoopChange(10);
    else if (loopCount === 10) onLoopChange(Infinity);
    else onLoopChange(3);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gray-900/60 backdrop-blur-xl border-t border-gray-800 rounded-t-3xl shadow-2xl z-20 pb-14">
      
      {/* Row 2: Hero Controls & Settings */}
      <div className="flex items-center justify-between mb-8 mt-2 px-2">
        {/* Loop Setting */}
        <button 
          onClick={cycleLoop}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 hover:bg-gray-700 transition active:scale-95"
        >
          <span className="text-xs text-gray-400 mb-1">Loop</span>
          <span className="text-accent font-bold text-lg">
            {loopCount === Infinity 
              ? '∞' 
              : (isPlaying && playMode === 'loop')
                ? `${currentLoop + 1}/${loopCount}` 
                : `${loopCount}x`
            }
          </span>
        </button>

        {/* Loop Play Button */}
        <button 
          onClick={onLoopPlay}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition active:scale-95 ${
            isPlaying && playMode === 'loop' ? 'bg-accent text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          {isPlaying && playMode === 'loop' ? (
             <Pause className="w-8 h-8 fill-current" />
          ) : (
             <Repeat className="w-8 h-8" />
          )}
        </button>

        {/* Speed Setting */}
        <button 
          onClick={cycleSpeed}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 hover:bg-gray-700 transition active:scale-95"
        >
          <span className="text-xs text-gray-400 mb-1">Speed</span>
          <span className="text-accent font-bold text-lg">{speed}x</span>
        </button>
      </div>

      {/* Row 3: Fine Tune */}
      <div className="flex justify-between gap-4">
        {/* Start Control */}
        <div className="flex-1 bg-gray-800/50 rounded-2xl p-3 flex flex-col items-center justify-center gap-2">
           <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">Start</div>
           <div className="text-xl font-bold text-white font-mono">{regionStart}</div>
           <div className="flex w-full gap-2 mt-1">
              <button 
                 onClick={() => onFineTune('start', -0.1)}
                 className="flex-1 py-2 bg-gray-700/50 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-600 active:scale-95 transition"
              >
                 -0.1s
              </button>
              <button 
                 onClick={() => onFineTune('start', 0.1)}
                 className="flex-1 py-2 bg-gray-700/50 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-600 active:scale-95 transition"
              >
                 +0.1s
              </button>
           </div>
        </div>

        {/* End Control */}
        <div className="flex-1 bg-gray-800/50 rounded-2xl p-3 flex flex-col items-center justify-center gap-2">
           <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">End</div>
           <div className="text-xl font-bold text-white font-mono">{regionEnd}</div>
           <div className="flex w-full gap-2 mt-1">
              <button 
                 onClick={() => onFineTune('end', -0.1)}
                 className="flex-1 py-2 bg-gray-700/50 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-600 active:scale-95 transition"
              >
                 -0.1s
              </button>
              <button 
                 onClick={() => onFineTune('end', 0.1)}
                 className="flex-1 py-2 bg-gray-700/50 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-600 active:scale-95 transition"
              >
                 +0.1s
              </button>
           </div>
        </div>
      </div>

      {/* Slogan at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center select-none opacity-80">
        <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 text-center">
          Practice Makes Perfect, We Make Practice Easy.
        </div>
      </div>
    </div>
  );
};

export default ControlDeck;

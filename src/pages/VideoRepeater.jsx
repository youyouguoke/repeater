import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Upload, CheckCircle, ArrowRight, Music, Play } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import VideoTimeline from '../components/VideoTimeline';
import VideoControlDeck from '../components/VideoControlDeck';
import { trackEvent, trackPageview, EVENTS } from '../lib/analytics';

function VideoRepeater() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopCount, setLoopCount] = useState(Infinity);
  const [speed, setSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [regionStart, setRegionStart] = useState(0);
  const [regionEnd, setRegionEnd] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    trackPageview('/video');
  }, []);

  const handleFile = useCallback((selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setIsPlaying(false);
      setCurrentTime(0);
      setRegionStart(0);
      setRegionEnd(0);
      trackEvent(EVENTS.FILE_UPLOAD, { type: selectedFile.type });
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const toggleLoopPlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((dur) => {
    setDuration(dur);
    setRegionEnd(dur);
  }, []);

  const handleSeek = useCallback((time) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
    }
    setCurrentTime(time);
  }, []);

  const handleSetStart = useCallback(() => {
    const time = videoRef.current?.getCurrentTime() || currentTime;
    setRegionStart(Math.min(time, regionEnd - 0.5));
  }, [currentTime, regionEnd]);

  const handleSetEnd = useCallback(() => {
    const time = videoRef.current?.getCurrentTime() || currentTime;
    setRegionEnd(Math.max(time, regionStart + 0.5));
  }, [currentTime, regionStart]);

  const handleResetRegion = useCallback(() => {
    setRegionStart(0);
    setRegionEnd(duration);
  }, [duration]);

  const handleReplaySegment = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.seek(regionStart);
      setIsPlaying(true);
    }
  }, [regionStart]);

  const handleStepFrame = useCallback((direction) => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.stepFrame(direction);
    }
  }, []);

  const handleQuickLoop = useCallback((seconds) => {
    const end = videoRef.current?.getCurrentTime() || currentTime;
    const start = Math.max(0, end - seconds);
    setRegionStart(start);
    setRegionEnd(end);
    if (videoRef.current) {
      videoRef.current.seek(start);
    }
    setIsPlaying(true);
  }, [currentTime]);

  const handleLoopStartChange = useCallback((time) => {
    setRegionStart(time);
  }, []);

  const handleLoopEndChange = useCallback((time) => {
    setRegionEnd(time);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          toggleLoopPlay();
          break;
        case 'a':
          handleSetStart();
          break;
        case 'b':
          handleSetEnd();
          break;
        case 'r':
          handleResetRegion();
          break;
        case 'arrowleft':
          e.preventDefault();
          handleStepFrame(-1);
          break;
        case 'arrowright':
          e.preventDefault();
          handleStepFrame(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLoopPlay, handleSetStart, handleSetEnd, handleResetRegion, handleStepFrame]);

  const formatTime = (time) => {
    if (!time && time !== 0) return '00:00.0';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const faqs = [
    {
      q: 'Can I loop part of a video?',
      a: 'Yes. Simply drag the A and B markers on the timeline to define the section you want to loop, then press Play.',
    },
    {
      q: 'What video formats are supported?',
      a: 'We support MP4, WebM, MOV, and M4V files. Most modern browser-compatible formats work seamlessly.',
    },
    {
      q: 'Can I slow down video playback?',
      a: 'Absolutely. You can set playback speed as low as 0.25x, which is perfect for analyzing dance moves, sports techniques, or piano fingerings frame by frame.',
    },
    {
      q: 'Can I loop videos infinitely?',
      a: 'Yes. Select the ∞ (infinity) option in the Repeat Count controls for endless looping.',
    },
    {
      q: 'Do you upload my files?',
      a: 'No. All video processing happens entirely in your browser. Your files never leave your device, ensuring complete privacy.',
    },
    {
      q: 'Can I use Video Repeater on mobile?',
      a: 'Yes. The Video Repeater is fully responsive and works on modern iOS and Android browsers.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Navigation */}
      <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-gutter max-w-max-width mx-auto">
          <div className="text-label-md font-headline-md font-bold text-on-surface">Online Repeater</div>
          <nav className="hidden md:flex items-center space-x-lg">
            <button
              onClick={() => navigate('/')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Audio Repeater
            </button>
            <button className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1">
              Video Repeater
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('faq');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              FAQ
            </button>
          </nav>
          <div className="flex items-center gap-md">
            <button className="font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low px-md py-sm rounded-lg transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-max-width mx-auto px-gutter py-xl">
        {/* Hero Section */}
        <section className="text-center mb-xl">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary-container/20 px-3 py-1 rounded-full mb-md">
            <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase">No Upload to Servers · Browser-Based · Free</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Video Repeater</h1>
          <p className="max-w-2xl mx-auto font-body-lg text-body-lg text-on-surface-variant mb-md">
            Loop any section of a video instantly. Perfect for dance practice, sports training, tutorial learning, and skill development.
          </p>
          <div className="flex justify-center items-center gap-sm text-label-sm font-label-sm text-outline">
            <span>Dance Practice</span>
            <span className="text-outline-variant">•</span>
            <span>Sports Training</span>
            <span className="text-outline-variant">•</span>
            <span>Tutorials</span>
          </div>
        </section>

        {/* Upload Area */}
        {!file && (
          <section className="mb-xl">
            <div
              className={`relative border-2 border-dashed rounded-xl p-xl text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-primary bg-primary-container/5'
                  : 'border-primary-container/30 bg-surface-container-lowest hover:border-primary-container/60'
              }`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center gap-md">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface mb-xs">Upload Video File</p>
                  <p className="text-body-md text-on-surface-variant">Drag and drop or click to browse</p>
                </div>
                <div className="flex items-center gap-sm text-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-primary" /> MP4</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-primary" /> WebM</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-primary" /> MOV</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-primary" /> M4V</span>
                </div>
                <p className="text-label-sm text-on-surface-variant">Private Processing · No Upload · Free</p>
              </div>
            </div>
          </section>
        )}

        {/* Video Workspace */}
        {file && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm mb-xl space-y-4">
            {/* Video Player */}
            <VideoPlayer
              ref={videoRef}
              file={file}
              isPlaying={isPlaying}
              speed={speed}
              loopStart={regionStart}
              loopEnd={regionEnd}
              loopCount={loopCount}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onSeek={handleSeek}
              onEnded={handleVideoEnded}
              onReady={handleDurationChange}
            />

            {/* Timeline */}
            <VideoTimeline
              duration={duration}
              currentTime={currentTime}
              loopStart={regionStart}
              loopEnd={regionEnd}
              onLoopStartChange={handleLoopStartChange}
              onLoopEndChange={handleLoopEndChange}
              onSeek={handleSeek}
              isPlaying={isPlaying}
            />

            {/* Controls */}
            <VideoControlDeck
              isPlaying={isPlaying}
              onLoopPlay={toggleLoopPlay}
              loopCount={loopCount}
              onLoopChange={setLoopCount}
              speed={speed}
              onSpeedChange={setSpeed}
              onReplaySegment={handleReplaySegment}
              onResetRegion={handleResetRegion}
              onSetStart={handleSetStart}
              onSetEnd={handleSetEnd}
              onStepFrame={handleStepFrame}
              onQuickLoop={handleQuickLoop}
              regionStart={regionStart}
              regionEnd={regionEnd}
              currentTime={currentTime}
              duration={duration}
            />
          </section>
        )}

        {/* How to Use */}
        <section className="mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-lg text-center">How to Use Video Repeater</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl max-w-3xl mx-auto">
            <div className="space-y-md">
              <div className="flex gap-md">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">1</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Upload Your Video</p>
                  <p className="text-body-md text-on-surface-variant">Select a video file from your device. Processing happens entirely in your browser for complete privacy.</p>
                </div>
              </div>
              <div className="flex gap-md">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">2</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Define the Loop</p>
                  <p className="text-body-md text-on-surface-variant">Drag marker A to the start and marker B to the end of the section you want to repeat.</p>
                </div>
              </div>
            </div>
            <div className="space-y-md">
              <div className="flex gap-md">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">3</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Adjust Settings</p>
                  <p className="text-body-md text-on-surface-variant">Fine-tune playback speed or set a specific repeat count. Use Frame Step for precise analysis.</p>
                </div>
              </div>
              <div className="flex gap-md">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">4</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Practice & Master</p>
                  <p className="text-body-md text-on-surface-variant">Hit Play and focus on your performance while the tool handles continuous looping.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Use Cases - 3 columns */}
        <section className="mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-lg text-center">Common Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="p-md bg-surface border border-outline-variant rounded-xl flex items-start gap-md hover:border-primary-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface mb-xs">Dance Practice</p>
                <p className="text-body-md text-on-surface-variant">Repeat difficult choreography until movements become natural.</p>
              </div>
            </div>
            <div className="p-md bg-surface border border-outline-variant rounded-xl flex items-start gap-md hover:border-primary-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface mb-xs">Sports Training</p>
                <p className="text-body-md text-on-surface-variant">Analyze swings, footwork, and athletic technique frame by frame.</p>
              </div>
            </div>
            <div className="p-md bg-surface border border-outline-variant rounded-xl flex items-start gap-md hover:border-primary-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface mb-xs">Tutorial Learning</p>
                <p className="text-body-md text-on-surface-variant">Loop coding, cooking, or DIY demonstrations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section className="mb-xl">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface mb-xs">Related Tools</p>
              <p className="text-body-md text-on-surface-variant">Also try our Audio Repeater for language learning and music practice.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity"
            >
              <Music className="w-4 h-4" />
              Audio Repeater
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-lg">Frequently Asked Questions</h2>
          <div className="space-y-md">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-outline-variant rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-md text-left"
                >
                  <span className="font-label-md text-label-md text-on-surface">{faq.q}</span>
                  <span className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-md pb-md text-body-md text-on-surface-variant border-t border-outline-variant pt-md">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center py-lg px-gutter max-w-max-width mx-auto">
          <div className="flex flex-col gap-1 mb-md md:mb-0 text-center md:text-left">
            <span className="font-label-md font-bold text-on-surface">Online Repeater</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Online Repeater. Privacy-focused media tools.</span>
          </div>
          <nav className="flex gap-lg">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Privacy Policy</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Terms of Service</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Contact</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">About</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default VideoRepeater;

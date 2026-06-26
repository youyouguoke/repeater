import React, { useState, useRef, useEffect } from 'react';
import { Music, Languages, FileText, CheckCircle, ChevronDown, ChevronUp, Upload, Headphones, Guitar, Piano, Mic, BookOpen, Globe, Volume2, ArrowRight, Video, Youtube, Wrench, Shield, Mail, ExternalLink, Menu, X } from 'lucide-react';
import WaveformStage from './components/WaveformStage';
import ControlDeck from './components/ControlDeck';
import { trackEvent, trackPageview, EVENTS } from './lib/analytics';

function App() {
  const [file, setFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopCount, setLoopCount] = useState(Infinity);
  const [speed, setSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [regionStart, setRegionStart] = useState(0);
  const [regionEnd, setRegionEnd] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(0);
  const [activeNav, setActiveNav] = useState('tool');
  const [dragActive, setDragActive] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dragCounter = useRef(0);

  const waveformRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastPauseTimeRef = useRef(0);
  const prevIsPlayingRef = useRef(isPlaying);

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
      setIsPlaying(false);
      trackEvent(EVENTS.FILE_UPLOAD, { format: uploadedFile.name.split('.').pop().toLowerCase() });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
      setIsPlaying(false);
      trackEvent(EVENTS.FILE_DROP, { format: droppedFile.name.split('.').pop().toLowerCase() });
    }
  };

  const toggleLoopPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      trackEvent(EVENTS.PAUSE_CLICK);
    } else {
      setIsPlaying(true);
      trackEvent(EVENTS.PLAY_CLICK);
      const timeDiff = Math.abs(currentTime - lastPauseTimeRef.current);
      if (timeDiff > 0.1) {
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
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === ' ') {
        e.preventDefault();
        toggleLoopPlay();
      }
      if (key === 'a') {
        e.preventDefault();
        waveformRef.current?.setStartMarker();
      }
      if (key === 'b') {
        e.preventDefault();
        waveformRef.current?.setEndMarker();
      }
      if (key === 'r') {
        e.preventDefault();
        waveformRef.current?.resetRegion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 300) setActiveNav('tool');
      else setActiveNav('faq');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    if (id === 'tool') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveNav('tool');
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setActiveNav(id);
    }
    trackEvent(EVENTS.NAV_CLICK, { section: id });
  };

  const toggleFaq = (index) => {
    const isOpening = openFaq !== index;
    setOpenFaq(isOpening ? index : null);
    if (isOpening) {
      trackEvent(EVENTS.FAQ_TOGGLE, { question_index: index });
    }
  };

  const faqData = [
    {
      q: "How do I repeat part of an audio file?",
      a: "Upload your audio file, then click the play button. When you reach the starting point, click 'Set' under A (or press A). Continue to the end point and click 'Set' under B (or press B). The audio will loop between these two markers."
    },
    {
      q: "What audio formats are supported?",
      a: "We support MP3, WAV, M4A, AAC, and OGG. If your browser can play the file, our repeater can loop it."
    },
    {
      q: "Can I slow down audio playback?",
      a: "Yes. Adjust playback speed from 0.5x to 2x without affecting pitch. Perfect for slow-motion practice."
    },
    {
      q: "Is Audio Repeater free?",
      a: "Yes, completely free. No hidden costs or subscription fees."
    },
    {
      q: "Do you upload my files?",
      a: "No. Files are processed locally in your browser. Your audio never leaves your computer."
    },
    {
      q: "Can I use Audio Repeater on mobile?",
      a: "Yes. It works on all modern browsers including mobile Safari and Chrome."
    },
    {
      q: "Is there a file size limit?",
      a: "No artificial limits. The only constraints are your device's memory and browser capabilities."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-background font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-on-primary" />
            </div>
            <span className="font-semibold text-lg text-on-surface">Online Repeater</span>
          </div>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('tool')}
              className={`text-sm font-medium transition-colors ${activeNav === 'tool' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Audio Repeater
            </button>
            <a 
              href="/video"
              className="text-sm font-medium transition-colors text-on-surface-variant hover:text-on-surface"
            >
              Video Repeater
            </a>
            <a 
              href="/youtube"
              className="text-sm font-medium transition-colors text-on-surface-variant hover:text-on-surface"
            >
              YouTube Looper
            </a>
            <button 
              onClick={() => scrollToSection('faq')}
              className={`text-sm font-medium transition-colors ${activeNav === 'faq' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              FAQ
            </button>
          </div>
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-on-surface" /> : <Menu className="w-5 h-5 text-on-surface" />}
          </button>
        </div>
        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant bg-surface/95 backdrop-blur-xl">
            <div className="px-gutter py-3 space-y-1">
              <button 
                onClick={() => { scrollToSection('tool'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeNav === 'tool' ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
              >
                Audio Repeater
              </button>
              <a 
                href="/video"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                Video Repeater
              </a>
              <a 
                href="/youtube"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                YouTube Looper
              </a>
              <button 
                onClick={() => { scrollToSection('faq'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeNav === 'faq' ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
              >
                FAQ
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Compact */}
      <header className="pt-9 pb-9 text-center">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low border border-outline-variant rounded-full text-xs text-on-surface-variant mb-9">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            NO UPLOAD TO SERVERS . BROWSER-BASED . FREE
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-on-surface mb-9 max-w-3xl mx-auto leading-tight tracking-tight">
            Audio Repeater
          </h1>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Loop any section of audio instantly. Perfect for music practice, language learning, and transcription. No installation required.
          </p>
        </div>
      </header>

      {/* Use Case Tags - Only show when no file uploaded */}
      {!file && (
        <div className="max-w-container-max mx-auto px-gutter pb-6 space-y-6">
          <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
            <Music className="w-4 h-4" />
            <span>Music Practice</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
            <Headphones className="w-4 h-4" />
            <span>Language Learning</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
            <FileText className="w-4 h-4" />
            <span>Transcription</span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />

      {/* Tool Interface - fills remaining viewport */}
      <section id="tool" className="max-w-container-max mx-auto px-gutter flex-1 flex flex-col min-h-[calc(100vh-450px)]">
        {!file && (
          <div className="flex-1 flex items-center justify-center">
            <div
              onClick={triggerFileUpload}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`group w-full max-w-2xl border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-primary bg-surface-container'
                  : 'border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary'
              }`}
            >
              <Upload className="w-8 h-8 text-on-surface-variant mb-4 group-hover:text-primary transition-colors" />
              <p className="text-lg font-medium text-on-surface mb-1">Upload Audio File</p>
              <p className="text-sm text-on-surface-variant">Drag and drop or click to browse</p>
              <div className="flex gap-2 flex-wrap justify-center mt-6">
                {['MP3', 'WAV', 'M4A', 'AAC', 'OGG'].map((fmt) => (
                  <span key={fmt} className="px-3 py-1 bg-surface-container-highest text-xs font-mono rounded text-on-surface-variant">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {file && (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="text-center">
              <div className="text-sm text-on-surface-variant mb-1 font-mono uppercase tracking-wider">Current Time</div>
              <div className="text-5xl font-mono font-bold tracking-tighter text-on-surface">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-on-surface-variant mt-1 font-mono">
                / {formatTime(duration)}
              </div>
            </div>

            <div className="text-xs text-on-surface-variant font-mono truncate px-gutter max-w-container-max mx-auto">
              {file.name}
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-6 shadow-sm space-y-6">
              <WaveformStage
                ref={waveformRef}
                file={file}
                isPlaying={isPlaying}
                speed={speed}
                loopCount={loopCount}
                onTimeUpdate={handleTimeUpdate}
                onRegionUpdate={handleRegionUpdate}
                onLoopProgress={handleLoopProgress}
                onReady={(dur) => setDuration(dur)}
                onFinish={() => setIsPlaying(false)}
              />

              <ControlDeck
                isPlaying={isPlaying}
                onLoopPlay={toggleLoopPlay}
                loopCount={loopCount}
                currentLoop={currentLoop}
                onLoopChange={setLoopCount}
                speed={speed}
                onSpeedChange={setSpeed}
                onReplaySegment={() => {
                  waveformRef.current?.replaySegment();
                  setIsPlaying(true);
                }}
                onResetRegion={() => waveformRef.current?.resetRegion()}
                onSetStart={() => waveformRef.current?.setStartMarker()}
                onSetEnd={() => waveformRef.current?.setEndMarker()}
                regionStart={formatTime(regionStart)}
                regionEnd={formatTime(regionEnd)}
              />
            </div>
          </div>
        )}
      </section>

      {/* What Is an Audio Repeater */}
      <section className="mt-[60px] py-16 border-t border-outline-variant bg-surface">
        <div className="max-w-3xl mx-auto px-gutter">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-8 text-on-surface">What Is an Audio Repeater?</h2>
          </div>
          <div className="space-y-6 text-base text-on-surface-variant leading-loose">
            <p>
              An audio repeater is a specialized digital tool designed to loop specific portions of an audio file indefinitely. Unlike standard media players that play a file from beginning to end, a repeater allows users to set precise "A" and "B" markers, creating a continuous playback loop that helps with focused auditory tasks.
            </p>
            <p>
              Our platform leverages modern web technologies to process your audio entirely within your browser. This means your files are never uploaded to a remote server, ensuring total privacy and near-instant processing speeds regardless of your internet connection once the page is loaded.
            </p>
            <p>
              Whether you're a professional transcriptionist, a dedicated musician, or a student learning a new language, the ability to manipulate audio playback—adjusting speed and isolating segments—is an essential utility for high-performance learning and work.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 border-t border-outline-variant bg-surface">
        <div className="max-w-container-max mx-auto px-gutter">
          <h2 className="text-3xl font-semibold text-center mb-12 text-on-surface">Designed for Focus</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-surface-container-low border border-outline-variant rounded-xl group hover:border-primary transition-all">
              <div className="w-14 h-14 bg-primary-container text-on-primary-fixed-variant rounded-lg flex items-center justify-center mb-6">
                <Music className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-on-surface">Music Practice</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Isolate complex guitar solos, difficult piano passages, or vocal runs. Slow down the tempo without changing pitch to master every note.
              </p>
            </div>
            <div className="p-8 bg-surface-container-low border border-outline-variant rounded-xl group hover:border-primary transition-all">
              <div className="w-14 h-14 bg-primary-container text-on-primary-fixed-variant rounded-lg flex items-center justify-center mb-6">
                <Languages className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-on-surface">Language Learning</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Repeat difficult pronunciations or shadow-record native speakers. Perfectly loop single sentences to nail the perfect accent.
              </p>
            </div>
            <div className="p-8 bg-surface-container-low border border-outline-variant rounded-xl group hover:border-primary transition-all">
              <div className="w-14 h-14 bg-primary-container text-on-primary-fixed-variant rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-on-surface">Transcription</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Effortlessly transcribe interviews or lectures. Use keyboard shortcuts to toggle loops and control speed, keeping your hands on the keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 max-w-3xl mx-auto px-gutter">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4 text-on-surface">How to Use</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
            <div>
              <h3 className="font-medium text-on-surface text-sm mb-1">Upload your audio file</h3>
              <p className="text-xs text-on-surface-variant">Drag and drop or click to browse. Supports MP3, WAV, M4A, AAC, OGG.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
            <div>
              <h3 className="font-medium text-on-surface text-sm mb-1">Set A and B markers</h3>
              <p className="text-xs text-on-surface-variant">Press A at start point, B at end point. Or click Set buttons.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
            <div>
              <h3 className="font-medium text-on-surface text-sm mb-1">Choose speed and loop count</h3>
              <p className="text-xs text-on-surface-variant">Select 0.5x–2x speed. Pick 1x, 5x, 10x, or infinite loops.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
            <div>
              <h3 className="font-medium text-on-surface text-sm mb-1">Start practicing</h3>
              <p className="text-xs text-on-surface-variant">Press Space to play/pause. Press R to reset markers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 border-t border-outline-variant bg-surface">
        <div className="max-w-container-max mx-auto px-gutter">
          <h2 className="text-3xl font-semibold text-center mb-12 text-on-surface">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-6 transition-all cursor-pointer ${
                  openFaq === index ? 'ring-1 ring-primary' : ''
                }`}
                onClick={() => toggleFaq(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-on-surface pr-4">{faq.q}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-outline flex-shrink-0" />
                  )}
                </div>
                {openFaq === index && (
                  <div className="mt-4 text-on-surface-variant leading-relaxed text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              <span className="font-semibold text-on-surface">Online Repeater</span>
              <span className="text-sm text-on-surface-variant">© 2026</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="/video" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Video Repeater</a>
              <a href="/youtube" className="text-sm text-on-surface-variant hover:text-primary transition-colors">YouTube Looper</a>
              <a href="/about" className="text-sm text-on-surface-variant hover:text-primary transition-colors">About</a>
              <a href="/privacy" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/contact" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

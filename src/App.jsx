import React, { useState, useRef, useEffect } from 'react';
import { Music, Languages, FileText, CheckCircle, ChevronDown, ChevronUp, Upload, Headphones, Guitar, Piano, Mic, BookOpen, Globe, Volume2, ArrowRight, Video, Youtube, Wrench, Shield, Mail, ExternalLink } from 'lucide-react';
import WaveformStage from './components/WaveformStage';
import ControlDeck from './components/ControlDeck';

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
    }
  };

  const toggleLoopPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
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
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "How do I repeat part of an audio file?",
      a: "Upload your audio file, then click the play button. When you reach the starting point, click 'Set Current' under Start (or press A). Continue playing to the end point and click 'Set Current' under End (or press B). The audio will automatically loop between these two markers."
    },
    {
      q: "Can I loop MP3 files online?",
      a: "Yes, you can loop MP3 files directly in your browser. Simply upload your MP3 file and set A/B markers to create loops. We also support WAV, M4A, AAC, and OGG formats."
    },
    {
      q: "Can I loop WAV files?",
      a: "Absolutely. WAV files work perfectly with our audio repeater. Since WAV is uncompressed, you'll get the highest quality loops for professional music practice and transcription."
    },
    {
      q: "Can I repeat part of a song?",
      a: "Yes! Upload any song file, set the A marker at the beginning of the section you want to practice, and the B marker at the end. The song will loop continuously between those two points."
    },
    {
      q: "Can I slow down audio playback?",
      a: "Absolutely. You can adjust playback speed from 0.5x to 2x without affecting pitch. This is perfect for slow-motion practice when learning music or transcribing speech."
    },
    {
      q: "Is Audio Repeater free?",
      a: "Yes, Audio Repeater Online is completely free to use. We believe in providing high-quality audio tools for students, musicians, and creators without any hidden costs or subscription fees."
    },
    {
      q: "Do you upload my files?",
      a: "No. Files are processed locally in your browser. Your audio never leaves your computer. We don't have access to what you're listening to, ensuring complete privacy."
    },
    {
      q: "Can I use Audio Repeater on mobile?",
      a: "Yes, Audio Repeater Online works on all modern browsers including mobile Safari and Chrome. The interface is fully responsive and touch-friendly."
    },
    {
      q: "What browsers are supported?",
      a: "We support Chrome, Firefox, Safari, and Edge. Any modern browser that supports Web Audio API will work with our audio repeater."
    },
    {
      q: "Can I repeat audio infinitely?",
      a: "Yes! Select the ∞ (infinity) option in the Loop Count section. The audio will loop continuously between your A and B markers until you manually stop it."
    },
    {
      q: "Is there a file size limit?",
      a: "There are no artificial limits. The only constraints are your device's memory and browser capabilities. Most users can process files up to several hours long without issues."
    },
    {
      q: "What audio formats are supported?",
      a: "We support all major audio formats including MP3, WAV, AAC, M4A, and OGG. If your browser can play the file, our repeater can loop it."
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
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('tool')}
              className={`text-sm font-medium transition-colors ${activeNav === 'tool' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Audio Repeater
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className={`text-sm font-medium transition-colors ${activeNav === 'faq' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              FAQ
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-16 pb-12 text-center">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full mb-6 border border-outline-variant">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">No upload to servers · Browser-based · Free</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-on-surface mb-6 max-w-3xl mx-auto leading-tight tracking-tight">
            Audio Repeater Online
          </h1>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            Loop any section of audio instantly. Perfect for music practice, language learning, and transcription. No installation required.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-xs text-on-surface-variant border border-outline-variant">
              <Music className="w-3.5 h-3.5" /> Music Practice
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-xs text-on-surface-variant border border-outline-variant">
              <Languages className="w-3.5 h-3.5" /> Language Learning
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-xs text-on-surface-variant border border-outline-variant">
              <FileText className="w-3.5 h-3.5" /> Transcription
            </span>
          </div>
          <button
            onClick={triggerFileUpload}
            className="bg-primary text-on-primary px-8 py-4 rounded-xl font-medium text-lg flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 mx-auto"
          >
            <Upload className="w-5 h-5" />
            Upload Audio
          </button>
          <p className="text-sm text-on-surface-variant mt-4">
            Supports MP3, WAV, M4A, AAC and OGG
          </p>
        </div>
      </header>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />

      {/* Tool Interface */}
      <section id="tool" className="max-w-container-max mx-auto px-gutter pb-16">
        {!file && (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`group border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragActive
                ? 'border-primary bg-surface-container'
                : 'border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary'
            }`}
          >
            <div className="text-center mb-6">
              <p className="text-lg text-on-surface-variant mb-2">Drop audio here</p>
              <p className="text-sm text-on-surface-variant">or</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerFileUpload();
              }}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95 mb-6"
            >
              Select Audio File
            </button>
            <div className="flex gap-2 flex-wrap justify-center">
              {['MP3', 'WAV', 'M4A', 'AAC', 'OGG'].map((fmt) => (
                <span key={fmt} className="px-3 py-1 bg-surface-container-highest text-xs font-mono rounded text-on-surface-variant">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}

        {file && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-sm text-on-surface-variant mb-2 font-mono uppercase tracking-wider">Current Time</div>
              <div className="text-5xl font-mono font-bold tracking-tighter text-on-surface">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-on-surface-variant mt-1 font-mono">
                / {formatTime(duration)}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
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
            </div>

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

            <div className="text-center text-xs text-on-surface-variant font-mono">
              {file.name}
            </div>
          </div>
        )}
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

      {/* How to Use Section - EXPANDED */}
      <section className="py-16 max-w-3xl mx-auto px-gutter">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-on-surface">How to Use Audio Repeater</h2>
          <p className="text-on-surface-variant">Get started in five simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="flex gap-4 p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h3 className="font-medium text-on-surface mb-2">Upload your audio file</h3>
              <p className="text-sm text-on-surface-variant">Drag and drop or click "Select Audio File" to upload MP3, WAV, M4A, AAC, or OGG files. Your audio is processed locally in your browser.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h3 className="font-medium text-on-surface mb-2">Set start point</h3>
              <p className="text-sm text-on-surface-variant">Play the audio and click "Set Current" at your desired starting point, or press the A key on your keyboard. The A marker will appear on the waveform.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h3 className="font-medium text-on-surface mb-2">Set end point</h3>
              <p className="text-sm text-on-surface-variant">Continue playing to where you want the loop to end. Click "Set Current" under End, or press B. The section between A and B will be highlighted.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold">4</div>
            <div>
              <h3 className="font-medium text-on-surface mb-2">Adjust playback speed</h3>
              <p className="text-sm text-on-surface-variant">Select from 0.5x to 2x speed. Slow down for difficult passages without changing pitch. Perfect for mastering fast solos or complex speech.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-surface-container-low border border-outline-variant rounded-xl md:col-span-2">
            <div className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center flex-shrink-0 font-bold">5</div>
            <div>
              <h3 className="font-medium text-on-surface mb-2">Start looping</h3>
              <p className="text-sm text-on-surface-variant">Choose your loop count (1x, 5x, 10x, or infinite) and press Play. The audio will automatically repeat between your markers. Use keyboard shortcuts: Space (Play/Pause), R (Reset).</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 text-base text-on-surface-variant leading-loose">
          <p>
            Learning how to repeat audio online is simple with our free audio loop tool. Whether you need to repeat MP3 files for music practice or loop audio sections for language learning, the process remains the same. Upload your audio file, set precise A and B markers, adjust the playback speed, and let the audio repeater handle the continuous looping.
          </p>
          <p>
            Unlike traditional audio loop software that requires installation, our online audio repeater works directly in your browser. This means you can repeat audio online from any device—Windows, Mac, Linux, or even mobile phones—without downloading anything. The tool processes everything locally, so your files never leave your computer, making it the safest way to loop audio files for practice and learning.
          </p>
          <p>
            Many users search for how to loop audio or how to repeat part of a song. Our audio repeater answers both needs. Musicians use it to break down complex passages, language learners use it for shadowing exercises, and transcriptionists use it to catch every word. The ability to slow down audio playback while maintaining pitch makes it an essential tool for anyone serious about auditory learning.
          </p>
        </div>
      </section>

      {/* What Is an Audio Repeater */}
      <section className="py-16 border-t border-outline-variant bg-surface">
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

      {/* Detailed Music Practice Section */}
      <section className="py-16 max-w-3xl mx-auto px-gutter">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-on-surface">Audio Repeater for Music Practice</h2>
          <p className="text-on-surface-variant">Master your instrument with precision looping</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Guitar className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-on-surface">Guitar Practice</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Isolate challenging guitar solos and riffs. Loop specific measures to master finger positioning and strumming patterns at your own pace.
            </p>
          </div>
          <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Piano className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-on-surface">Piano Practice</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Break down complex piano passages into manageable sections. Slow down difficult arpeggios and chord progressions without losing clarity.
            </p>
          </div>
          <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-on-surface">Drums & Percussion</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Loop drum fills and rhythmic patterns to internalize timing and groove. Perfect for learning complex polyrhythms and syncopation.
            </p>
          </div>
          <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Mic className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-on-surface">Vocal Practice</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Repeat vocal runs and melodic phrases to improve pitch accuracy and breath control. Loop challenging sections until they become second nature.
            </p>
          </div>
        </div>
        <div className="text-base text-on-surface-variant leading-loose">
          <p>
            Musicians across all instruments rely on audio repeaters to accelerate their learning. Whether you're practicing bass lines, violin concertos, or saxophone improvisations, the ability to isolate and repeat specific sections is invaluable. Our audio repeater for music practice supports all genres—from classical to jazz, rock to electronic—making it the perfect companion for dedicated musicians at any skill level.
          </p>
        </div>
      </section>

      {/* Detailed Language Learning Section */}
      <section className="py-16 border-t border-outline-variant bg-surface">
        <div className="max-w-3xl mx-auto px-gutter">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-on-surface">Audio Repeater for Language Learning</h2>
            <p className="text-on-surface-variant">Perfect your listening and pronunciation skills</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-on-surface">English Listening</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Loop English podcasts, news segments, and dialogues to improve comprehension. Slow down native speakers to catch every word and intonation.
              </p>
            </div>
            <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-on-surface">Shadowing Practice</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Use the shadowing technique by repeating after native speakers in real-time. Loop sentences until your pronunciation matches perfectly.
              </p>
            </div>
            <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Languages className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-on-surface">Japanese Learning</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Master Japanese pitch accent and rhythm by looping anime dialogues and podcast episodes. Essential for nailing those subtle tonal differences.
              </p>
            </div>
            <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-on-surface">Spanish Pronunciation</h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Practice rolling your R's and mastering Spanish rhythm patterns. Loop conversational Spanish to develop authentic pronunciation and fluency.
              </p>
            </div>
          </div>
          <div className="text-base text-on-surface-variant leading-loose">
            <p>
              Language learners worldwide use audio repeaters to accelerate their progress. The ability to repeat audio for language learning—whether for English listening practice, Japanese shadowing, or Spanish pronunciation—provides an immersive experience that textbooks cannot match. By looping native speech and adjusting playback speed, you train your ear to recognize subtle sounds and patterns that are crucial for fluency.
            </p>
          </div>
        </div>
      </section>

      {/* Why Use Audio Repeater - NEW SECTION */}
      <section className="py-16 max-w-3xl mx-auto px-gutter">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-on-surface">Why Use Audio Repeater?</h2>
          <p className="text-on-surface-variant">Discover how looping audio transforms your practice</p>
        </div>
        <div className="space-y-8 text-base text-on-surface-variant leading-loose">
          <div>
            <h3 className="text-xl font-medium text-on-surface mb-3">Music Practice</h3>
            <p>
              Musicians have used audio repetition for decades to master their craft. Our audio repeater takes this proven technique and makes it accessible to everyone. Whether you're learning guitar solos, piano concertos, or drum fills, the ability to isolate and loop specific sections is invaluable. Slow down the tempo without changing pitch, and practice until every note is perfect. From classical violinists to jazz improvisers, audio looping is the secret weapon of serious musicians.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-on-surface mb-3">Language Learning</h3>
            <p>
              The most effective language learners immerse themselves in native audio. Our audio repeater makes this immersion precise and controlled. Loop single sentences to practice pronunciation, shadow native speakers to develop rhythm, and slow down rapid speech to catch every word. Whether you're learning English, Japanese, Spanish, or any other language, repeated exposure to authentic audio is the fastest path to fluency. The shadowing technique—repeating immediately after a native speaker—becomes effortless with precise loop control.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-on-surface mb-3">Audio Transcription</h3>
            <p>
              Professional transcriptionists know that difficult audio requires repetition. Interviews with poor recording quality, fast-paced lectures, and heavily accented speech all become manageable when you can loop and slow down specific sections. Our audio repeater gives you the control to catch every word without rewinding manually. The keyboard shortcuts (Space for play/pause, A/B for markers) keep your hands on the keyboard and your focus on the content.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-on-surface mb-3">Podcast Analysis</h3>
            <p>
              Podcasters, journalists, and researchers often need to analyze audio content in detail. Our audio repeater lets you loop specific quotes, analyze speech patterns, and study interview techniques. Whether you're fact-checking a story, studying rhetorical devices, or analyzing conversational dynamics, precise audio looping gives you the analytical control you need.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-on-surface mb-3">Speech Practice</h3>
            <p>
              Public speakers, actors, and voice-over artists use audio repetition to perfect their delivery. Record yourself, loop specific phrases, and compare your pronunciation with reference audio. The ability to slow down and isolate sections helps you identify subtle issues in tone, pacing, and articulation that you might miss in normal playback.
            </p>
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
          {/* Related Tools */}
          <div className="mb-8 pb-8 border-b border-outline-variant">
            <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">Related Tools</h3>
            <div className="flex flex-wrap gap-4">
              <a href="/audio-repeater" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface-variant hover:text-primary hover:border-primary border border-outline-variant transition-all">
                <Headphones className="w-4 h-4" /> Audio Repeater
              </a>
              <a href="/repeat-mp3-online" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface-variant hover:text-primary hover:border-primary border border-outline-variant transition-all">
                <Music className="w-4 h-4" /> Repeat MP3
              </a>
              <a href="/loop-audio-online" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface-variant hover:text-primary hover:border-primary border border-outline-variant transition-all">
                <Volume2 className="w-4 h-4" /> Loop Audio
              </a>
              <a href="/audio-repeater-for-music-practice" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface-variant hover:text-primary hover:border-primary border border-outline-variant transition-all">
                <Guitar className="w-4 h-4" /> Music Practice
              </a>
              <a href="/repeat-audio-for-language-learning" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface-variant hover:text-primary hover:border-primary border border-outline-variant transition-all">
                <Languages className="w-4 h-4" /> Language Learning
              </a>
            </div>
          </div>
          
          {/* E-E-A-T Links */}
          <div className="mb-8 pb-8 border-b border-outline-variant">
            <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">Company</h3>
            <div className="flex flex-wrap gap-6">
              <a href="/about" className="text-sm text-on-surface-variant hover:text-primary transition-colors">About</a>
              <a href="/privacy" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/contact" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              <span className="font-semibold text-on-surface">Online Repeater</span>
              <span className="text-sm text-on-surface-variant">© 2026</span>
            </div>
            <div className="flex gap-6">
              <span className="text-sm text-on-surface-variant">Professional Grade Utility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

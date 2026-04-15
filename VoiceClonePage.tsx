import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Square, Volume2, Loader2, ArrowLeft, Download, Upload, FileAudio, X, Mic, StopCircle, Settings, Sliders, Activity, Headphones, Check, Mic2, FileUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';
import Navbar from '../components/Navbar';

const MODES = [
  { id: 'eco', name: 'Eco Mode', desc: 'Fast & efficient processing' },
  { id: 'studio', name: 'Studio Mode', desc: 'Pro noise reduction & clarity' },
  { id: 'podcast', name: 'Podcast Mode', desc: 'Smooth, warm & rich' },
  { id: 'cinematic', name: 'Cinematic Mode', desc: 'Deep & dramatic narration' },
  { id: 'natural', name: 'Natural Mode', desc: 'Enhanced original human voice' }
];

const EMOTIONS = ['Normal', 'Happy', 'Calm', 'Energetic', 'Professional'];

export default function VoiceClonePage() {
  // Input State
  const [inputType, setInputType] = useState<'upload' | 'record'>('upload');
  const [audioSample, setAudioSample] = useState<File | Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Settings State
  const [selectedMode, setSelectedMode] = useState('studio');
  const [controls, setControls] = useState({
    speed: 50, pitch: 50, bass: 50, clarity: 80, echo: 10, warmth: 60
  });
  const [selectedEmotion, setSelectedEmotion] = useState('Professional');
  const [noiseControls, setNoiseControls] = useState({
    noiseRemoval: true, echoReduction: true, backgroundCleanup: false
  });

  // Processing & Output State
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputReady, setOutputReady] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<'preview' | 'before' | 'after' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioSample(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioSample(file);
      setAudioUrl(URL.createObjectURL(file));
      setOutputReady(false);
    }
  };

  const clearAudio = () => {
    setAudioSample(null);
    setAudioUrl(null);
    setOutputReady(false);
    if (playingAudio) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    }
  };

  const getAudioName = () => {
    if (!audioSample) return '';
    if (audioSample instanceof File) return audioSample.name;
    return `Recorded_Audio_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`;
  };

  // --- Processing Logic ---
  const handleCloneVoice = async () => {
    if (!audioSample) return;
    setIsProcessing(true);
    setOutputReady(false);
    setPlayingAudio(null);
    if (audioRef.current) audioRef.current.pause();

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    setIsProcessing(false);
    setOutputReady(true);
  };

  // --- Playback Logic ---
  const togglePlay = (type: 'preview' | 'before' | 'after') => {
    if (!audioRef.current || !audioUrl) return;

    if (playingAudio === type) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      // In a real app, 'after' would point to a new processed URL.
      // Here we use the same URL to simulate the player UI.
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setPlayingAudio(type);
      audioRef.current.onended = () => setPlayingAudio(null);
    }
  };

  const handleCompare = async () => {
    if (!audioRef.current || !audioUrl) return;
    
    // Play Before
    setPlayingAudio('before');
    audioRef.current.src = audioUrl;
    audioRef.current.play();
    
    await new Promise(resolve => {
      audioRef.current!.onended = resolve;
    });
    
    setPlayingAudio(null);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Play After
    setPlayingAudio('after');
    audioRef.current.src = audioUrl;
    audioRef.current.play();
    
    await new Promise(resolve => {
      audioRef.current!.onended = resolve;
    });
    
    setPlayingAudio(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop();
    };
  }, [isRecording]);

  // --- Components ---
  const Slider = ({ label, value, field }: { label: string, value: number, field: keyof typeof controls }) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-cyan-400">{value}%</span>
      </div>
      <input 
        type="range" 
        min="0" max="100" 
        value={value} 
        onChange={(e) => setControls(prev => ({ ...prev, [field]: Number(e.target.value) }))}
        className="w-full h-2 bg-gray-800/80 rounded-lg appearance-none cursor-pointer accent-cyan-500 shadow-inner"
      />
    </div>
  );

  const Toggle = ({ label, active, field }: { label: string, active: boolean, field: keyof typeof noiseControls }) => (
    <button 
      onClick={() => setNoiseControls(prev => ({ ...prev, [field]: !active }))}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 flex-1 min-w-[180px] ${
        active ? 'neu-convex border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'neu-flat hover:bg-white/5'
      }`}
    >
      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${active ? 'bg-cyan-500 text-black' : 'bg-gray-800'}`}>
        {active && <Check className="w-3 h-3" />}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-cyan-300' : 'text-gray-400'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0d0e15] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      <Background />
      <audio ref={audioRef} className="hidden" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center pt-4 px-4 sm:px-6 pb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-5xl p-6 md:p-10 rounded-[32px] glass-neu flex flex-col gap-10 relative"
          >
            {/* Back Button */}
            <Link 
              to="/" 
              className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 group z-20"
            >
              <div className="p-2 rounded-full neu-flat group-hover:neu-pressed transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium hidden sm:block">Back</span>
            </Link>

            <div className="text-center mt-12 md:mt-0">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-glow-cyan mb-3">
                Voice Clone Studio
              </h1>
              <p className="text-gray-400 font-light">Professional-grade AI voice cloning and enhancement</p>
            </div>

            {/* --- Input Section --- */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 mb-2">
                <button 
                  onClick={() => setInputType('upload')}
                  className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${inputType === 'upload' ? 'neu-convex text-cyan-300 border border-cyan-500/30' : 'neu-flat text-gray-500'}`}
                >
                  <FileUp className="w-5 h-5" /> Upload Voice Sample
                </button>
                <button 
                  onClick={() => setInputType('record')}
                  className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${inputType === 'record' ? 'neu-convex text-cyan-300 border border-cyan-500/30' : 'neu-flat text-gray-500'}`}
                >
                  <Mic2 className="w-5 h-5" /> Record Live Voice
                </button>
              </div>

              {!audioSample ? (
                inputType === 'upload' ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-500/30 rounded-2xl cursor-pointer bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-cyan-400 mb-3" />
                      <p className="text-sm text-gray-300"><span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-2">Supported formats: MP3, WAV, M4A</p>
                    </div>
                    <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                  </label>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-48 rounded-2xl neu-pressed border border-white/5">
                    {!isRecording ? (
                      <button onClick={startRecording} className="flex flex-col items-center gap-3 group">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                          <Mic className="w-8 h-8 text-red-500" />
                        </div>
                        <span className="text-gray-300 font-medium">Click to Start Recording</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-3xl font-mono text-red-400 animate-pulse">{formatTime(recordingTime)}</div>
                        <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/50">
                          <StopCircle className="w-5 h-5" /> Stop Recording
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl neu-pressed border border-cyan-500/20 gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                    <button 
                      onClick={() => togglePlay('preview')}
                      className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl text-cyan-400 transition-colors shrink-0"
                    >
                      {playingAudio === 'preview' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-200 truncate">{getAudioName()}</span>
                      <span className="text-xs text-cyan-500/70">Audio Preview Ready</span>
                    </div>
                  </div>
                  <button 
                    onClick={clearAudio} 
                    className="p-2 hover:bg-red-500/20 rounded-full text-red-400 transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* --- Voice Modes --- */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                <Settings className="w-5 h-5 text-cyan-400" /> Voice Modes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-4 rounded-2xl flex flex-col items-start gap-2 text-left transition-all duration-300 ${
                      selectedMode === mode.id 
                        ? 'neu-convex border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                        : 'neu-flat hover:bg-white/5'
                    }`}
                  >
                    <span className={`font-semibold ${selectedMode === mode.id ? 'text-cyan-300' : 'text-gray-300'}`}>{mode.name}</span>
                    <span className="text-xs text-gray-500 leading-relaxed">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* --- Voice Controls --- */}
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                  <Sliders className="w-5 h-5 text-cyan-400" /> Voice Controls
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 p-6 rounded-2xl neu-pressed">
                  <Slider label="Voice Speed" value={controls.speed} field="speed" />
                  <Slider label="Pitch" value={controls.pitch} field="pitch" />
                  <Slider label="Bass" value={controls.bass} field="bass" />
                  <Slider label="Clarity" value={controls.clarity} field="clarity" />
                  <Slider label="Echo" value={controls.echo} field="echo" />
                  <Slider label="Warmth" value={controls.warmth} field="warmth" />
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {/* --- Emotion Controls --- */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                    <Activity className="w-5 h-5 text-cyan-400" /> Emotion Controls
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {EMOTIONS.map(emotion => (
                      <button
                        key={emotion}
                        onClick={() => setSelectedEmotion(emotion)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedEmotion === emotion
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'neu-flat text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* --- Noise Control --- */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                    <Volume2 className="w-5 h-5 text-cyan-400" /> Noise Control
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <Toggle label="Noise Removal" active={noiseControls.noiseRemoval} field="noiseRemoval" />
                    <Toggle label="Echo Reduction" active={noiseControls.echoReduction} field="echoReduction" />
                    <Toggle label="Background Cleanup" active={noiseControls.backgroundCleanup} field="backgroundCleanup" />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Action Button --- */}
            <button
              onClick={handleCloneVoice}
              disabled={!audioSample || isProcessing}
              className={`w-full py-5 rounded-2xl font-bold text-lg tracking-wide transition-all duration-500 flex items-center justify-center gap-3 mt-4 ${
                isProcessing
                  ? 'neu-pressed text-cyan-400 border border-cyan-500/30' 
                  : 'neu-convex text-cyan-300 hover:text-cyan-100 hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] border border-cyan-500/20 disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing Voice & Applying Effects...
                </>
              ) : (
                <>
                  <Activity className="w-6 h-6" /> Clone Voice
                </>
              )}
            </button>

            {/* --- Output Section --- */}
            {outputReady && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-6 pt-8 border-t border-white/10"
              >
                <h3 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                  <Headphones className="w-6 h-6" /> Output Ready
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before */}
                  <div className="p-6 rounded-2xl neu-pressed flex flex-col gap-5">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Original Audio (Before)</span>
                    <button 
                      onClick={() => togglePlay('before')}
                      className="flex items-center justify-center gap-3 py-4 rounded-xl neu-flat hover:text-cyan-300 transition-colors font-medium"
                    >
                      {playingAudio === 'before' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {playingAudio === 'before' ? 'Pause Original' : 'Play Original'}
                    </button>
                  </div>
                  
                  {/* After */}
                  <div className="p-6 rounded-2xl neu-convex border border-cyan-500/30 flex flex-col gap-5 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                    <span className="text-sm font-medium text-cyan-300 uppercase tracking-wider">Cloned Audio (After)</span>
                    <button 
                      onClick={() => togglePlay('after')}
                      className="flex items-center justify-center gap-3 py-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors border border-cyan-500/30 font-medium"
                    >
                      {playingAudio === 'after' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {playingAudio === 'after' ? 'Pause Cloned Voice' : 'Play Cloned Voice'}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <button 
                    onClick={handleCompare}
                    disabled={playingAudio !== null}
                    className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 neu-flat hover:text-cyan-300 disabled:opacity-50 transition-colors"
                  >
                    <Activity className="w-5 h-5" /> Compare (A/B Test)
                  </button>
                  <a 
                    href={audioUrl!}
                    download="voxora-cloned-voice.wav"
                    className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 neu-convex text-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-cyan-500/30 transition-all"
                  >
                    <Download className="w-5 h-5" /> Download Cloned Voice
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

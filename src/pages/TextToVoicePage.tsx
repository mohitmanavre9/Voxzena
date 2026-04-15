import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Square, Volume2, Loader2, ArrowLeft, Download, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import { GoogleGenAI, Modality } from '@google/genai';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function createWavBlob(pcmData: Int16Array, sampleRate: number) {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    view.setInt16(offset, pcmData[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function TextToVoicePage() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('English');
  const [voice, setVoice] = useState('Kore');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const languages = ['Hindi', 'English', 'Hinglish'];
  const voices = [
    { id: 'Charon', name: 'Male 1' },
    { id: 'Puck', name: 'Male 2' },
    { id: 'Fenrir', name: 'Male 3' },
    { id: 'Kore', name: 'Female 1' },
    { id: 'Zephyr', name: 'Female 2' },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    handleStop(); // Stop any currently playing audio
    setIsGenerating(true);
    setAudioUrl(null);
    
    try {
      const prompt = `Read the following text naturally in ${language}. Text: ${text}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio) {
        setIsGenerating(false);
        setIsPlaying(true);
        
        // Decode base64
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Setup AudioContext for 24kHz PCM
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass({ sampleRate: 24000 });
        audioContextRef.current = audioContext;
        
        // Convert to Float32Array
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }
        
        // Create buffer and play
        const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);
        audioBufferRef.current = audioBuffer;
        
        const wavBlob = createWavBlob(int16Array, 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          setIsPlaying(false);
        };
        
        sourceNodeRef.current = source;
        source.start();
      } else {
        throw new Error("No audio data received");
      }
    } catch (error) {
      console.error("Error generating voice:", error);
      setIsGenerating(false);
      setIsPlaying(false);
      alert("Failed to generate voice. Please try again.");
    }
  };

  const handleReplay = () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    handleStop();
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsPlaying(false);
    };
    
    sourceNodeRef.current = source;
    setIsPlaying(true);
    source.start();
  };

  const handleStop = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }
    setIsPlaying(false);
    setIsGenerating(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleStop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0e15] text-white font-sans selection:bg-pink-500/30 overflow-x-hidden relative">
      <Background />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center pt-4 px-6 pb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl p-8 md:p-12 rounded-[32px] glass-neu flex flex-col gap-8 relative"
          >
            {/* Back Button */}
            <Link 
              to="/" 
              className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors duration-300 group z-20"
            >
              <div className="p-2 rounded-full neu-flat group-hover:neu-pressed transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium hidden sm:block">Back</span>
            </Link>

            <div className="text-center mt-8 md:mt-0">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 text-glow-pink mb-3">
                Convert Voice
              </h1>
              <p className="text-gray-400 font-light">Transform your text into lifelike AI speech</p>
            </div>

            {/* Input Area */}
            <div className="flex flex-col gap-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write any text here to generate voice..."
                className="w-full h-48 bg-transparent neu-pressed rounded-2xl p-6 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-500/50 resize-none text-lg font-light"
                disabled={isGenerating || isPlaying}
              />
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-gray-400 ml-2">Select Language</label>
              <div className="grid grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    disabled={isGenerating || isPlaying}
                    className={`py-3 rounded-xl font-medium transition-all duration-300 ${
                      language === lang
                        ? 'neu-convex border border-pink-500/50 text-pink-300 shadow-[0_0_15px_rgba(255,0,127,0.3)]'
                        : 'neu-flat text-gray-500 hover:text-gray-300 disabled:opacity-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-gray-400 ml-2">Select Voice</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    disabled={isGenerating || isPlaying}
                    className={`py-3 px-2 rounded-xl font-medium text-sm transition-all duration-300 flex flex-col items-center gap-1 ${
                      voice === v.id
                        ? 'neu-convex border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'neu-flat text-gray-500 hover:text-gray-300 disabled:opacity-50'
                    }`}
                  >
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={isPlaying || isGenerating ? handleStop : handleGenerate}
              disabled={!text.trim() && !isPlaying && !isGenerating}
              className={`w-full py-5 rounded-2xl font-bold text-lg tracking-wide transition-all duration-500 flex items-center justify-center gap-3 ${
                isPlaying || isGenerating
                  ? 'neu-pressed text-red-400 border border-red-500/30' 
                  : 'neu-convex text-pink-300 hover:text-pink-100 hover:shadow-[0_0_25px_rgba(255,0,127,0.4)] border border-pink-500/20 disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Generating AI Voice...
                </>
              ) : isPlaying ? (
                <>
                  <Square className="w-5 h-5 fill-current" /> Stop Playing
                </>
              ) : (
                <>
                  <Volume2 className="w-6 h-6" /> Generate Voice
                </>
              )}
            </button>

            {/* Output Section / Player */}
            {(isPlaying || audioUrl) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col items-center justify-center gap-6 pt-6 border-t border-white/5 w-full"
              >
                <div className="text-pink-400 text-sm font-medium flex items-center gap-4">
                  <span className={isPlaying ? "animate-pulse" : ""}>
                    {isPlaying ? "Playing Output..." : "Audio Ready"}
                  </span>
                  {isPlaying && (
                    <div className="flex gap-1.5 h-6 items-center">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                          className="w-1.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full shadow-[0_0_8px_rgba(255,0,127,0.6)]"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {audioUrl && (
                  <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
                    {!isPlaying && (
                      <button
                        onClick={handleReplay}
                        className="flex-1 py-4 rounded-2xl font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 neu-convex text-pink-300 hover:text-pink-100 hover:shadow-[0_0_25px_rgba(255,0,127,0.4)] border border-pink-500/20"
                      >
                        <RotateCcw className="w-5 h-5" /> Replay
                      </button>
                    )}
                    <a
                      href={audioUrl}
                      download="voxora-ai-voice.wav"
                      className="flex-1 py-4 rounded-2xl font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 neu-convex text-cyan-300 hover:text-cyan-100 hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] border border-cyan-500/20"
                    >
                      <Download className="w-5 h-5" /> Download Voice
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

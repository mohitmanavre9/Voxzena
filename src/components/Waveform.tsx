import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Waveform() {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 50 }, () => 0.2));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 0.8 + 0.2));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-center gap-1.5 h-40 w-full max-w-3xl px-8"
      >
        {/* Glowing background blob behind waveform */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-[80px] rounded-full"></div>
        
        {bars.map((height, i) => {
          // Calculate distance from center (0 to 1)
          const centerDist = Math.abs(i - 25) / 25;
          // Make center bars taller and edge bars shorter
          const adjustedHeight = height * (1 - centerDist * 0.8);
          
          return (
            <motion.div
              key={i}
              animate={{ height: `${Math.max(10, adjustedHeight * 100)}%` }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
              className="w-2 md:w-3 rounded-full bg-gradient-to-t from-cyan-400 via-purple-400 to-pink-500 shadow-[0_0_15px_rgba(0,240,255,0.6)]"
              style={{
                opacity: 1 - centerDist * 0.8,
              }}
            />
          );
        })}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 text-center z-10 px-4"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-gray-400 mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-tight">
          The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 text-glow-cyan">Voice AI</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Experience studio-quality voice synthesis and cloning with our next-generation neural audio engine.
        </p>
      </motion.div>
    </div>
  );
}

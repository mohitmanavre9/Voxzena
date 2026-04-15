import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: "VOICE CLONE",
    description: "Enhance human voice into a studio-quality, professional-grade AI voice. The system improves clarity, removes noise, and creates realistic voice cloning output with premium sound quality.",
    color: "cyan",
    link: "/voice-clone"
  },
  {
    title: "TEXT TO VOICE",
    description: "Convert text into natural AI speech in Hindi, English, and Hinglish with smooth pronunciation and lifelike voice output.",
    color: "pink",
    link: "/text-to-voice"
  }
];

export default function FeatureCards() {
  return (
    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6 pb-32 w-full">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -10, scale: 1.02 }}
          className="relative group p-10 rounded-[32px] glass-neu overflow-hidden flex flex-col"
        >
          {/* Hover Glow Effect */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${card.color === 'cyan' ? 'from-cyan-500/10 via-transparent to-transparent' : 'from-pink-500/10 via-transparent to-transparent'}`}></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className={`w-16 h-1 mb-8 rounded-full ${card.color === 'cyan' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 'bg-pink-400 shadow-[0_0_10px_rgba(255,0,127,0.8)]'}`}></div>
            
            <h3 className={`text-3xl font-bold mb-6 tracking-wide ${card.color === 'cyan' ? 'text-cyan-400 text-glow-cyan' : 'text-pink-400 text-glow-pink'}`}>
              {card.title}
            </h3>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-10 flex-grow font-light">
              {card.description}
            </p>
            
            <Link to={card.link} className="self-start mt-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-2xl font-semibold tracking-wide transition-all duration-300 neu-convex ${card.color === 'cyan' ? 'text-cyan-300 hover:text-cyan-100 hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] border border-cyan-500/20' : 'text-pink-300 hover:text-pink-100 hover:shadow-[0_0_25px_rgba(255,0,127,0.4)] border border-pink-500/20'}`}
              >
                Read More
              </motion.button>
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

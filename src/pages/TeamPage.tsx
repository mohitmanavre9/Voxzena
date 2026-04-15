import { motion } from 'motion/react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#0d0e15] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      <Background />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center pt-10 px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center w-full max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 text-glow-cyan mb-6">
              Our Team
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-16">
              Meet the brilliant minds behind VOXORA AI. We are a team of engineers, designers, and AI researchers dedicated to revolutionizing voice technology.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((member, index) => (
                <motion.div
                  key={member}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.2, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-[32px] glass-neu flex flex-col items-center"
                >
                  <div className="w-24 h-24 rounded-full neu-pressed p-1 mb-6 border border-cyan-500/30">
                    <img 
                      src={`https://picsum.photos/seed/team${member}/150/150`} 
                      alt="Team Member" 
                      className="w-full h-full object-cover rounded-full opacity-90"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Team Member {member}</h3>
                  <p className="text-cyan-400 text-sm font-medium mb-4">AI Engineer</p>
                  <p className="text-gray-400 text-sm font-light text-center">
                    Passionate about neural networks and voice synthesis.
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

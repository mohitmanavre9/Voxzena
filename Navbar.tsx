import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreVertical, Settings, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Our Team', path: '/team' },
    { name: 'Development', path: '#' },
    { name: 'Contact Us', path: '#' }
  ];

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <Link to="/">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center cursor-pointer"
          >
            <img 
              src="https://image2url.com/r2/bucket2/images/1775987047151-f5ab0103-a0bf-4ba7-b22b-a5bf37ae8434.png" 
              alt="VOXORA AI Logo" 
              className="h-14 md:h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.path}
                className="px-5 py-2.5 text-sm font-medium text-gray-300 rounded-xl neu-flat hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-500 ease-out block"
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Profile Menu */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isMenuOpen ? 'neu-pressed text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'neu-convex text-gray-400 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(255,0,127,0.3)]'}`}
        >
          <MoreVertical size={20} />
        </motion.button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, transformOrigin: 'top right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 mt-4 w-72 p-5 rounded-[24px] glass-neu z-50 flex flex-col gap-4"
            >
              <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                <div className="w-14 h-14 rounded-full neu-pressed flex items-center justify-center overflow-hidden border border-pink-500/30 p-1">
                  <img src="https://picsum.photos/seed/avatar/100/100" alt="User" className="w-full h-full object-cover rounded-full opacity-90" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Alex Nova</h4>
                  <p className="text-sm text-cyan-400 font-light">alex@voxora.ai</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white neu-flat hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:border-cyan-500/30 border border-transparent transition-all">
                  <User size={18} className="text-pink-400" /> Profile
                </button>
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white neu-flat hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:border-cyan-500/30 border border-transparent transition-all">
                  <Settings size={18} className="text-cyan-400" /> Settings
                </button>
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 neu-flat hover:shadow-[0_0_15px_rgba(248,113,113,0.2)] hover:border-red-500/30 border border-transparent transition-all mt-2">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

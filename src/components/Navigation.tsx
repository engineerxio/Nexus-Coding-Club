import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Home, 
  Info, 
  Calendar, 
  Trophy, 
  GraduationCap, 
  Image as ImageIcon, 
  Mail, 
  Users,
  ChevronRight,
  Sun,
  Moon,
  MoreVertical
} from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onOpenDrawer: () => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onDashboardClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, onOpenDrawer, onLoginClick, isLoggedIn, onDashboardClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-3 glass border-b border-white/10' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-nexus-indigo rounded-lg flex items-center justify-center text-white font-bold font-mono group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">NXS</div>
          <span className="font-mono font-bold text-white tracking-tighter hidden sm:block">Nexus Coding Club</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {isLoggedIn ? (
            <button 
              onClick={onDashboardClick}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-nexus-indigo to-nexus-violet text-white font-medium text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
            >
              Dashboard
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full border border-nexus-indigo text-white font-medium text-sm hover:bg-nexus-indigo/10 transition-all"
            >
              Login
            </button>
          )}

          <button 
            onClick={onOpenDrawer}
            className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn: boolean;
  onDashboardClick: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, onLoginClick, onRegisterClick, isLoggedIn, onDashboardClick }) => {
  const navLinks = [
    { name: 'About Us', icon: Info, href: '#about' },
    { name: 'Events', icon: Calendar, href: '#events' },
    { name: 'Contests', icon: Trophy, href: '#contests' },
    { name: 'Training', icon: GraduationCap, href: '#training' },
    { name: 'Gallery', icon: ImageIcon, href: '#gallery' },
    { name: 'Contact', icon: Mail, href: '#contact' },
  ];

  const teamLinks = [
    { name: 'Advisors & Mentors', icon: GraduationCap, href: '#team' },
    { name: 'Executive Members', icon: Users, href: '#team' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-sm z-[70] bg-[#050a0f] border-r border-white/10 p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-nexus-indigo rounded-lg flex items-center justify-center text-white font-bold font-mono">NXS</div>
                <span className="font-mono font-bold text-white tracking-tighter">Nexus Club</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/60">
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-6 flex-1 overflow-y-auto pr-4">
              <div className="space-y-2">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-4">Main Navigation</p>
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <link.icon size={20} className="group-hover:text-nexus-indigo transition-colors" />
                    <span className="font-medium">{link.name}</span>
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-4">Members Group</p>
                {teamLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <link.icon size={20} className="group-hover:text-nexus-cyan transition-colors" />
                    <span className="font-medium">{link.name}</span>
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                ))}
              </div>
            </nav>

            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
              {isLoggedIn ? (
                <button 
                  onClick={() => { onDashboardClick(); onClose(); }}
                  className="col-span-2 py-3 rounded-xl bg-gradient-to-r from-nexus-indigo to-nexus-violet text-white font-bold text-sm"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { onLoginClick(); onClose(); }}
                    className="py-3 rounded-xl border border-nexus-indigo text-white font-bold text-sm hover:bg-nexus-indigo/10 transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { onRegisterClick(); onClose(); }}
                    className="py-3 rounded-xl bg-gradient-to-r from-nexus-indigo to-nexus-violet text-white font-bold text-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

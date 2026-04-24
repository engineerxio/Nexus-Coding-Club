import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';

interface Ambassador {
  name: string;
  nexusId: string;
  institute: string;
  bio: string;
  image: string;
  email?: string;
}

interface AmbassadorsPageProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const allAmbassadors: Ambassador[] = [
  {
    name: "Ishrat Jahan Rupsha",
    nexusId: "NXS-A4R2",
    institute: "BGC Trust University",
    bio: "Passionate about tech and community building. Representing Nexus at BGC Trust University.",
    email: "rupsha619@gmail.com",
    image: "https://lh3.googleusercontent.com/d/1KyB6HFh-jpI_S0oEeFME2H0veXjUriIi"
  },
  {
    name: "MD. Mahadi Hasan Fahim",
    nexusId: "NXS-K9L5",
    institute: "International Islamic University Chittagong",
    bio: "Competitive programmer and tech enthusiast. Leading the Nexus wave at IIUC.",
    email: "immahadihasanfahim@gmail.com",
    image: "https://lh3.googleusercontent.com/d/1p6ExAOFusUuyKRgMnOl1fpivqjbwh0nD"
  },
  {
    name: "Aksa Arshad",
    nexusId: "NXS-M2P7",
    institute: "Al hidaayah International school",
    bio: "Community lead and tech enthusiast. Bringing creative minds together at Al hidaayah International school.",
    email: "aksaarshad45@gmail.com",
    image: "https://lh3.googleusercontent.com/d/1eNeRP7fvEwD2gmCBVOlo7pTWA7aZgO52"
  }
];

export const AmbassadorsPage: React.FC<AmbassadorsPageProps> = ({ isOpen, onClose, isDark }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed inset-0 z-[150] overflow-y-auto ${isDark ? 'bg-nexus-navy' : 'bg-[#f0f6ff]'}`}
        >
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-nexus-indigo/5 blur-[120px] rounded-full -z-10" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-nexus-cyan/5 blur-[120px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-16">
              <button 
                onClick={onClose}
                className={`flex items-center gap-2 transition-colors group ${isDark ? 'text-white/60 hover:text-white' : 'text-nexus-navy/60 hover:text-nexus-navy'}`}
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
              </button>
              <h2 className={`text-2xl font-bold font-mono tracking-tighter ${isDark ? 'text-white' : 'text-nexus-navy'}`}>Campus Ambassadors</h2>
              <button 
                onClick={onClose}
                className={`p-2 rounded-full glass transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-nexus-navy/10 text-nexus-navy/60'}`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-20">
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-nexus-navy'}`}>Our Global <span className="text-nexus-indigo">Ambassadors</span></h1>
              <p className={`max-w-2xl mx-auto text-lg ${isDark ? 'text-white/60' : 'text-nexus-navy/60'}`}>
                Meet the exceptional students leading the Nexus Coding Club community across various campuses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {allAmbassadors.map((ambassador, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-[3/4] rounded-3xl overflow-hidden glass border-white/5"
                >
                  <img 
                    src={ambassador.image} 
                    alt={ambassador.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nexus-navy via-nexus-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-left">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xl font-bold text-white group-hover:text-nexus-indigo transition-colors">{ambassador.name}</h4>
                        <span className="text-[9px] text-nexus-indigo font-mono bg-nexus-indigo/20 px-1.5 py-0.5 rounded border border-nexus-indigo/30">
                          {ambassador.nexusId}
                        </span>
                      </div>
                      <p className="text-nexus-cyan font-mono text-[10px] mb-3 uppercase tracking-wider font-bold">{ambassador.institute}</p>
                      <p className="text-white/70 text-xs leading-relaxed mb-3">{ambassador.bio}</p>
                      {ambassador.email && (
                        <p className="text-nexus-indigo text-[10px] font-mono">{ambassador.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity">
                    <p className="text-white font-bold text-center text-sm">{ambassador.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

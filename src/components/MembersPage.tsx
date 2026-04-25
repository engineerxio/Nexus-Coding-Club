import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Users, ExternalLink } from 'lucide-react';
import { User } from '../types';
import { getStableNexusId } from '../lib/idGenerator';

interface MembersPageProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  isDark: boolean;
}

export const MembersPage: React.FC<MembersPageProps> = ({ isOpen, onClose, members, isDark }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredMembers = members.filter(member => 
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.institute.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.nexusId && member.nexusId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    getStableNexusId(member.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      >
        <div 
          className="absolute inset-0 bg-nexus-navy/80 backdrop-blur-xl"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-6xl h-[85vh] overflow-hidden rounded-3xl border border-white/10 flex flex-col ${isDark ? 'bg-nexus-navy' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className={`text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-nexus-navy'}`}>
                <Users className="text-nexus-indigo" size={32} />
                Registered Members
              </h2>
              <p className={`text-sm mt-2 font-mono ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`}>
                TOTAL COMMUNITY: {members.length} MEMBERS
              </p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-indigo" size={18} />
              <input
                type="text"
                placeholder="Search by name, ID or institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-3 pl-12 pr-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-nexus-indigo transition-all ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' 
                    : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy placeholder:text-nexus-navy/20'
                }`}
              />
            </div>

            <button 
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-nexus-navy'}`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Members Grid */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={member.id}
                    className={`p-6 rounded-2xl border flex items-center gap-4 relative group hover:-translate-y-1 transition-all ${
                      isDark 
                        ? 'glass border-white/5 bg-white/5' 
                        : 'bg-white shadow-sm border-nexus-navy/5'
                    }`}
                  >
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-0.5">
                      <span className="text-[7px] font-black text-nexus-indigo uppercase tracking-wider">MEMBER ID</span>
                      <span className="text-[10px] font-bold text-nexus-indigo font-mono bg-nexus-indigo/10 px-2 py-0.5 rounded-full border border-nexus-indigo/20">
                        {member.nexusId || getStableNexusId(member.id)}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-nexus-indigo/10 flex items-center justify-center text-nexus-indigo font-bold shrink-0 text-xl">
                      {member.fullName.charAt(0)}
                    </div>
                    
                    <div className="pr-12 min-w-0">
                      <div className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-nexus-navy'}`}>
                        {member.fullName}
                      </div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`}>
                        {member.institute}
                      </div>
                      <div className="text-[10px] text-nexus-cyan mt-1 truncate font-mono">
                        {member.email}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Search size={48} className="mb-4" />
                <p className="text-xl">No members found matching your search.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

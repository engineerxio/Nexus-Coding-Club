import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  FileBadge, 
  User as UserIcon, 
  LogOut, 
  ArrowLeft,
  ChevronRight,
  Award,
  ExternalLink,
  Download,
  X,
  Lock
} from 'lucide-react';
import { User, ContestRanking, Certificate } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onClose }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const rankings: ContestRanking[] = user.rankings || [];
  const certificates: Certificate[] = user.certificates || [];
  const activities: string[] = user.activities || [];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Welcome back, {user.fullName.split(' ')[0]}!</h2>
                <p className="text-white/60">Here's what's happening in the club today.</p>
              </div>
              <div className="px-4 py-2 glass rounded-xl border-nexus-indigo/30">
                <span className="text-nexus-cyan font-mono text-sm">ID: {user.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Activities', value: activities.length > 0 ? activities.length.toString() : '(N/A)', icon: Calendar, color: 'text-nexus-indigo' },
                { label: 'Rankings', value: rankings.length > 0 ? `#${Math.min(...rankings.map(r => r.rank))}` : '(N/A)', icon: Trophy, color: 'text-nexus-cyan' },
                { label: 'Certificates', value: certificates.length > 0 ? certificates.length.toString() : '(N/A)', icon: FileBadge, color: 'text-nexus-violet' },
                { label: 'Member Since', value: user.joinDate.split('/')[2] || '2026', icon: UserIcon, color: 'text-white' },
              ].map((stat, i) => (
                <div key={i} className="glass p-6 rounded-2xl border-white/5 hover:border-nexus-indigo/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass rounded-2xl p-6 border-white/5">
                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-nexus-indigo" />
                        <span className="text-white/80 text-sm">{activity}</span>
                        <span className="ml-auto text-xs text-white/20">Recent</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-white/20">
                      <Calendar size={48} className="mb-4 opacity-20" />
                      <p className="italic">(N/A) - No recent activities</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="glass rounded-2xl p-6 border-white/5 flex flex-col justify-center items-center text-center">
                <div className="text-nexus-indigo mb-4">
                  <Award size={48} />
                </div>
                <p className="text-white/80 italic mb-4">
                  "The best code is not written by those who know the most — it's written by those who never stop learning."
                </p>
                <span className="text-xs text-white/40">— Nexus Coding Club</span>
              </div>
            </div>
          </div>
        );
      case 'Activities':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass rounded-2xl p-6 border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-nexus-indigo" size={20} />
                Events Registered
              </h3>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="text-white font-medium">{event}</div>
                        <div className="text-xs text-white/40">TBD</div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-nexus-indigo/20 text-nexus-indigo border border-nexus-indigo/30">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-white/20 italic">(N/A) - No events registered</p>
                )}
              </div>
            </div>
            <div className="glass rounded-2xl p-6 border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="text-nexus-cyan" size={20} />
                Contests Joined
              </h3>
              <div className="space-y-4">
                {rankings.length > 0 ? (
                  rankings.map((contest, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="text-white font-medium">{contest.contestName}</div>
                        <div className="text-xs text-white/40">{contest.date}</div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        {contest.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-white/20 italic">(N/A) - No contests joined</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'Rankings':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-6 rounded-2xl border-white/5 text-center">
                <div className="text-sm text-white/40 mb-1">Best Rank</div>
                <div className="text-3xl font-bold text-nexus-cyan">
                  {rankings.length > 0 ? `#${Math.min(...rankings.map(r => r.rank))}` : '(N/A)'}
                </div>
              </div>
              <div className="glass p-6 rounded-2xl border-white/5 text-center">
                <div className="text-sm text-white/40 mb-1">Total Score</div>
                <div className="text-3xl font-bold text-nexus-indigo">
                  {rankings.length > 0 ? rankings.reduce((acc, r) => acc + r.score, 0).toLocaleString() : '(N/A)'}
                </div>
              </div>
              <div className="glass p-6 rounded-2xl border-white/5 text-center">
                <div className="text-sm text-white/40 mb-1">Contests</div>
                <div className="text-3xl font-bold text-nexus-violet">
                  {rankings.length > 0 ? rankings.length : '(N/A)'}
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl overflow-hidden border-white/5">
              {rankings.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Contest</th>
                      <th className="px-6 py-4 font-medium">Rank</th>
                      <th className="px-6 py-4 font-medium">Score</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rankings.map((r) => (
                      <tr key={r.id} className="text-white/80 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{r.contestName}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {r.rank <= 3 && <Trophy size={14} className={r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : 'text-amber-600'} />}
                            <span className="text-sm">#{r.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono">{r.score}</td>
                        <td className="px-6 py-4 text-sm text-white/40">{r.date}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20 text-white/20 italic">
                  (N/A) - No contest rankings available
                </div>
              )}
            </div>
          </div>
        );
      case 'Certificates':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <div 
                  key={cert.id} 
                  className={`glass rounded-2xl p-6 border-white/5 relative overflow-hidden group ${cert.isLocked ? 'opacity-50 grayscale' : 'cursor-pointer hover:border-nexus-indigo/50'}`}
                  onClick={() => !cert.isLocked && setSelectedCert(cert)}
                >
                  {cert.isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                      <Lock className="text-white/40" size={32} />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-nexus-indigo/10 text-nexus-indigo">
                      <FileBadge size={24} />
                    </div>
                    {!cert.isLocked && <ExternalLink size={16} className="text-white/20 group-hover:text-nexus-indigo transition-colors" />}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{cert.title}</h3>
                  <p className="text-sm text-white/40 mb-4 line-clamp-2">{cert.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs font-medium text-nexus-cyan">{cert.awardTitle}</span>
                    <span className="text-xs text-white/20">{cert.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass rounded-2xl border-white/5 text-white/20 italic">
                (N/A) - No certificates earned yet
              </div>
            )}
          </div>
        );
      case 'Profile':
        return (
          <div className="max-w-2xl mx-auto glass rounded-2xl p-8 border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-nexus-indigo to-nexus-violet flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl">
                {user.fullName.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-white">{user.fullName}</h3>
              <p className="text-nexus-cyan font-mono text-sm">{user.id}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Email Address', value: user.email },
                { label: 'Institute', value: user.institute },
                { label: 'Gender', value: user.gender },
                { label: 'Member Since', value: user.joinDate },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-xs text-white/40 uppercase tracking-wider">{item.label}</div>
                  <div className="text-white font-medium">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 flex justify-center">
              <button className="px-6 py-2 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors text-sm">
                Edit Profile
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[150] bg-nexus-navy overflow-hidden flex flex-col md:flex-row"
    >
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-[#0a0f14] border-r border-white/5 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-nexus-indigo rounded-lg flex items-center justify-center text-white font-bold font-mono">NXS</div>
          <span className="font-mono font-bold text-white tracking-tighter">Nexus Coding Club</span>
        </div>

        <div className="flex items-center gap-4 p-4 glass rounded-2xl border-white/5 mb-8">
          <div className="w-10 h-10 rounded-full bg-nexus-indigo flex items-center justify-center text-white font-bold">
            {user.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-white font-bold truncate">{user.fullName}</div>
            <div className="text-xs text-white/40 truncate">{user.institute}</div>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { name: 'Overview', icon: LayoutDashboard },
            { name: 'Activities', icon: Calendar },
            { name: 'Rankings', icon: Trophy },
            { name: 'Certificates', icon: FileBadge },
            { name: 'Profile', icon: UserIcon },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.name 
                  ? 'bg-nexus-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.name}</span>
              {activeTab === item.name && <motion.div layoutId="activeTab" className="ml-auto"><ChevronRight size={14} /></motion.div>}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 space-y-2">
          <button 
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Site</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-nexus-navy p-6 md:p-12 relative">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-nexus-indigo/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-nexus-cyan/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-[1.414/1] bg-[#0a0f14] rounded-lg border-2 border-nexus-indigo/30 p-12 flex flex-col items-center justify-between shadow-[0_0_50px_rgba(99,102,241,0.2)]"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-nexus-indigo via-transparent to-transparent" />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-nexus-indigo rounded-xl flex items-center justify-center text-white font-bold font-mono text-2xl mb-6">NXS</div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-nexus-indigo via-nexus-cyan to-nexus-violet bg-clip-text text-transparent mb-4">
                  CERTIFICATE OF ACHIEVEMENT
                </h1>
                <p className="text-white/40 font-mono tracking-widest text-sm uppercase">Nexus Coding Club Official Recognition</p>
              </div>

              <div className="text-center space-y-6">
                <p className="text-white/60 text-lg">This is to certify that</p>
                <h2 className="text-4xl md:text-6xl font-bold text-white font-sans">{user.fullName}</h2>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-nexus-indigo to-transparent mx-auto" />
                <p className="text-white/80 max-w-2xl mx-auto text-lg">
                  has successfully demonstrated exceptional skill and dedication in the field of programming and technology, specifically recognized for:
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-nexus-cyan">{selectedCert.awardTitle}</h3>
                <p className="text-white/40 text-sm italic">{selectedCert.description}</p>
              </div>

              <div className="w-full flex flex-col md:flex-row justify-between items-end gap-8 mt-12">
                <div className="text-center">
                  <div className="font-mono text-white/80 mb-1 italic">Osrat Nower Tasnia</div>
                  <div className="w-48 h-px bg-white/20 mb-2" />
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Founder & President</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[10px] text-white/40 font-mono mb-2">CERTIFICATE ID: CERT-{selectedCert.id}-{Math.random().toString(36).substring(7).toUpperCase()}</div>
                  <div className="text-xs text-white/20">{selectedCert.date}</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-white/80 mb-1 italic">S M Tanjimul Hoque Tajim</div>
                  <div className="w-48 h-px bg-white/20 mb-2" />
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Co-Founder & VP</div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white/60">
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => setSelectedCert(null)}
                  className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white/60"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

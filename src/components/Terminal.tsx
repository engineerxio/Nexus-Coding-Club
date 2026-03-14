import React, { useState, useEffect } from 'react';

const stats = [
  '> nexus --initialize --core',
  'Initializing Nexus Neural Link...',
  '[OK] Quantum encryption active.',
  '[OK] Neural pathways synchronized.',
  '[OK] Global node connection established.',
  '[OK] Security protocols: ENFORCED',
  '[OK] Environment: PRODUCTION',
  'Welcome to the Nexus Core.',
  'System Status: READY'
];

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < stats.length) {
        setLines(prev => [...prev, stats[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400); // Faster loading for better feel

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-md bg-[#0a0f14]/80 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 shadow-2xl font-mono text-[10px] sm:text-xs">
      <div className="bg-[#1a1f24] px-4 py-2 flex items-center gap-2 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="text-[10px] text-white/40 ml-2 uppercase tracking-widest">Nexus_Core_v2.0</div>
      </div>
      <div className="p-4 space-y-1 min-h-[180px] sm:min-h-[220px]">
        {lines.map((line, idx) => (
          <div key={idx} className={line?.startsWith('>') ? 'text-nexus-cyan' : line?.includes('[OK]') ? 'text-green-400' : 'text-white/80'}>
            {line}
          </div>
        ))}
        {lines.length === stats.length && (
          <div className="text-nexus-indigo animate-pulse">
            █
          </div>
        )}
      </div>
    </div>
  );
};

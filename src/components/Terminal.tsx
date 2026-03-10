import React, { useState, useEffect } from 'react';

const stats = [
  '> python nexcode_club.py',
  'Loading Nexus Coding Club data...',
  '[SUCCESS] Database connected.',
  '[INFO] Active Members: 340+',
  '[INFO] Expert Mentors: 18',
  '[INFO] Events Hosted: 62',
  '[INFO] Contest Wins: 28',
  '[INFO] Projects Launched: 15',
  '[INFO] System Status: OPTIMAL',
  'Nexus_Club_Terminal: Ready_'
];

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < stats.length) {
        setLines(prev => [...prev, stats[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    const cursorInterval = setInterval(() => {
      setCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-md bg-[#0a0f14] rounded-lg overflow-hidden border border-white/10 shadow-2xl font-code text-sm">
      <div className="bg-[#1a1f24] px-4 py-2 flex items-center gap-2 border-bottom border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="text-xs text-white/40 ml-2">nexcode_club.py — 80×24</div>
      </div>
      <div className="p-4 space-y-1 min-h-[240px]">
        {lines.map((line, idx) => (
          <div key={idx} className={line?.startsWith('>') ? 'text-nexus-cyan' : line?.includes('[SUCCESS]') ? 'text-green-400' : 'text-white/80'}>
            {line}
          </div>
        ))}
        <div className="text-nexus-indigo">
          {cursor ? '█' : ''}
        </div>
      </div>
    </div>
  );
};

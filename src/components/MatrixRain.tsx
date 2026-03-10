import React, { useEffect, useRef } from 'react';

export const MatrixRain: React.FC<{ color?: string }> = ({ color = '#6366f1' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const columns = Math.floor(width / 20);
    const drops: number[] = new Array(columns).fill(1);

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 10, 15, 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      const newColumns = Math.floor(width / 20);
      if (newColumns !== drops.length) {
        const newDrops = new Array(newColumns).fill(1);
        // Preserve existing drops if possible
        for (let i = 0; i < Math.min(drops.length, newColumns); i++) {
          newDrops[i] = drops[i];
        }
        drops.length = 0;
        drops.push(...newDrops);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
};

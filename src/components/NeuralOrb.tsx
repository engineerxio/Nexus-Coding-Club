import React, { useEffect, useRef } from 'react';

export const NeuralOrb: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = 500);
    let height = (canvas.height = 500);

    const nodes: { x: number; y: number; z: number; vx: number; vy: number; vz: number; color: string }[] = [];
    const colors = ['#6366f1', '#00d9f5', '#a78bfa'];

    for (let i = 0; i < 28; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        z: (Math.random() - 0.5) * 300,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let angle = 0;

    const project = (x: number, y: number, z: number) => {
      const scale = 400 / (400 + z);
      return {
        x: x * scale + width / 2,
        y: y * scale + height / 2,
        scale,
      };
    };

    const rotate = (node: any, angleX: number, angleY: number) => {
      // Rotate Y
      let x = node.x * Math.cos(angleY) - node.z * Math.sin(angleY);
      let z = node.x * Math.sin(angleY) + node.z * Math.cos(angleY);
      node.x = x;
      node.z = z;

      // Rotate X
      let y = node.y * Math.cos(angleX) - node.z * Math.sin(angleX);
      z = node.y * Math.sin(angleX) + node.z * Math.cos(angleX);
      node.y = y;
      node.z = z;
    };

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.005;

      // Draw Rings
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.strokeStyle = colors[r];
        ctx.lineWidth = 1;
        ctx.ellipse(width / 2, height / 2, 150 + r * 20, 50 + r * 10, angle * (r + 1), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Core
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 40);
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.5, '#6366f1');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 40, 0, Math.PI * 2);
      ctx.fill();

      // Draw Nodes and Connections
      nodes.forEach((node, i) => {
        rotate(node, 0.01, 0.01);
        const p = project(node.x, node.y, node.z);

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
        ctx.fill();

        // Connections
        nodes.forEach((other, j) => {
          if (i === j) return;
          const dist = Math.sqrt(
            Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2) + Math.pow(node.z - other.z, 2)
          );
          if (dist < 100) {
            const p2 = project(other.x, other.y, other.z);
            ctx.beginPath();
            ctx.strokeStyle = node.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.3;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-[10px] font-code text-nexus-cyan/50 space-y-1">
          <div className="animate-pulse">def connect():</div>
          <div className="animate-pulse delay-75">class AI_Human:</div>
          <div className="animate-pulse delay-150">import future</div>
        </div>
      </div>
    </div>
  );
};

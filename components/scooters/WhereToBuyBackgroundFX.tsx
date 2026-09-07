'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  pulse: number;
}

export function WhereToBuyBackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse interactive position & trail
    const mouse = { x: width / 2, y: height / 2, active: false, radius: 220 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Vibrant automotive neon palette
    const colors = ['#E60012', '#FF3B30', '#FF9500', '#FFCC00', '#FFFFFF'];
    const particleCount = Math.min(Math.floor(width / 14), 95);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * 0.04 + 0.01,
      });
    }

    // Render 60fps high-visibility canvas effect
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw glowing lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particles
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce borders
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse magnetic dispersion & glow attraction
        if (mouse.active) {
          const dxMouse = mouse.x - p1.x;
          const dyMouse = mouse.y - p1.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < mouse.radius) {
            const force = (mouse.radius - distMouse) / mouse.radius;
            p1.x -= (dxMouse / distMouse) * force * 3;
            p1.y -= (dyMouse / distMouse) * force * 3;
          }
        }

        // Draw glowing particle dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.shadowColor = p1.color;
        ctx.shadowBlur = 16;
        ctx.globalAlpha = p1.alpha;
        ctx.fill();
        ctx.restore();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const lineAlpha = (1 - dist / 150) * 0.45;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color === '#FFCC00' ? '#FF9500' : '#E60012';
            ctx.shadowColor = '#E60012';
            ctx.shadowBlur = 10;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Draw vibrant Cursor Energy Halo when mouse moves
      if (mouse.active) {
        ctx.save();
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
        gradient.addColorStop(0, 'rgba(230, 0, 18, 0.25)');
        gradient.addColorStop(0.5, 'rgba(255, 149, 0, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* ── 1. Interactive High-Density Particle Engine Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90 z-10"
      />

      {/* ── 2. Vivid SYM Crimson Hero Aurora Spotlight (Top Right) ── */}
      <motion.div
        animate={{
          scale: [1, 1.25, 0.9, 1],
          opacity: [0.35, 0.55, 0.35],
          rotate: [0, 45, -45, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute -top-28 -right-28 w-[750px] h-[750px] bg-radial from-[#E60012]/35 via-red-600/20 to-transparent rounded-full blur-[130px] transform-gpu"
      />

      {/* ── 3. Golden Amber Energy Center Glow (Center Left) ── */}
      <motion.div
        animate={{
          scale: [0.9, 1.3, 0.95, 0.9],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -40, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute top-[35%] -left-32 w-[700px] h-[700px] bg-radial from-amber-500/25 via-red-900/15 to-transparent rounded-full blur-[150px] transform-gpu"
      />

      {/* ── 4. Pulsing Holographic Radar Rings ── */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] pointer-events-none">
        <motion.div
          animate={{ scale: [0.4, 1.9], opacity: [0.9, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 border-2 border-[#E60012]/70 rounded-full shadow-[0_0_30px_#E60012]"
        />
        <motion.div
          animate={{ scale: [0.4, 1.9], opacity: [0.9, 0] }}
          transition={{ duration: 3.5, delay: 1.75, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 border-2 border-amber-500/60 rounded-full shadow-[0_0_25px_#FF9500]"
        />
      </div>

      {/* ── 5. Dynamic Laser Sweep Beam ── */}
      <motion.div
        animate={{
          y: ['-5%', '105%'],
          opacity: [0, 0.95, 0.95, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#E60012] to-transparent shadow-[0_0_25px_#E60012] z-20"
      />

      {/* ── 6. Glowing Neon Geo Grid Lines ── */}
      <motion.div
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(230, 0, 18, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(230, 0, 18, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

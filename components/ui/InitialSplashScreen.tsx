'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function InitialSplashScreen() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress counter animation from 0% to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 45);

    // Fade out timer
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 700);
    }, 1400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center transition-all duration-700 select-none overflow-hidden ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Carbon & Laser Scan Grid */}
      <div className="absolute inset-0 bg-[radial-[#111111]_1px,transparent_1px] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Pulsing Dual Crimson Red Ambient Lasers */}
      <div className="absolute w-[600px] h-[600px] bg-[#E60012]/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute w-[300px] h-[300px] bg-[#E60012]/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Ignition Box */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-8 md:p-12 rounded-3xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-2xl shadow-[0_0_80px_rgba(230,0,18,0.25)]">
        
        {/* Revolving Tachometer Speed Ring around SYM Logo */}
        <div className="relative w-48 md:w-64 h-24 md:h-28 flex items-center justify-center">
          {/* Animated Speed Ring Arc */}
          <div className="absolute -inset-4 rounded-full border-2 border-transparent border-t-[#E60012] border-r-[#E60012]/40 animate-spin" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-8 rounded-full border border-zinc-800/60" />

          {/* SYM Logo with Laser Scanner Line */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <Image
              src="/SymLogo-S-red.png"
              alt="SYM Egypt"
              fill
              priority
              className="object-contain brightness-[2.5] contrast-150 drop-shadow-[0_0_35px_rgba(230,0,18,0.8)]"
            />
            {/* Vertical Laser Light Scanline effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E60012]/30 to-transparent animate-scanline" />
          </div>
        </div>

        {/* Status & Digital Telemetry Progress Bar */}
        <div className="w-56 md:w-72 space-y-3 text-center">
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">
            <span className="text-[#E60012] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E60012] animate-ping" />
              SYSTEM INITIALIZING
            </span>
            <span className="text-white font-mono">{progress}%</span>
          </div>

          {/* High-Tech Progress Bar Track */}
          <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-800 via-[#E60012] to-red-400 rounded-full transition-all duration-75 shadow-[0_0_12px_#E60012]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 3 Crimson Dots underneath */}
          <div className="flex justify-center items-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#E60012] animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 rounded-full bg-[#E60012] animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-2 h-2 rounded-full bg-[#E60012] animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* Supercar Grade Tagline */}
        <div className="text-center pt-1 border-t border-zinc-800/80 w-full">
          <p className="text-[10px] font-extrabold tracking-[0.25em] text-zinc-400 uppercase">
            SYM EGYPT — POWER & PRECISION TELEMETRY
          </p>
        </div>
      </div>
    </div>
  );
}

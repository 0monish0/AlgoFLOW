import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search, Code2, BookOpen } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';
import { SortingRace } from '../components/ui/SortingRace';

const ROTATING_WORDS = ['everyone', 'you', 'me'];

export const Home = () => {
  const { openSearch } = useSearchStore();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative min-h-screen bg-[#0a0a0a] text-text flex flex-col justify-between overflow-x-hidden select-none font-mono z-0"
    >
      <SortingRace />
      {/* Background Center Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Floating Capsule Header (Exact previous original structure) */}
      <header className="w-full max-w-5xl mx-auto pt-4 sm:pt-6 pb-2 px-4 sm:px-6 shrink-0 z-30 font-mono">
        <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 rounded-full bg-[#FFFFFF]/90 dark:bg-[#141414]/90 backdrop-blur-md border border-border dark:border-white/10 shadow-2xl shadow-black/20">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 size={16} />
            </div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-black dark:text-white">
              Algo<span className="text-accent">Flow</span>
            </span>
          </Link>

          {/* Center: Search Button */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <button
              onClick={openSearch}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-white/5 text-text-muted text-xs transition-all group"
            >
              <Search size={14} className="text-accent group-hover:text-primary transition-colors shrink-0" />
              <span className="truncate">Search components, algorithms, topics...</span>
            </button>
          </div>

          {/* Right Action CTA Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Pill CTA Button (Sandbox) */}
            <Link
              to="/sandbox"
              className="px-4 py-2 rounded-full bg-accent text-black font-extrabold text-xs hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 shrink-0"
            >
              Sandbox
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section (Increased top spacing from navbar, auto-sizing word capsule) */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center px-4 sm:px-8 pt-16 sm:pt-24 md:pt-28 pb-16 sm:pb-24 z-20 text-center">
        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-sans font-black uppercase text-white tracking-tight leading-none text-center whitespace-nowrap z-20">
          DATA STRUCTURES <span className="text-accent drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]">&</span> ALGORITHMS
        </h1>

        {/* Sub-headline with High-Contrast Green Text in Snug Dynamic-Width Capsule */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-4 text-xl sm:text-3xl md:text-4xl font-sans font-bold text-gray-300 mt-6 sm:mt-8 tracking-tight leading-none text-center z-20">
          <span className="leading-none flex items-center shrink-0">Built for</span>
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative inline-flex items-center justify-center h-11 sm:h-14 overflow-hidden px-5 sm:px-6 bg-white rounded-full border-0 align-middle shrink-0"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={ROTATING_WORDS[wordIndex]}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="text-accent font-black tracking-tight block leading-none whitespace-nowrap select-none text-xl sm:text-3xl px-0.5"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CTA Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mt-[60px] sm:mt-[70px] font-mono z-30">
          <Link
            to="/sandbox"
            className="inline-flex items-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-lg bg-accent text-black font-bold text-xs sm:text-sm hover:opacity-95 transition-all"
          >
            <span>Interactive Sandboxes</span>
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </Link>

          <Link
            to="/docs/is-there-even-a-need"
            className="inline-flex items-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-lg bg-transparent hover:bg-white/5 text-gray-300 border border-white/10 text-xs sm:text-sm font-semibold transition-all"
          >
            <BookOpen size={16} className="text-accent" />
            <span>Read Documentation</span>
          </Link>
        </div>
      </main>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { ArrowUpRight, Sun, Moon, Search, Code2, BookOpen } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';

const ROTATING_WORDS = ['everyone', 'you', 'me'];

export const Home = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { openSearch } = useSearchStore();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative min-h-screen max-h-screen h-screen bg-base text-text flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(var(--color-border) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Floating Capsule Header */}
      <header className="w-full max-w-5xl mx-auto pt-4 sm:pt-6 pb-2 px-4 sm:px-6 shrink-0 z-30 font-mono">
        <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 rounded-full bg-[#FFFFFF]/90 dark:bg-[#141414]/90 backdrop-blur-md border border-border dark:border-white/10 shadow-2xl shadow-black/20">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 size={16} />
            </div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-primary">
              Agro<span className="text-accent">Flow</span>
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

          {/* Right Action Icons & CTA Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 text-text transition-colors flex items-center justify-center"
              title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon size={15} className="text-accent" /> : <Sun size={15} className="text-amber-accent" />}
            </button>

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

      {/* Main Hero Section - Centered and Clean */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center px-4 sm:px-8 py-2 z-20 text-center">
        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-sans font-black uppercase text-primary tracking-tight leading-none text-center whitespace-nowrap">
          DATA STRUCTURES &amp;{' '}
          <span className="text-accent drop-shadow-[0_0_35px_rgba(112,224,0,0.5)]">
            ALGORITHMS
          </span>
        </h1>

        {/* Sub-headline with High-Contrast Green Text in White Capsule */}
        <div className="inline-flex items-center justify-center gap-2 sm:gap-2.5 text-xl sm:text-3xl md:text-4xl font-sans font-bold text-text-muted mt-3 sm:mt-4 tracking-tight leading-none text-center">
          <span className="leading-none flex items-center shrink-0">Built for</span>
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative inline-flex items-center justify-center h-9 sm:h-11 overflow-hidden px-4 bg-white rounded-tl-[22px] rounded-br-[22px] rounded-tr-[8px] rounded-bl-[8px] border-0 shadow-2xl shadow-white/10 align-middle shrink-0"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={ROTATING_WORDS[wordIndex]}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#15803D] font-black tracking-tight block leading-none whitespace-nowrap select-none"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CTA Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6 sm:mt-8 font-mono z-30">
          <Link
            to="/sandbox"
            className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-accent text-black font-extrabold text-xs sm:text-sm hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/25"
          >
            <span>Interactive Sandboxes</span>
            <ArrowUpRight size={16} />
          </Link>

          <Link
            to="/docs/why-a-linked-list"
            className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-surface/80 hover:bg-surface text-text border border-border dark:border-white/10 text-xs sm:text-sm font-semibold hover:border-accent/40 transition-all shadow-sm"
          >
            <BookOpen size={15} className="text-accent" />
            <span>Read Documentation</span>
          </Link>
        </div>
      </main>

      {/* Bottom Showcase Cards - 6 Minimalist Overlapping DSA Cards Lined Across the Viewport */}
      <div className="relative w-full max-w-[105rem] mx-auto pointer-events-none z-10 hidden sm:block">
        <div className="absolute -bottom-14 sm:-bottom-12 lg:-bottom-10 left-0 right-0 flex items-end justify-center pointer-events-auto px-2 lg:px-6">
          
          {/* Card 1: Far Left (-14deg) */}
          <Link
            to="/sandbox/linked-list"
            className="w-64 sm:w-76 lg:w-84 h-52 sm:h-60 lg:h-68 rounded-xl overflow-hidden border border-white/20 dark:border-white/15 bg-[#111111]/95 backdrop-blur-md shadow-2xl transform -rotate-[14deg] hover:rotate-0 hover:-translate-y-12 hover:z-50 transition-all duration-300 group cursor-pointer block select-none shrink-0 -mr-20 lg:-mr-14 z-10"
          >
            <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-white">singly_linked.c</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 whitespace-nowrap">
                O(1)
              </span>
            </div>
            <div className="p-4 flex flex-col justify-between h-[calc(100%-38px)]">
              <div>
                <div className="text-3xs font-mono text-text-muted mb-2">POINTER SEQUENCE</div>
                <div className="flex items-center gap-1.5 font-mono text-xs overflow-hidden">
                  <div className="px-2.5 py-1 rounded bg-[#202020] border border-accent text-accent font-bold">
                    head: 12
                  </div>
                  <span className="text-accent font-bold">→</span>
                  <div className="px-2.5 py-1 rounded bg-[#202020] border border-white/20 text-white">
                    45
                  </div>
                  <span className="text-text-muted">→</span>
                  <div className="px-2.5 py-1 rounded bg-[#202020] border border-white/20 text-white">
                    89
                  </div>
                  <span className="text-text-muted">→</span>
                  <span className="text-text-muted font-bold text-3xs">NULL</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-3xs font-mono pt-2 border-t border-white/10">
                <span className="text-text-muted">addr: 0x7ffee4</span>
                <span className="text-accent font-bold group-hover:translate-x-1 transition-transform">Simulate ↗</span>
              </div>
            </div>
          </Link>

          {/* Card 2: Mid Left (-7deg) */}
          <Link
            to="/sandbox/linked-list"
            className="w-64 sm:w-76 lg:w-84 h-52 sm:h-60 lg:h-68 rounded-xl overflow-hidden border border-white/20 dark:border-white/15 bg-[#0D0D0D]/95 backdrop-blur-md shadow-2xl transform -rotate-[7deg] translate-y-2 hover:rotate-0 hover:-translate-y-12 hover:z-50 transition-all duration-300 group cursor-pointer block select-none shrink-0 -mr-16 lg:-mr-10 z-20"
          >
            <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-white">doubly_linked.cpp</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 whitespace-nowrap">
                prev ⇄ next
              </span>
            </div>
            <div className="p-4 flex flex-col justify-between h-[calc(100%-38px)]">
              <div>
                <div className="text-3xs font-mono text-text-muted mb-2">BIDIRECTIONAL MESH</div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-text-muted text-3xs">NULL</span>
                  <span className="text-accent font-bold">⇄</span>
                  <div className="px-2.5 py-1 rounded bg-[#202020] border border-accent/60 text-accent font-bold">
                    Node[A]
                  </div>
                  <span className="text-accent font-bold">⇄</span>
                  <div className="px-2.5 py-1 rounded bg-[#202020] border border-white/20 text-white">
                    Node[B]
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-3xs font-mono pt-2 border-t border-white/10">
                <span className="text-text-muted">Bi-directional Traversal</span>
                <span className="text-accent font-bold group-hover:translate-x-1 transition-transform">Explore ↗</span>
              </div>
            </div>
          </Link>

          {/* Card 3: Center Left (-1deg, low) */}
          <Link
            to="/sandbox/array"
            className="w-64 sm:w-76 lg:w-84 h-52 sm:h-60 lg:h-68 rounded-xl overflow-hidden border border-white/20 dark:border-white/15 bg-[#141414]/95 backdrop-blur-md shadow-2xl transform -rotate-[1deg] translate-y-6 hover:rotate-0 hover:-translate-y-8 hover:z-50 transition-all duration-300 group cursor-pointer block select-none shrink-0 -mr-12 lg:-mr-6 z-30"
          >
            <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-white">ring_buffer.rs</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 whitespace-nowrap">
                O(1)
              </span>
            </div>
            <div className="p-4 flex flex-col justify-between h-[calc(100%-38px)]">
              <div>
                <div className="text-3xs font-mono text-text-muted mb-2">CONTIGUOUS MEMORY</div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  {['10', '20', '30', '40', '50'].map((val, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 text-center py-1.5 rounded border text-xs ${
                        idx === 1
                          ? 'bg-accent/20 border-accent text-accent font-bold'
                          : 'bg-[#202020] border-white/15 text-white'
                      }`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-3xs font-mono pt-2 border-t border-white/10">
                <span className="text-text-muted">Cache-line Optimized</span>
                <span className="text-accent font-bold group-hover:translate-x-1 transition-transform">Inspect ↗</span>
              </div>
            </div>
          </Link>

          {/* Card 4: Center Right (+1deg, low) */}
          <Link
            to="/sandbox/stack"
            className="w-64 sm:w-76 lg:w-84 h-52 sm:h-60 lg:h-68 rounded-xl overflow-hidden border border-white/20 dark:border-white/15 bg-[#141414]/95 backdrop-blur-md shadow-2xl transform rotate-[1deg] translate-y-6 hover:rotate-0 hover:-translate-y-8 hover:z-50 transition-all duration-300 group cursor-pointer block select-none shrink-0 -ml-12 lg:-ml-6 z-30"
          >
            <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-white">call_stack.py</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 whitespace-nowrap">
                LIFO
              </span>
            </div>
            <div className="p-4 flex flex-col justify-between h-[calc(100%-38px)]">
              <div>
                <div className="text-3xs font-mono text-text-muted mb-2">ACTIVE CALL FRAMES</div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="px-2.5 py-1 rounded bg-accent/20 border border-accent text-accent font-bold text-xs truncate">
                    [3] quick_sort(arr, 0, mid)
                  </div>
                  <div className="px-2.5 py-1 rounded bg-[#202020] border border-white/15 text-white text-xs truncate">
                    [2] partition(arr, 0, len)
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-3xs font-mono pt-2 border-t border-white/10">
                <span className="text-text-muted">Stack Depth: 3</span>
                <span className="text-accent font-bold group-hover:translate-x-1 transition-transform">Debug ↗</span>
              </div>
            </div>
          </Link>

          {/* Card 5: Mid Right (+7deg) */}
          <Link
            to="/sandbox/tree"
            className="w-64 sm:w-76 lg:w-84 h-52 sm:h-60 lg:h-68 rounded-xl overflow-hidden border border-white/20 dark:border-white/15 bg-[#0D0D0D]/95 backdrop-blur-md shadow-2xl transform rotate-[7deg] translate-y-2 hover:rotate-0 hover:-translate-y-12 hover:z-50 transition-all duration-300 group cursor-pointer block select-none shrink-0 -ml-16 lg:-ml-10 z-20"
          >
            <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-white">bst_tree.go</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 whitespace-nowrap">
                O(log n)
              </span>
            </div>
            <div className="p-4 flex flex-col justify-between h-[calc(100%-38px)]">
              <div>
                <div className="text-3xs font-mono text-text-muted mb-1.5">BINARY SEARCH TREE</div>
                <div className="flex flex-col items-center font-mono text-xs py-0.5">
                  <div className="px-3 py-0.5 rounded bg-accent/20 border border-accent text-accent font-bold text-xs">
                    root: 50
                  </div>
                  <div className="flex items-center gap-6 mt-1.5">
                    <div className="px-2.5 py-0.5 rounded bg-[#202020] border border-white/20 text-white text-xs">
                      L: 25
                    </div>
                    <div className="px-2.5 py-0.5 rounded bg-[#202020] border border-white/20 text-white text-xs">
                      R: 75
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-3xs font-mono pt-2 border-t border-white/10">
                <span className="text-text-muted">Invariant: L &lt; Root &lt; R</span>
                <span className="text-accent font-bold group-hover:translate-x-1 transition-transform">Explore ↗</span>
              </div>
            </div>
          </Link>

          {/* Card 6: Far Right (+14deg) */}
          <Link
            to="/sandbox/hash-table"
            className="w-64 sm:w-76 lg:w-84 h-52 sm:h-60 lg:h-68 rounded-xl overflow-hidden border border-white/20 dark:border-white/15 bg-[#111111]/95 backdrop-blur-md shadow-2xl transform rotate-[14deg] hover:rotate-0 hover:-translate-y-12 hover:z-50 transition-all duration-300 group cursor-pointer block select-none shrink-0 -ml-20 lg:-mr-14 z-10"
          >
            <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-white">hash_map.js</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 whitespace-nowrap">
                O(1)
              </span>
            </div>
            <div className="p-4 flex flex-col justify-between h-[calc(100%-38px)]">
              <div>
                <div className="text-3xs font-mono text-text-muted mb-1.5">BUCKET CHAINING</div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted w-5 text-3xs">[0]</span>
                    <div className="px-2 py-0.5 rounded bg-[#202020] border border-accent/40 text-accent truncate flex-1 text-3xs">
                      "alpha" → 104
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted w-5 text-3xs">[1]</span>
                    <div className="px-2 py-0.5 rounded bg-[#202020] border border-white/15 text-white truncate flex-1 text-3xs">
                      "beta" → "gamma"
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-3xs font-mono pt-2 border-t border-white/10">
                <span className="text-text-muted">Load Factor: 0.65</span>
                <span className="text-accent font-bold group-hover:translate-x-1 transition-transform">Simulate ↗</span>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

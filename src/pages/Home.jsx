import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { ArrowRight, Sun, Moon, Search, Code2 } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';

export const Home = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { openSearch } = useSearchStore();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const topics = [
    { name: 'Intro to ADTs', path: '/docs/intro-to-adts' },
    { name: 'Array vs List', path: '/docs/comparison-linked-vs-array' },
    { name: 'List Contract', path: '/docs/adt-list-contract' },
    { name: 'Array List', path: '/docs/array-list-impl' },
    { name: 'Singly Linked List', path: '/docs/singly-linked-list-structure' },
    { name: 'Doubly Linked List', path: '/docs/doubly-linked-list-structure' },
  ];

  return (
    <div className="h-screen max-h-screen bg-base text-text font-mono flex flex-col justify-between overflow-hidden selection:bg-accent/30 selection:text-primary transition-colors px-4 sm:px-8">
      {/* Top Header - Expanded with stretched searchbar */}
      <header className="w-full max-w-6xl mx-auto pt-4 sm:pt-5 pb-2 flex items-center justify-between gap-4 sm:gap-8 shrink-0">
        <Link to="/" className="text-base sm:text-lg font-extrabold tracking-tight text-primary shrink-0">
          AgroFlow
        </Link>

        {/* Stretched Hero Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <button
            onClick={openSearch}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/80 bg-base/35 hover:bg-base/60 hover:border-accent/50 text-text-muted text-xs transition-all shadow-2xs group"
          >
            <Search size={14} className="text-accent group-hover:text-primary transition-colors shrink-0 opacity-80 group-hover:opacity-100" />
            <span className="truncate">Search reference or jump to topic...</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border bg-surface hover:bg-accent/15 text-text transition-colors flex items-center justify-center shadow-2xs shrink-0"
          title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon size={16} className="text-accent" /> : <Sun size={16} className="text-amber-accent" />}
        </button>
      </header>

      {/* Hero Section Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-2 sm:py-4">
        {/* Centered Header Stack */}
        <div className="text-center mb-5 sm:mb-6 max-w-3xl">
          <div className="text-3xs sm:text-2xs text-text-muted font-semibold uppercase tracking-widest mb-2">
            Technical Specification &amp; Handbook
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.85rem] font-extrabold tracking-tight text-primary leading-tight mb-2">
            Data Structures &amp; Algorithms
          </h1>
          <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Interactive pointer visualizers, asymptotic complexity proofs, and production-grade implementations.
          </p>
        </div>

        {/* 40% Larger Hero Visual Container with Carved-out Notches & Exact 14px Gap Channels */}
        <div className="relative w-full max-w-5xl my-2">
          {/* Main Visual SVG Frame */}
          <div className="w-full relative">
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-auto block drop-shadow-2xl overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <clipPath id="hero-carved-shape">
                  <path
                    d="M 306,0 
                       L 978,0 
                       Q 1000,0 1000,22 
                       L 1000,304 
                       Q 1000,326 978,326 
                       L 638,326 
                       Q 616,326 616,348 
                       L 616,478 
                       Q 616,500 594,500 
                       L 22,500 
                       Q 0,500 0,478 
                       L 0,216 
                       Q 0,194 22,194 
                       L 262,194 
                       Q 284,194 284,172 
                       L 284,22 
                       Q 284,0 306,0 
                       Z"
                  />
                </clipPath>
              </defs>

              {/* Clipped Hero Image */}
              <image
                href="/dsa-hero.jpg"
                x="0"
                y="0"
                width="1000"
                height="500"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#hero-carved-shape)"
              />

              {/* Exact Carved Silhouette Outer Stroke */}
              <path
                d="M 306,0 
                   L 978,0 
                   Q 1000,0 1000,22 
                   L 1000,304 
                   Q 1000,326 978,326 
                   L 638,326 
                   Q 616,326 616,348 
                   L 616,478 
                   Q 616,500 594,500 
                   L 22,500 
                   Q 0,500 0,478 
                   L 0,216 
                   Q 0,194 22,194 
                   L 262,194 
                   Q 284,194 284,172 
                   L 284,22 
                   Q 284,0 306,0 
                   Z"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1.5"
              />

              {/* Top-Left Solid Card (Amber in Light mode, Sage/Green in Dark mode) */}
              <foreignObject x="0" y="0" width="270" height="180" className="overflow-visible">
                <div className="w-full h-full p-5 sm:p-6 rounded-br-[24px] rounded-tr-[24px] rounded-bl-[24px] rounded-tl-[24px] bg-amber-accent dark:bg-sage-accent text-white dark:text-[#081722] border border-white/20 dark:border-black/10 shadow-2xl flex flex-col justify-center box-border transition-colors duration-200">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white dark:text-[#081722] font-mono leading-none">
                    O(1)
                  </div>
                  <p className="text-xs text-white/90 dark:text-[#081722]/85 mt-2 leading-relaxed font-medium">
                    Interactive pointer state machines &amp; step debugger
                  </p>
                </div>
              </foreignObject>

              {/* Top-Right Floating Card (Moved further right and slightly downward) */}
              <foreignObject x="845" y="55" width="235" height="150" className="overflow-visible">
                <div className="w-full h-full p-4 sm:p-5 rounded-[22px] bg-[#FDFCF7] dark:bg-[#F5EEDD] text-[#081722] border border-black/10 shadow-2xl shadow-black/25 flex flex-col justify-center box-border">
                  <div className="flex items-center gap-2 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#081722] font-mono leading-none">
                    <span>4.0</span>
                    <div className="w-6 h-6 rounded-full bg-amber-accent text-white dark:bg-sage-accent dark:text-[#081722] flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                      <Code2 size={13} />
                    </div>
                  </div>
                  <p className="text-3xs sm:text-2xs text-[#081722]/75 mt-1.5 sm:mt-2 leading-relaxed font-medium">
                    Idiomatic C, C++, Python &amp; Java parity
                  </p>
                </div>
              </foreignObject>

              {/* Bottom-Left Floating Card (Shifted upward and further left) */}
              <foreignObject x="-95" y="290" width="235" height="150" className="overflow-visible">
                <div className="w-full h-full p-4 sm:p-5 rounded-[22px] bg-[#FDFCF7] dark:bg-[#F5EEDD] text-[#081722] border border-black/10 shadow-2xl shadow-black/25 flex flex-col justify-center box-border">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#081722] font-mono leading-none">
                    15+
                  </div>
                  <p className="text-3xs sm:text-2xs text-[#081722]/75 mt-1.5 sm:mt-2 leading-relaxed font-medium">
                    Core ADTs, operations &amp; complexity proofs
                  </p>
                </div>
              </foreignObject>

              {/* Bottom-Right Topic Pills Container (Shifted right, centered alignment, dark blue border, extra bold) */}
              <foreignObject x="626" y="330" width="370" height="170" className="overflow-visible">
                <div className="w-full h-full p-2 flex items-center justify-center box-border">
                  <div className="grid grid-cols-2 gap-2.5 w-full max-w-[340px]">
                    <Link
                      to="/docs/intro-to-adts"
                      className="px-3.5 py-2 rounded-full border-2 border-primary dark:border-white/35 bg-surface/90 hover:bg-surface dark:bg-surface/75 dark:hover:bg-surface text-sm font-extrabold text-text hover:text-primary transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap text-center flex items-center justify-center tracking-tight"
                    >
                      Intro to ADTs
                    </Link>
                    <Link
                      to="/docs/comparison-linked-vs-array"
                      className="px-3.5 py-2 rounded-full border-2 border-primary dark:border-white/35 bg-surface/90 hover:bg-surface dark:bg-surface/75 dark:hover:bg-surface text-sm font-extrabold text-text hover:text-primary transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap text-center flex items-center justify-center tracking-tight"
                    >
                      Array vs List
                    </Link>
                    <Link
                      to="/docs/adt-list-contract"
                      className="px-3.5 py-2 rounded-full border-2 border-primary dark:border-white/35 bg-surface/90 hover:bg-surface dark:bg-surface/75 dark:hover:bg-surface text-sm font-extrabold text-text hover:text-primary transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap text-center flex items-center justify-center tracking-tight"
                    >
                      List Contract
                    </Link>
                    <Link
                      to="/docs/array-list-impl"
                      className="px-3.5 py-2 rounded-full border-2 border-primary dark:border-white/35 bg-surface/90 hover:bg-surface dark:bg-surface/75 dark:hover:bg-surface text-sm font-extrabold text-text hover:text-primary transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap text-center flex items-center justify-center tracking-tight"
                    >
                      Array List
                    </Link>
                    <Link
                      to="/docs/singly-linked-list-structure"
                      className="px-3.5 py-2 rounded-full border-2 border-primary dark:border-white/35 bg-surface/90 hover:bg-surface dark:bg-surface/75 dark:hover:bg-surface text-sm font-extrabold text-text hover:text-primary transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap text-center flex items-center justify-center tracking-tight"
                    >
                      Singly Linked
                    </Link>
                    <Link
                      to="/docs/doubly-linked-list-structure"
                      className="px-3.5 py-2 rounded-full border-2 border-primary dark:border-white/35 bg-surface/90 hover:bg-surface dark:bg-surface/75 dark:hover:bg-surface text-sm font-extrabold text-text hover:text-primary transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap text-center flex items-center justify-center tracking-tight"
                    >
                      Doubly Linked
                    </Link>
                  </div>
                </div>
              </foreignObject>
            </svg>
          </div>
        </div>

        {/* Centered Primary CTA Button */}
        <div className="mt-8 sm:mt-9 flex items-center justify-center shrink-0">
          <Link
            to="/docs/intro-to-adts"
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-primary text-[#F5EEDD] dark:text-[#081722] font-semibold text-xs sm:text-sm hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md group"
          >
            <span>Enter Documentation</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
};

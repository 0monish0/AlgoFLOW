import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useSearchStore } from '../store/searchStore';
import {
  ArrowRight,
  GitBranch,
  Layers,
  Table2,
  Network,
  Database,
  Sun,
  Moon,
  Search,
  Code2,
} from 'lucide-react';

const SANDBOX_STRUCTURES = [
  {
    id: 'linked-list',
    title: 'Linked List',
    summary: 'Singly and doubly linked nodes with real-time reachability.',
    icon: GitBranch,
    route: '/sandbox/linked-list',
    accentColor: 'text-accent',
  },
  {
    id: 'stack',
    title: 'Stack (LIFO)',
    summary: 'Physical container enforcing top-slot push and pop operations.',
    icon: Layers,
    route: '/sandbox/stack',
    accentColor: 'text-amber-accent',
  },
  {
    id: 'array',
    title: 'Array / ADT List',
    summary: 'Contiguous indexed slots with manual element shifting.',
    icon: Table2,
    route: '/sandbox/array',
    accentColor: 'text-sage-accent',
  },
  {
    id: 'tree',
    title: 'Binary Search Tree',
    summary: 'Hierarchical node sockets with live BST invariant validation.',
    icon: Network,
    route: '/sandbox/tree',
    accentColor: 'text-accent',
  },
  {
    id: 'hash-table',
    title: 'Hash Table',
    summary: 'Bucket distribution with linked-list collision chaining.',
    icon: Database,
    route: '/sandbox/hash-table',
    accentColor: 'text-amber-accent',
  },
];

export const SandboxPicker = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { openSearch } = useSearchStore();

  return (
    <div
      className="min-h-screen bg-base text-text font-mono flex flex-col justify-between select-none relative overflow-x-hidden"
      style={{
        backgroundImage: `radial-gradient(var(--color-border) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
    >
      {/* Top Floating Capsule Header */}
      <header className="w-full max-w-5xl mx-auto pt-5 pb-2 px-4 sm:px-6 shrink-0 z-30">
        <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 rounded-full bg-[#FFFFFF]/90 dark:bg-[#141414]/90 backdrop-blur-md border border-border dark:border-white/10 shadow-xl shadow-black/15">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 size={16} />
            </div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-primary">
              AlgoFLOW
            </span>
          </Link>

          {/* Center Search Button */}
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

            {/* Pill Docs Button */}
            <Link
              to="/docs/why-a-linked-list"
              className="px-4 py-2 rounded-full bg-accent text-black font-extrabold text-xs hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20 shrink-0"
            >
              Open Docs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workshop Directory */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-center">
        {/* Clean, Minimalist Headline */}
        <div className="max-w-2xl mb-8 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            Select a Structure
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-normal">
            2D interactive simulation substrates with real-time state evaluation.
          </p>
        </div>

        {/* Structure Cards Grid Styled Exactly Like the Documentation / Sandbox CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SANDBOX_STRUCTURES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.route}
                className="group relative flex flex-col justify-between p-6 rounded-[22px] bg-surface/90 text-primary border border-border dark:border-white/10 hover:border-accent dark:hover:border-accent hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/30 text-accent">
                      <Icon size={20} />
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-accent group-hover:translate-x-1 transition-transform"
                    />
                  </div>

                  <h2 className="text-base sm:text-lg font-extrabold text-primary group-hover:text-accent transition-colors mt-4">
                    {item.title}
                  </h2>

                  <p className="text-xs text-text-muted leading-relaxed mt-1.5 font-normal">
                    {item.summary}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Clean Aesthetic Footer */}
      <footer className="w-full max-w-6xl mx-auto py-5 px-4 text-center text-3xs text-text-muted font-mono border-t border-border/40">
        State-driven graph evaluation engine • Zero pre-scripted playback
      </footer>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { useSandboxStore } from '../core/useSandboxStore';
import { useThemeStore } from '../../store/themeStore';
import { ArrowLeft, Sun, Moon, Sparkles, Sliders, Code2 } from 'lucide-react';

export const SandboxShell = ({
  children,
  title = 'Linked List',
  variants = [],
  activeVariant = 'singly',
  onVariantChange,
  docSlug,
}) => {
  const { mode, setMode } = useSandboxStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="relative w-screen h-screen bg-[#080808] text-text font-mono overflow-hidden select-none">
      {/* Top Floating Capsule Header - Overlaying Full Canvas */}
      <header className="absolute top-3 left-0 right-0 z-40 px-3 sm:px-6 font-mono select-none pointer-events-none">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-5 py-2 rounded-full bg-[#141414]/90 backdrop-blur-md border border-white/10 shadow-xl shadow-black/30 pointer-events-auto">
          {/* Left section: Back Link & Site Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/sandbox"
              className="p-1.5 rounded-full hover:bg-white/10 text-text transition-colors flex items-center gap-1 text-xs group"
              title="Return to Sandbox picker"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline font-semibold">Sandboxes</span>
            </Link>

            <div className="flex items-center gap-2 border-l border-white/10 pl-2.5">
              <Link to="/" className="flex items-center gap-1.5 text-sm sm:text-base font-extrabold tracking-tight text-white group">
                <div className="w-5 h-5 rounded-md bg-accent/20 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Code2 size={12} />
                </div>
                <span className="text-white">Algo<span className="text-accent">Flow</span></span>
              </Link>
              <span className="text-xs font-normal text-text-muted hidden md:inline">
                / {title}
              </span>
            </div>
          </div>

          {/* Middle section: Variant Switcher (if applicable) */}
          {variants.length > 0 && (
            <div className="hidden md:flex items-center p-0.5 rounded-full bg-black/40 border border-white/10">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onVariantChange && onVariantChange(v.id)}
                  className={`px-3 py-1 text-3xs sm:text-2xs rounded-full transition-all font-mono font-bold ${
                    activeVariant === v.id
                      ? 'bg-accent text-black font-bold shadow-2xs'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {/* Right section: Guided/Free Switcher, Theme Toggle & Docs CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Switcher Pill */}
            <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10">
              <button
                onClick={() => setMode('free')}
                className={`flex items-center gap-1 px-3 py-1 text-3xs rounded-full transition-all font-bold ${
                  mode === 'free'
                    ? 'bg-accent text-black font-bold shadow-2xs'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Sliders size={11} />
                <span>Free</span>
              </button>
              <button
                onClick={() => setMode('guided')}
                className={`flex items-center gap-1 px-3 py-1 text-3xs rounded-full transition-all font-bold ${
                  mode === 'guided'
                    ? 'bg-accent text-black font-bold shadow-2xs'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Sparkles size={11} />
                <span>Lessons</span>
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-white/10 text-text transition-colors flex items-center justify-center"
              title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon size={14} className="text-accent" /> : <Sun size={14} className="text-amber-accent" />}
            </button>

            {/* Docs link */}
            <Link
              to={docSlug ? `/docs/${docSlug}` : title.toLowerCase().includes('linked') ? '/docs/why-a-linked-list' : '/docs/is-there-even-a-need'}
              className="px-3.5 py-1.5 rounded-full bg-accent hover:opacity-95 text-black font-extrabold text-xs transition-all shadow-xs shrink-0"
            >
              Docs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Canvas Viewport */}
      <main className="w-full h-full relative">
        {children}
      </main>
    </div>
  );
};

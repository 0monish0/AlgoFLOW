import React from 'react';
import { Link } from 'react-router-dom';
import { useSandboxStore } from '../core/useSandboxStore';
import { useThemeStore } from '../../store/themeStore';
import { ArrowLeft, BookOpen, Sun, Moon, Sparkles, Sliders } from 'lucide-react';

export const SandboxShell = ({
  children,
  title = 'Linked List',
  variants = [],
  activeVariant = 'singly',
  onVariantChange,
}) => {
  const { mode, setMode } = useSandboxStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="w-screen h-screen flex flex-col bg-base text-text font-mono overflow-hidden select-none">
      {/* Top Application Bar matching TopBar.jsx exactly */}
      <header className="sticky top-0 z-30 w-full h-16 bg-surface/90 backdrop-blur-md border-b border-border font-mono select-none px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        {/* Left section: Back Link & Site Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/sandbox"
            className="p-2 rounded-xl border border-border dark:border-transparent bg-surface hover:bg-accent/15 text-text transition-colors flex items-center gap-1.5 text-xs shadow-2xs group"
            title="Return to Sandbox picker"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline font-semibold">Sandboxes</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link to="/" className="text-base font-extrabold tracking-tight text-primary">
              AgroFlow
            </Link>
            <span className="text-xs font-normal text-text-muted border-l border-border pl-2.5">
              {title}
            </span>
          </div>
        </div>

        {/* Middle section: Variant Switcher (if applicable) */}
        {variants.length > 0 && (
          <div className="hidden md:flex items-center p-1 rounded-xl bg-base/60 border border-border/80 dark:border-transparent shadow-2xs">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => onVariantChange && onVariantChange(v.id)}
                className={`px-3 py-1 text-2xs sm:text-xs rounded-lg transition-all font-mono font-bold ${
                  activeVariant === v.id
                    ? 'bg-primary text-[#F5EEDD] dark:text-[#081722] shadow-2xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Right section: Guided/Free Switcher, Theme Toggle & Docs */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-base/60 border border-border/80 dark:border-transparent shadow-2xs">
            <button
              onClick={() => setMode('free')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-2xs sm:text-xs rounded-lg transition-all font-bold ${
                mode === 'free'
                  ? 'bg-primary text-[#F5EEDD] dark:text-[#081722] shadow-2xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Sliders size={12} />
              <span>Free</span>
            </button>
            <button
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-2xs sm:text-xs rounded-lg transition-all font-bold ${
                mode === 'guided'
                  ? 'bg-primary text-[#F5EEDD] dark:text-[#081722] shadow-2xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Sparkles size={12} />
              <span>Lessons</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border dark:border-transparent bg-surface hover:bg-accent/15 text-text transition-colors flex items-center justify-center shadow-2xs"
            title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={16} className="text-accent" /> : <Sun size={16} className="text-amber-accent" />}
          </button>

          {/* Docs Link Button */}
          <Link
            to="/docs/why-a-linked-list"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border dark:border-transparent bg-surface hover:bg-accent/15 text-xs font-semibold text-text transition-colors shadow-2xs"
          >
            <BookOpen size={14} />
            <span>Docs</span>
          </Link>
        </div>
      </header>

      {/* Main Canvas Viewport Area */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
};

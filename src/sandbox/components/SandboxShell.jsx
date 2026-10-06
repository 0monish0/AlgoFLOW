import React from 'react';
import { Link } from 'react-router-dom';
import { useSandboxStore } from '../core/useSandboxStore';
import { ArrowLeft, Sparkles, Sliders, Code2, Terminal } from 'lucide-react';

export const SandboxShell = ({
  children,
  title = 'Linked List',
  variants = [],
  activeVariant = 'singly',
  onVariantChange,
  docSlug,
  codeEditorOpen = false,
  onToggleCodeEditor,
}) => {
  const { mode, setMode } = useSandboxStore();

  return (
    <div className="w-screen h-[100dvh] bg-[#080808] text-text font-mono overflow-hidden select-none flex flex-col">
      {/* Top Capsule Header - Occupies layout space in column */}
      <header className="flex-none h-[var(--nav-h,56px)] px-3 sm:px-6 py-2 z-30 font-mono select-none flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-5 py-2 rounded-full bg-[#141414]/90 backdrop-blur-md border border-white/10 shadow-xl shadow-black/30 pointer-events-auto">
          {/* Left section: Site Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/" className="flex items-center gap-1.5 text-sm sm:text-base font-extrabold tracking-tight text-white group">
              <div className="w-5 h-5 rounded-md bg-accent/20 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <Code2 size={12} />
              </div>
              <span className="text-white">Algo<span className="text-accent">Flow</span></span>
            </Link>
            <span className="text-xs font-normal text-text-muted hidden sm:inline">
              / {title || 'Sandbox'}
            </span>
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

          {/* Right section: Guided/Free Switcher, Code Editor Toggle & Docs CTA */}
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

            {/* Code Editor Toggle */}
            {onToggleCodeEditor && (
              <button
                onClick={onToggleCodeEditor}
                title={codeEditorOpen ? 'Close code editor' : 'Open bidirectional code editor'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-2xs border transition-all ${
                  codeEditorOpen
                    ? 'bg-accent/15 border-accent/50 text-accent'
                    : 'bg-black/40 border-white/10 text-text-muted hover:text-white hover:border-white/25'
                }`}
              >
                <Terminal size={11} />
                <span>Code</span>
              </button>
            )}

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

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 w-full relative flex overflow-hidden z-0">
        {children}
      </main>
    </div>
  );
};

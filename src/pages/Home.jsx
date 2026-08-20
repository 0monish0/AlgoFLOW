import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { ArrowRight, BookOpen, Layers, Terminal, Sun, Moon, Search } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';

export const Home = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { openSearch } = useSearchStore();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const languages = [
    {
      name: 'C (ISO C99)',
      slug: 'linked-list-c',
      desc: 'Manual heap management, pointer dereferencing, defensive malloc checks, and explicit memory reclamation.',
      meta: 'malloc / free / structs',
    },
    {
      name: 'C++ (Modern C++20)',
      slug: 'linked-list-cpp',
      desc: 'Generic template classes, RAII lifecycle ownership, move semantics, and custom standard forward iterators.',
      meta: 'templates / iterators / RAII',
    },
    {
      name: 'Python (Pythonic OOP)',
      slug: 'linked-list-python',
      desc: 'Clean dunder protocols (__len__, __iter__, __getitem__), generator traversal, and memory safety.',
      meta: 'protocols / slots / typing',
    },
    {
      name: 'Java (Generics & Iterables)',
      slug: 'linked-list-java',
      desc: 'Generic type parameters, static inner node encapsulation, fail-fast iterator concurrency checks, and GC integration.',
      meta: 'generics / Iterable<E>',
    },
  ];

  return (
    <div className="min-h-screen bg-base text-text font-mono flex flex-col selection:bg-accent/30 selection:text-primary">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-primary">
          <span className="w-3 h-3 rounded-xs bg-accent inline-block" />
          <span>AgroFlow</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-surface text-2xs text-text-muted hover:text-text hover:border-accent/40 transition-all"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Search docs...</span>
            <kbd className="text-3xs px-1 py-0.5 rounded border border-border bg-base/50">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded border border-border bg-surface hover:bg-accent/15 text-text transition-colors flex items-center justify-center"
            title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
          >
            {theme === 'dark' ? <Moon size={15} className="text-accent" /> : <Sun size={15} className="text-amber-700 dark:text-amber-500" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Hero Section */}
        <section className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/15 border border-accent/30 text-2xs font-semibold text-primary">
            <span>TECHNICAL SPECIFICATION & HANDBOOK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-tight">
            Abstract Data Type: List & Linked List Reference
          </h1>

          <p className="text-base text-text-muted leading-relaxed">
            A comprehensive, production-grade technical reference covering the complete List Abstract Data Type
            and the Linked List family—fully implemented, memory-profiled, and analyzed across{' '}
            <strong className="text-primary font-semibold">C, C++, Python, and Java</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/docs/intro-to-adts"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-base font-semibold hover:opacity-95 transition-opacity shadow-subtle text-xs"
            >
              <span>Enter Documentation</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/docs/complexity-cheat-sheet"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-border bg-surface hover:bg-accent/10 transition-colors text-xs font-medium text-text"
            >
              <span>Complexity Matrix</span>
            </Link>
          </div>
        </section>

        {/* Schematic Architectural SVG Diagram */}
        <section className="border border-border rounded-lg bg-surface/60 p-6 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Pointer Architecture Schematic
            </span>
            <span className="text-2xs font-mono text-text-muted">Singly Linked List Memory Chain</span>
          </div>

          <div className="flex items-center justify-center py-4 overflow-x-auto">
            <svg className="w-full max-w-[620px] h-[75px]" viewBox="0 0 620 75" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="10" y="42" fill="var(--color-primary)" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">HEAD</text>
              <path d="M45 38H72" stroke="var(--color-primary)" strokeWidth="1.5" markerEnd="url(#arrow-home)" />

              {/* Node 1 */}
              <rect x="76" y="18" width="95" height="40" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-bg-surface)" />
              <line x1="135" y1="18" x2="135" y2="58" stroke="var(--color-border)" strokeWidth="1.5" />
              <text x="105" y="43" fill="var(--color-text)" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">10</text>
              <circle cx="152" cy="38" r="3.5" fill="var(--color-accent)" />
              <path d="M152 38H200" stroke="var(--color-accent)" strokeWidth="1.5" markerEnd="url(#arrow-home)" />

              {/* Node 2 */}
              <rect x="204" y="18" width="95" height="40" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-bg-surface)" />
              <line x1="263" y1="18" x2="263" y2="58" stroke="var(--color-border)" strokeWidth="1.5" />
              <text x="233" y="43" fill="var(--color-text)" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">20</text>
              <circle cx="280" cy="38" r="3.5" fill="var(--color-accent)" />
              <path d="M280 38H328" stroke="var(--color-accent)" strokeWidth="1.5" markerEnd="url(#arrow-home)" />

              {/* Node 3 */}
              <rect x="332" y="18" width="95" height="40" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-bg-surface)" />
              <line x1="391" y1="18" x2="391" y2="58" stroke="var(--color-border)" strokeWidth="1.5" />
              <text x="361" y="43" fill="var(--color-text)" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">30</text>
              <circle cx="408" cy="38" r="3.5" fill="var(--color-accent)" />
              <path d="M408 38H456" stroke="var(--color-accent)" strokeWidth="1.5" markerEnd="url(#arrow-home)" />

              {/* Terminal NULL */}
              <text x="465" y="42" fill="var(--color-text-muted)" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">NULL</text>

              <defs>
                <marker id="arrow-home" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--color-primary)" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        {/* 2x2 Language Implementations Grid */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-bold text-primary">Language Implementations</h2>
            <p className="text-xs text-text-muted mt-1">
              Idiomatic and runnable code modules with side-by-side variable and structural naming parity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {languages.map((lang) => (
              <Link
                key={lang.slug}
                to={`/docs/${lang.slug}`}
                className="group block p-5 rounded border border-border bg-surface hover:border-accent hover:bg-accent/5 transition-all shadow-subtle"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary group-hover:text-accent transition-colors">
                    {lang.name}
                  </span>
                  <span className="text-2xs font-mono text-text-muted bg-base px-2 py-0.5 rounded border border-border/80">
                    {lang.meta}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed mb-3">
                  {lang.desc}
                </p>
                <div className="flex items-center gap-1.5 text-2xs font-semibold text-primary group-hover:text-accent transition-colors">
                  <span>View full code & analysis</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Core Subject Modules Preview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded border border-border bg-surface/50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Layers size={16} className="text-accent" />
              <span>Abstract Data Type: List</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Mathematical specification, positional semantics, contiguous dynamic array implementation,
              geometric resizing mechanics, and cache locality profiling.
            </p>
            <div className="pt-2">
              <Link
                to="/docs/adt-list-contract"
                className="text-2xs font-semibold text-primary hover:text-accent inline-flex items-center gap-1"
              >
                <span>Read ADT List Contract</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded border border-border bg-surface/50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Terminal size={16} className="text-accent" />
              <span>Linked List Family</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Singly, doubly, and circular linked structures. Step-by-step interactive pointer rewiring,
              in-place reversal algorithms, cycle detection, and LRU cache applications.
            </p>
            <div className="pt-2">
              <Link
                to="/docs/singly-linked-list-structure"
                className="text-2xs font-semibold text-primary hover:text-accent inline-flex items-center gap-1"
              >
                <span>Explore Singly Linked List</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Plain Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-border mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-text-muted">
        <div>AgroFlow — DSA Technical Reference</div>
        <div>Engineered for C, C++, Python, and Java</div>
      </footer>
    </div>
  );
};

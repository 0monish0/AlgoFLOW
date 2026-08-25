import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import {
  ArrowRight,
  GitBranch,
  Layers,
  Table2,
  Network,
  Database,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

const SANDBOX_STRUCTURES = [
  {
    id: 'linked-list',
    title: 'Linked List',
    category: 'Dynamic Pointers',
    summary: 'Singly, Doubly, and Circular linked lists with real pointer reachability and GC simulation.',
    icon: GitBranch,
    route: '/sandbox/linked-list',
    badge: 'Flagship Simulator',
    accentColor: 'text-accent',
    bgBadge: 'bg-accent/15 text-accent',
  },
  {
    id: 'stack',
    title: 'Stack (LIFO)',
    category: 'Bounded Container',
    summary: 'Physical LIFO container where only the top slot permits push and pop operations.',
    icon: Layers,
    route: '/sandbox/stack',
    badge: 'Physical LIFO',
    accentColor: 'text-amber-accent',
    bgBadge: 'bg-amber-accent/15 text-amber-accent',
  },
  {
    id: 'array',
    title: 'Array / ADT List',
    category: 'Contiguous Memory',
    summary: 'Contiguous indexed slots with manual element shifting to physically feel O(n) costs.',
    icon: Table2,
    route: '/sandbox/array',
    badge: 'Shift Simulation',
    accentColor: 'text-sage-accent',
    bgBadge: 'bg-sage-accent/15 text-sage-accent',
  },
  {
    id: 'tree',
    title: 'Binary Search Tree',
    category: 'Hierarchical Structure',
    summary: 'Interactive root hierarchy with parent-child sockets and live BST ordering validation.',
    icon: Network,
    route: '/sandbox/tree',
    badge: 'BST Validator',
    accentColor: 'text-accent',
    bgBadge: 'bg-accent/15 text-accent',
  },
  {
    id: 'hash-table',
    title: 'Hash Table',
    category: 'Key-Value Mapping',
    summary: 'Hash arithmetic with live bucket distribution and linked-list collision chaining.',
    icon: Database,
    route: '/sandbox/hash-table',
    badge: 'Chaining Simulator',
    accentColor: 'text-amber-accent',
    bgBadge: 'bg-amber-accent/15 text-amber-accent',
  },
];

export const SandboxPicker = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-base text-text font-mono flex flex-col justify-between select-none">
      {/* Top Application Bar */}
      <header className="w-full max-w-6xl mx-auto pt-5 pb-3 px-4 sm:px-8 flex items-center justify-between gap-4">
        <Link to="/" className="text-base sm:text-lg font-extrabold tracking-tight text-primary">
          AgroFlow
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/docs/why-a-linked-list"
            className="text-xs text-text-muted hover:text-text px-3 py-1.5 rounded-lg border border-border transition-colors"
          >
            Open Docs
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border hover:bg-accent/15 text-text transition-colors flex items-center justify-center"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={15} className="text-accent" /> : <Sun size={15} className="text-amber-accent" />}
          </button>
        </div>
      </header>

      {/* Main Workshop Directory */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col justify-center">
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            <span>Interactive Sandboxes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            Build It With Your Own Hands
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-normal">
            Manipulate raw nodes, rewire pointers, experience garbage collection on orphaned memory, and test invariants in a live 2D simulation.
          </p>
        </div>

        {/* 5 Structure Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SANDBOX_STRUCTURES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.route}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border/80 bg-surface/80 hover:border-accent hover:bg-surface hover:shadow-xl transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-base/60 border border-border ${item.accentColor}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-3xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${item.bgBadge}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <div className="text-3xs uppercase tracking-wider text-text-muted font-bold">
                      {item.category}
                    </div>
                    <h2 className="text-lg font-extrabold text-primary group-hover:text-accent transition-colors mt-0.5">
                      {item.title}
                    </h2>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:text-accent transition-colors">
                  <span>Enter Workshop</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="w-full max-w-6xl mx-auto py-6 px-4 text-center text-3xs text-text-muted font-mono">
        State-driven graph evaluation engine • Zero pre-scripted playback
      </footer>
    </div>
  );
};

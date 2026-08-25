import React, { useEffect } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { Plus, RotateCcw, Undo2, Redo2, Navigation } from 'lucide-react';

export const ToolbarPalette = () => {
  const {
    addNode,
    addFreePointer,
    undo,
    redo,
    resetCanvas,
    historyStack,
    futureStack,
  } = useSandboxStore();

  // Keyboard shortcut listeners (Cmd+Z / Ctrl+Z, Cmd+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-xl font-mono text-xs select-none">
      {/* 1. New Node Tool */}
      <button
        onClick={() => addNode(Math.floor(Math.random() * 90 + 10))}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs"
        title="Spawn a new unattached node (malloc)"
      >
        <Plus size={14} />
        <span>New Node</span>
      </button>

      {/* 2. New Pointer Tool */}
      <button
        onClick={() => addFreePointer()}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:border-accent hover:bg-accent/10 text-text font-bold transition-all shadow-xs active:scale-95"
        title="Spawn a new free pointer (e.g. head, curr, temp)"
      >
        <Navigation size={13} className="text-accent rotate-45" />
        <span>New Pointer</span>
      </button>

      <div className="w-[1px] h-5 bg-border mx-0.5" />

      {/* Undo */}
      <button
        onClick={undo}
        disabled={historyStack.length === 0}
        className="p-2 rounded-xl border border-transparent hover:border-border text-text-muted hover:text-text hover:bg-accent/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Undo (Cmd+Z)"
      >
        <Undo2 size={15} />
      </button>

      {/* Redo */}
      <button
        onClick={redo}
        disabled={futureStack.length === 0}
        className="p-2 rounded-xl border border-transparent hover:border-border text-text-muted hover:text-text hover:bg-accent/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Redo (Cmd+Shift+Z)"
      >
        <Redo2 size={15} />
      </button>

      <div className="w-[1px] h-5 bg-border mx-0.5" />

      {/* Reset Canvas */}
      <button
        onClick={resetCanvas}
        className="p-2 rounded-xl border border-transparent hover:border-border text-text-muted hover:text-text hover:bg-accent/10 transition-all flex items-center gap-1.5 px-2.5"
        title="Clear canvas"
      >
        <RotateCcw size={14} />
        <span className="hidden sm:inline text-3xs uppercase font-bold">Reset</span>
      </button>
    </div>
  );
};

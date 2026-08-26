import React, { useEffect } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { Plus, RotateCcw, Undo2, Redo2, ArrowRight } from 'lucide-react';

export const ToolbarPalette = () => {
  const {
    addNode,
    addFreePointer,
    addNullToken,
    undo,
    redo,
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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414]/90 backdrop-blur-md border border-white/10 shadow-2xl font-mono text-xs select-none">
      {/* 1. New Node Tool */}
      <button
        onClick={() => addNode(Math.floor(Math.random() * 90 + 10))}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-[#1C1C1E] hover:border-white/30 hover:bg-[#2C2C2E] text-white font-bold transition-all shadow-xs active:scale-95"
        title="Spawn a new unattached circular node"
      >
        <Plus size={13} strokeWidth={3} />
        <span>New Node</span>
      </button>

      {/* 2. New Head Pointer - Solid White Background with Black Font */}
      <button
        onClick={() => addFreePointer('head')}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black font-extrabold hover:bg-white/90 active:scale-95 transition-all shadow-md"
        title="Spawn a head entry pointer (white background, black font)"
      >
        <ArrowRight size={12} strokeWidth={2.5} className="text-black" />
        <span>Head</span>
      </button>

      {/* 3. New Curr Pointer - Uniform Dark Theme */}
      <button
        onClick={() => addFreePointer('curr')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-[#1C1C1E] hover:border-white/30 hover:bg-[#2C2C2E] text-white font-bold transition-all shadow-xs active:scale-95"
        title="Spawn a curr traversal pointer"
      >
        <ArrowRight size={12} className="text-text-muted" />
        <span>Curr</span>
      </button>

      {/* 4. Custom Pointer - Uniform Dark Theme */}
      <button
        onClick={() => addFreePointer('ptr')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-[#1C1C1E] hover:border-white/30 hover:bg-[#2C2C2E] text-white font-bold transition-all shadow-xs active:scale-95"
        title="Spawn a custom pointer"
      >
        <Plus size={12} className="text-text-muted" />
        <span>Pointer</span>
      </button>

      {/* 5. New NULL Token Tool */}
      <button
        onClick={() => addNullToken()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-white/20 bg-[#1C1C1E] hover:border-white/40 hover:bg-[#2C2C2E] text-text-muted hover:text-white font-bold transition-all shadow-xs active:scale-95"
        title="Spawn a NULL terminator token"
      >
        <span>NULL</span>
      </button>

      <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

      {/* Undo */}
      <button
        onClick={undo}
        disabled={historyStack.length === 0}
        className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Undo (Cmd+Z)"
      >
        <Undo2 size={14} />
      </button>

      {/* Redo */}
      <button
        onClick={redo}
        disabled={futureStack.length === 0}
        className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Redo (Cmd+Y)"
      >
        <Redo2 size={14} />
      </button>

      {/* Reset */}
      <button
        onClick={() => {
          if (window.confirm('Reset linked list canvas?')) {
            useSandboxStore.getState().resetCanvas();
          }
        }}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-red-500/10 hover:text-red-400 text-text-muted font-bold text-3xs transition-all"
        title="Reset canvas"
      >
        <RotateCcw size={12} />
        <span>RESET</span>
      </button>
    </div>
  );
};

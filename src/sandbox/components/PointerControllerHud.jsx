import React from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { SkipForward, SkipBack, X, Navigation, Trash2 } from 'lucide-react';

const PRESET_LABELS = ['head', 'tail', 'curr', 'temp', 'prev', 'slow', 'fast'];

export const PointerControllerHud = () => {
  const {
    activePointerId,
    setActivePointerId,
    freePointers,
    nodes,
    stepPointerForward,
    stepPointerBackward,
    updatePointerLabel,
    deleteFreePointer,
  } = useSandboxStore();

  if (!activePointerId || !freePointers[activePointerId]) return null;

  const ptr = freePointers[activePointerId];
  const targetNode = ptr.targetId && ptr.targetId !== 'NULL' ? nodes[ptr.targetId] : null;
  const isNullTarget = ptr.targetId === 'NULL';
  const isDoublyTarget = targetNode?.nodeType === 'doubly';
  const hasNext = Boolean(targetNode?.sockets?.next?.targetId);
  const hasPrev = Boolean(isDoublyTarget && targetNode?.sockets?.prev?.targetId);

  const handleDelete = () => {
    deleteFreePointer(ptr.id);
    setActivePointerId(null);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-20 right-6 sm:right-8 z-40 w-76 bg-[#141414]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl font-mono text-xs select-none overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-4 space-y-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Navigation size={11} className="rotate-45" />
          </div>
          <span className="font-extrabold text-white tracking-tight text-xs">
            POINTER: <span className="text-accent">{ptr.label}</span>
          </span>
        </div>
        <button
          onClick={() => setActivePointerId(null)}
          className="p-1 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          title="Close pointer controller"
        >
          <X size={14} />
        </button>
      </div>

      {/* Target Status */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-2xs">
        <span className="text-text-muted">Target:</span>
        {targetNode ? (
          <span className="font-bold px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30">
            Node [{targetNode.data}] ({targetNode.nodeType})
          </span>
        ) : isNullTarget ? (
          <span className="font-bold text-text-muted px-2 py-0.5 rounded-md bg-[#1C1C1E] border border-dashed border-white/20">
            NULL Terminator
          </span>
        ) : (
          <span className="font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30">
            (unassigned)
          </span>
        )}
      </div>

      {/* Main Interactive Stepper Controls */}
      <div className="grid grid-cols-2 gap-2">
        {/* Step Prev */}
        <button
          onClick={() => stepPointerBackward(ptr.id)}
          disabled={!hasPrev}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 bg-[#1C1C1E] hover:bg-[#2C2C2E] disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-xs transition-all shadow-xs active:scale-95"
          title="Step backward: ptr = ptr->prev (Doubly linked only)"
        >
          <SkipBack size={13} className="text-text-muted" />
          <span>Step Prev</span>
        </button>

        {/* Step Next */}
        <button
          onClick={() => stepPointerForward(ptr.id)}
          disabled={!hasNext}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-accent hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none text-black font-extrabold text-xs transition-all shadow-md active:scale-95"
          title="Step forward: ptr = ptr->next"
        >
          <span>Step Next</span>
          <SkipForward size={13} />
        </button>
      </div>

      {/* Preset Chips */}
      <div className="space-y-1.5 pt-2 border-t border-white/10">
        <div className="text-3xs uppercase tracking-wider text-text-muted font-bold">
          Rename Preset
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESET_LABELS.map((preset) => (
            <button
              key={preset}
              onClick={() => updatePointerLabel(ptr.id, preset)}
              className={`px-2.5 py-0.5 rounded-full text-3xs font-mono font-bold transition-all border ${
                ptr.label.toLowerCase() === preset
                  ? 'border-accent bg-accent/20 text-accent'
                  : 'border-white/10 bg-black/40 text-text-muted hover:border-white/20 hover:text-white'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

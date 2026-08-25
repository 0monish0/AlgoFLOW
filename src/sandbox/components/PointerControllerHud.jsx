import React from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { Play, SkipForward, SkipBack, X, Navigation, FastForward } from 'lucide-react';

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
  } = useSandboxStore();

  if (!activePointerId || !freePointers[activePointerId]) return null;

  const ptr = freePointers[activePointerId];
  const targetNode = ptr.targetId && ptr.targetId !== 'NULL' ? nodes[ptr.targetId] : null;
  const isNullTarget = ptr.targetId === 'NULL';
  const isDoublyTarget = targetNode?.nodeType === 'doubly';
  const hasNext = Boolean(targetNode?.sockets?.next?.targetId);
  const hasPrev = Boolean(isDoublyTarget && targetNode?.sockets?.prev?.targetId);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-4 right-4 z-40 w-80 bg-surface/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl font-mono text-xs select-none overflow-hidden animate-in slide-in-from-top-4 duration-150"
    >
      {/* Controller Header */}
      <div className="p-3 bg-base/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] flex items-center justify-center">
            <Navigation size={11} className="rotate-45" />
          </div>
          <span className="font-extrabold text-primary tracking-tight">
            POINTER: <span className="text-accent">{ptr.label}</span>
          </span>
        </div>
        <button
          onClick={() => setActivePointerId(null)}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text transition-colors"
          title="Close pointer controller"
        >
          <X size={14} />
        </button>
      </div>

      {/* Target Status Bar */}
      <div className="px-3.5 py-2.5 bg-base/20 border-b border-border/60 flex items-center justify-between text-2xs">
        <span className="text-text-muted">Currently at:</span>
        {targetNode ? (
          <span className="font-bold text-primary px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
            Node [{targetNode.data}] ({targetNode.nodeType})
          </span>
        ) : isNullTarget ? (
          <span className="font-bold text-text-muted px-2 py-0.5 rounded bg-base border border-dashed border-border">
            NULL Terminator
          </span>
        ) : (
          <span className="font-bold text-amber-accent px-2 py-0.5 rounded bg-amber-accent/15 border border-amber-accent/30">
            (unassigned)
          </span>
        )}
      </div>

      {/* Main Interactive Stepper Actions (Game-like controller) */}
      <div className="p-3.5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Step Prev (ptr = ptr->prev) */}
          <button
            onClick={() => stepPointerBackward(ptr.id)}
            disabled={!hasPrev}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-base hover:bg-accent/15 hover:border-accent disabled:opacity-30 disabled:pointer-events-none text-text font-bold text-xs transition-all shadow-xs active:scale-95"
            title="Step backward: ptr = ptr->prev (Doubly linked only)"
          >
            <SkipBack size={13} className="text-sage-accent" />
            <span>Step Prev</span>
          </button>

          {/* Step Next (ptr = ptr->next) */}
          <button
            onClick={() => stepPointerForward(ptr.id)}
            disabled={!hasNext}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition-all shadow-xs active:scale-95"
            title="Step forward: ptr = ptr->next"
          >
            <span>Step Next</span>
            <SkipForward size={13} />
          </button>
        </div>

        {/* Quick Label Preset Chips */}
        <div className="space-y-1.5 pt-1 border-t border-border/50">
          <div className="text-3xs uppercase tracking-wider text-text-muted font-bold">
            Rename Preset
          </div>
          <div className="flex flex-wrap gap-1">
            {PRESET_LABELS.map((preset) => (
              <button
                key={preset}
                onClick={() => updatePointerLabel(ptr.id, preset)}
                className={`px-2 py-0.5 rounded-md text-3xs font-mono font-bold border transition-all ${
                  ptr.label === preset
                    ? 'bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] border-transparent'
                    : 'bg-base border-border text-text-muted hover:border-accent hover:text-text'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

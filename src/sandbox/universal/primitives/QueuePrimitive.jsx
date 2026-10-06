/**
 * @fileoverview Queue Primitive (horizontal row of cells with shared borders, no outer frame).
 * Front tag with arrow under first cell, rear tag under last cell.
 * Faint 'out <-' at left end, '-> in' at right end.
 * Enqueue slides cell in at rear; Dequeue slides front cell out.
 */

import React from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

export function QueuePrimitive({ struct }) {
  const {
    selectedId,
    setSelectedId,
    dispatch,
    pan,
    zoom,
  } = useUniversalStore();

  const isSelected = selectedId === struct.id;
  const items = struct.items || [];
  const capacity = struct.capacity || 6;

  const ghostSlots = Math.max(0, capacity - items.length);

  const handleDrag = (e) => {
    if (e.target.closest('button')) return;
    e.stopPropagation();

    setSelectedId(struct.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...struct.position };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      dispatch({
        type: 'structure.move',
        id: struct.id,
        pos: { x: initialPos.x + dx, y: initialPos.y + dy },
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${struct.position.x}px`,
        top: `${struct.position.y}px`,
      }}
      onMouseDown={handleDrag}
      className="flex flex-col items-center font-mono select-none z-10"
    >
      {/* ── FLOATING MINI-TOOLBAR (Shown on Selection) ──────────── */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-3 flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b]/95 border border-[#3f3f46] shadow-2xl backdrop-blur-md z-30 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          <span className="text-3xs text-zinc-400 font-bold">
            {struct.varName || 'q1'} (size {items.length}/{capacity})
          </span>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Enqueue */}
          <button
            onClick={() => dispatch({ type: 'queue.enqueue', id: struct.id })}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 text-emerald-400 text-3xs font-bold"
          >
            <span>+ Enqueue</span>
          </button>

          {/* Dequeue */}
          <button
            onClick={() => dispatch({ type: 'queue.dequeue', id: struct.id })}
            disabled={items.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-amber-500/20 text-amber-300 text-3xs font-bold disabled:opacity-40"
          >
            <span>- Dequeue</span>
          </button>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Delete */}
          <button
            onClick={() => dispatch({ type: 'structure.delete', id: struct.id })}
            className="p-1 rounded-full text-zinc-400 hover:text-red-400"
            title="Delete Queue"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* ── QUEUE HORIZONTAL TRACK WITH 'out <-' and '-> in' ──────── */}
      <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
        {/* Out Indicator at left */}
        <div className="flex items-center gap-1 text-3xs text-zinc-500 font-bold opacity-60">
          <ArrowLeft size={12} />
          <span>out</span>
        </div>

        {/* Cells Row */}
        <div className="flex items-center">
          {items.map((val, idx) => {
            const isFront = idx === 0;
            const isRear = idx === items.length - 1;

            return (
              <div
                key={idx}
                className={`relative w-[52px] h-[52px] flex items-center justify-center -ml-[1px] ${
                  idx === 0 ? 'rounded-l-lg' : ''
                } ${idx === items.length - 1 && ghostSlots === 0 ? 'rounded-r-lg' : ''} ${
                  isFront
                    ? 'border-[1.5px] border-[#10b981] bg-[#18181b] text-white shadow-sm'
                    : isRear
                    ? 'border-[1.5px] border-[#a78bfa] bg-[#18181b] text-white'
                    : 'border-[1.5px] border-[#3f3f46] bg-[#141416] text-zinc-300'
                }`}
              >
                <span className="text-sm font-bold">{val}</span>

                {/* Front Tag Under First Cell */}
                {isFront && (
                  <div className="absolute top-full mt-1.5 flex flex-col items-center text-emerald-400 text-3xs font-bold pointer-events-none">
                    <span>▲</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#18181b] border border-emerald-500/40 text-emerald-300">
                      front
                    </span>
                  </div>
                )}

                {/* Rear Tag Under Last Cell */}
                {isRear && (
                  <div className="absolute top-full mt-1.5 flex flex-col items-center text-violet-400 text-3xs font-bold pointer-events-none">
                    <span>▲</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#18181b] border border-violet-500/40 text-violet-300">
                      rear
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Faint Ghost Capacity Slots */}
          {Array.from({ length: ghostSlots }).map((_, i) => (
            <div
              key={`ghost-${i}`}
              className="w-[52px] h-[52px] border border-dashed border-zinc-700/30 -ml-[1px] flex items-center justify-center text-3xs text-zinc-700 pointer-events-none"
            />
          ))}

          {items.length === 0 && (
            <div className="px-4 py-3 text-3xs text-zinc-600 border border-dashed border-zinc-700/40 rounded-lg">
              empty queue
            </div>
          )}
        </div>

        {/* In Indicator at right */}
        <div className="flex items-center gap-1 text-3xs text-zinc-500 font-bold opacity-60">
          <span>in</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}

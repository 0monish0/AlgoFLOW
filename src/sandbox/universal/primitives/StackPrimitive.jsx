/**
 * @fileoverview Stack Primitive (cells stacked vertically bottom-up, open-top ⊔ bracket).
 * No tall empty box. Height hugs content.
 * Top pointer tag touches top cell. Faint dashed ghost slots for capacity limit.
 * Push drops from above; Pop lifts top cell as floating token.
 */

import React, { useState } from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { Plus, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

export function StackPrimitive({ struct }) {
  const {
    selectedId,
    setSelectedId,
    dispatch,
    pan,
    zoom,
  } = useUniversalStore();

  const [toastMsg, setToastMsg] = useState(null);

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

  const handleNonTopClick = () => {
    setToastMsg('A stack only exposes its top. Pop first.');
    setTimeout(() => setToastMsg(null), 2000);
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
      {/* ── TOAST MESSAGE ────────────────────────────────────────── */}
      {toastMsg && (
        <div className="absolute bottom-full mb-3 whitespace-nowrap px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-200 text-3xs font-bold shadow-xl backdrop-blur-md z-40 animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* ── FLOATING MINI-TOOLBAR (Shown on Selection) ──────────── */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181b]/95 border border-[#3f3f46] shadow-2xl backdrop-blur-md z-30 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          <span className="text-3xs text-zinc-400 font-bold">
            {struct.varName || 's1'} (size {items.length}/{capacity})
          </span>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Push Button */}
          <button
            onClick={() => dispatch({ type: 'stack.push', id: struct.id })}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 text-emerald-400 text-3xs font-bold"
          >
            <ArrowDown size={10} />
            <span>Push</span>
          </button>

          {/* Pop Button */}
          <button
            onClick={() => dispatch({ type: 'stack.pop', id: struct.id })}
            disabled={items.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-amber-500/20 text-amber-300 text-3xs font-bold disabled:opacity-40"
          >
            <ArrowUp size={10} />
            <span>Pop</span>
          </button>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Delete */}
          <button
            onClick={() => dispatch({ type: 'structure.delete', id: struct.id })}
            className="p-1 rounded-full text-zinc-400 hover:text-red-400"
            title="Delete Stack"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* ── TOP POINTER TAG (Arrow touches top cell) ─────────────── */}
      {items.length > 0 && (
        <div className="flex items-center gap-1.5 mb-1 text-2xs font-bold text-emerald-400 animate-in fade-in">
          <span className="px-2 py-0.5 rounded-full bg-[#18181b] border border-[#3f3f46] text-white">
            top
          </span>
          <ArrowDown size={12} strokeWidth={2.5} />
        </div>
      )}

      {/* ── FAINT GHOST SLOTS (Capacity indicators) ──────────────── */}
      <div className="flex flex-col items-center">
        {Array.from({ length: ghostSlots }).map((_, i) => (
          <div
            key={`ghost-${i}`}
            className="w-14 h-9 border border-dashed border-zinc-700/30 -mb-[1px] rounded-sm pointer-events-none"
          />
        ))}
      </div>

      {/* ── OPEN-TOP ⊔ BRACKET CONTAINER HUGGING CONTENT ─────────── */}
      <div
        className={`flex flex-col-reverse items-center p-0.5 border-l-2 border-r-2 border-b-2 rounded-b-lg transition-all ${
          isSelected
            ? 'border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'border-[#3f3f46]'
        }`}
      >
        {items.map((val, idx) => {
          const isTop = idx === items.length - 1;

          return (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (!isTop) handleNonTopClick();
              }}
              className={`w-14 h-9.5 flex items-center justify-center font-bold text-sm transition-all -mb-[1px] ${
                isTop
                  ? 'border-[1.5px] border-[#10b981] bg-[#18181b] text-white shadow-sm cursor-pointer'
                  : 'border-[1.5px] border-[#3f3f46] bg-[#141416] text-zinc-400 cursor-not-allowed'
              }`}
            >
              {val}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="w-14 h-9 flex items-center justify-center text-3xs text-zinc-600">
            empty
          </div>
        )}
      </div>

      {/* Label under bottom */}
      <span className="text-3xs text-zinc-500 mt-1">{struct.varName || 's1'}</span>
    </div>
  );
}

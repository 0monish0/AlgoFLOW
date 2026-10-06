import React from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { isRef } from '../../../engine/heap';
import { ArrowLeft } from 'lucide-react';

export function StackRenderer({ struct }) {
  const { setDragSource, dispatch } = useUniversalStore();

  const handleDragStart = (e, val, idx) => {
    const isTop = idx === struct.items.length - 1;
    if (!isTop) {
      e.preventDefault();
      return;
    }
    setDragSource({ structId: struct.id, slotIndex: idx, value: val });
    e.dataTransfer.setData('text/plain', JSON.stringify({ structId: struct.id, slotIndex: idx }));
  };

  const handleDropChamber = (e) => {
    e.preventDefault();
    const sourceData = useUniversalStore.getState().dragSource;
    if (!sourceData) return;

    if (sourceData.structId !== struct.id) {
      dispatch({
        type: 'transfer',
        args: {
          sourceId: sourceData.structId,
          targetId: struct.id,
          slotIndex: sourceData.slotIndex,
        },
      });
    }
    setDragSource(null);
  };

  const isFull = struct.items.length >= struct.capacity;

  return (
    <div className="flex flex-col items-center gap-3 p-3 select-none">
      {/* Header Metrics */}
      <div className="flex items-center gap-4 text-2xs font-mono text-text-muted">
        <span>Size: <strong className="text-white">{struct.items.length}</strong></span>
        {struct.backing === 'array' && (
          <span>Capacity: <strong className={isFull ? 'text-amber-400' : 'text-accent'}>{struct.capacity}</strong></span>
        )}
        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-3xs font-bold text-gray-300">
          {struct.backing === 'array' ? 'Array-backed' : 'Linked-list-backed'}
        </span>
      </div>

      {/* Stack Physical Chamber (LIFO) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropChamber}
        className="w-40 min-h-[220px] max-h-[260px] border-b-4 border-x-4 border-white/20 rounded-b-2xl bg-black/40 p-2 flex flex-col-reverse items-center gap-1.5 overflow-y-auto"
        title="Drop elements here to push into stack"
      >
        {struct.items.length === 0 ? (
          <div className="my-auto text-3xs font-mono text-text-muted text-center opacity-60">
            Empty Stack<br />(Drop or push items)
          </div>
        ) : (
          struct.items.map((val, idx) => {
            const isTop = idx === struct.items.length - 1;
            const displayVal = isRef(val) ? `Ref(${val.$ref.slice(0, 5)})` : String(val);

            return (
              <div
                key={idx}
                draggable={isTop}
                onDragStart={(e) => handleDragStart(e, val, idx)}
                className={`relative w-full py-2 px-3 rounded-lg border-2 flex items-center justify-between text-xs font-mono font-bold transition-all ${
                  isTop
                    ? 'border-accent bg-accent/15 text-white shadow-md ring-1 ring-accent/30 cursor-grab hover:scale-102 active:scale-95'
                    : 'border-white/10 bg-surface/80 text-text-muted cursor-not-allowed opacity-80'
                } ${isRef(val) ? 'border-dashed border-cyan-400 bg-cyan-950/30 text-cyan-300' : ''}`}
                title={isTop ? 'TOP of Stack (Draggable to transfer)' : 'LIFO rule: Internal stack elements cannot be extracted'}
              >
                <span className="text-3xs text-text-muted">[{idx}]</span>
                <span>{displayVal}</span>
                {isTop ? (
                  <span className="flex items-center gap-0.5 text-3xs font-extrabold text-accent">
                    <ArrowLeft size={10} /> TOP
                  </span>
                ) : (
                  <span className="text-3xs text-white/20">locked</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

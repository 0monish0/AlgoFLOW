import React from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { isRef } from '../../../engine/heap';
import { ArrowDown, AlertTriangle } from 'lucide-react';

export function QueueRenderer({ struct }) {
  const { setDragSource, dispatch } = useUniversalStore();

  const handleDragStart = (e, val, idx) => {
    // Only front or (in deque) rear can be dragged
    const isFront = struct.queueType === 'circular' || struct.queueType === 'simple'
      ? idx === struct.frontIndex
      : idx === 0;
    const isRear = struct.queueType === 'deque' && idx === struct.items.length - 1;

    if (!isFront && !isRear && struct.queueType !== 'priority') {
      e.preventDefault();
      return;
    }

    setDragSource({ structId: struct.id, slotIndex: idx, value: val });
    e.dataTransfer.setData('text/plain', JSON.stringify({ structId: struct.id, slotIndex: idx }));
  };

  const handleDropQueue = (e) => {
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

  return (
    <div className="flex flex-col items-center gap-3 p-3 select-none">
      {/* Metrics Header */}
      <div className="flex items-center gap-4 text-2xs font-mono text-text-muted">
        <span>Size: <strong className="text-white">{struct.size}</strong></span>
        <span>Capacity: <strong className="text-accent">{struct.capacity}</strong></span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-3xs font-bold text-gray-300 capitalize">
          {struct.queueType} Queue {struct.queueType === 'priority' ? `(${struct.minMax}-heap)` : ''}
        </span>
      </div>

      {/* False Full Warning Banner for Simple Queue */}
      {struct.falseFullWarning && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-3xs font-mono font-bold animate-in fade-in">
          <AlertTriangle size={11} className="shrink-0" />
          <span>False-Full: {struct.frontIndex} wasted slot(s) at front. Switch to Circular Queue!</span>
        </div>
      )}

      {/* Queue Body Container */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropQueue}
        className="flex items-center gap-2 overflow-x-auto p-3 bg-black/40 border border-white/10 rounded-2xl max-w-full"
      >
        {struct.items.length === 0 ? (
          <div className="py-4 px-6 text-3xs font-mono text-text-muted text-center opacity-60">
            Empty Queue (Drop or enqueue items)
          </div>
        ) : (
          struct.items.map((val, idx) => {
            const isEmpty = val === null || val === undefined;
            const isFront = struct.queueType === 'circular' || struct.queueType === 'simple'
              ? idx === struct.frontIndex
              : idx === 0;
            const isRear = struct.queueType === 'circular' || struct.queueType === 'simple'
              ? idx === struct.rearIndex
              : idx === struct.items.length - 1;

            const displayVal = isRef(val) ? `Ref(${val.$ref.slice(0, 5)})` : String(val ?? '');

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                {/* Pointer tags */}
                <div className="h-4 flex items-center gap-1 text-3xs font-mono font-extrabold">
                  {isFront && <span className="text-cyan-400">FRONT</span>}
                  {isRear && <span className="text-accent">REAR</span>}
                </div>

                {/* Slot Box */}
                <div
                  draggable={!isEmpty && (isFront || struct.queueType === 'priority')}
                  onDragStart={(e) => handleDragStart(e, val, idx)}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                    isEmpty
                      ? 'border-dashed border-white/15 bg-black/20 text-white/20'
                      : isFront
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400/30 cursor-grab hover:scale-105 active:scale-95'
                      : 'border-accent/60 bg-accent/10 text-white'
                  }`}
                  title={isFront ? 'FRONT (Draggable to dequeue)' : `Slot [${idx}]`}
                >
                  {isEmpty ? '—' : displayVal}
                </div>

                <span className="text-3xs font-mono text-text-muted">[{idx}]</span>
              </div>
            );
          })
        )}
      </div>

      {/* Priority Queue Dual View: Binary Heap Mini Tree */}
      {struct.queueType === 'priority' && struct.items.length > 0 && (
        <div className="flex flex-col items-center gap-1 pt-1 border-t border-white/10 w-full">
          <span className="text-3xs font-mono text-text-muted font-bold">Binary Heap Tree Structure</span>
          <div className="flex items-center gap-3 text-2xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-accent/20 border border-accent/40 text-white font-bold">
              Root (Next out): {struct.items[0]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

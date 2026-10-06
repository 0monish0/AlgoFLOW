import React from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { isRef } from '../../../engine/heap';

export function ArrayRenderer({ struct }) {
  const { setDragSource, dispatch } = useUniversalStore();

  const handleDragStart = (e, val, idx) => {
    if (val === null || val === undefined) return;
    setDragSource({ structId: struct.id, slotIndex: idx, value: val });
    e.dataTransfer.setData('text/plain', JSON.stringify({ structId: struct.id, slotIndex: idx }));
  };

  const handleDropSlot = (e, targetIdx) => {
    e.preventDefault();
    const sourceData = useUniversalStore.getState().dragSource;
    if (!sourceData) return;

    if (sourceData.structId === struct.id) {
      // Internal swap
      dispatch({
        type: 'array.swap',
        structId: struct.id,
        args: { i: sourceData.slotIndex, j: targetIdx },
      });
    } else {
      // Cross-structure transfer
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
      {/* Array Header Metrics */}
      <div className="flex items-center gap-4 text-2xs font-mono text-text-muted">
        <span>Length: <strong className="text-white">{struct.length}</strong></span>
        <span>Capacity: <strong className="text-accent">{struct.capacity}</strong></span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-3xs font-bold text-gray-300">
          {struct.dynamic ? 'Dynamic (Auto-grow)' : 'Static (Fixed)'}
        </span>
      </div>

      {/* Contiguous Indexed Memory Slots */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-surface/80 border border-white/10 rounded-xl max-w-full">
        {struct.items.map((val, idx) => {
          const isEmpty = val === null || val === undefined;
          const displayVal = isRef(val) ? `Ref(${val.$ref.slice(0, 5)})` : String(val ?? '');

          return (
            <div
              key={idx}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropSlot(e, idx)}
              className="flex flex-col items-center gap-1 group"
            >
              {/* Index Label */}
              <span className="text-3xs font-mono text-text-muted">[{idx}]</span>

              {/* Memory Box */}
              <div
                draggable={!isEmpty}
                onDragStart={(e) => handleDragStart(e, val, idx)}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                  isEmpty
                    ? 'border-dashed border-white/15 bg-black/30 text-white/20'
                    : 'border-accent bg-accent/10 text-white hover:border-emerald-400 hover:scale-105 active:scale-95 cursor-grab'
                } ${isRef(val) ? 'border-dashed border-cyan-400 bg-cyan-950/30 text-cyan-300' : ''}`}
                title={isEmpty ? `Empty slot [${idx}]` : `Element [${idx}] = ${displayVal} (Drag to transfer)`}
              >
                {isEmpty ? '—' : displayVal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

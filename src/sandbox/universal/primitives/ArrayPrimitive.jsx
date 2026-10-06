/**
 * @fileoverview Ruler-like Array Primitive (52px contiguous square cells, shared borders).
 * No outer box, no capacity/length chips unless selected in mini-toolbar.
 * Small index numbers under cells. Tiny muted name above left edge.
 * Hover border -> small '+' to insert. Caret index pointers (▲ i).
 */

import React, { useState } from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const CELL_SIZE = 52;

export function ArrayPrimitive({ struct }) {
  const {
    selectedId,
    setSelectedId,
    dispatch,
    pan,
    zoom,
  } = useUniversalStore();

  const [editingIndex, setEditingIndex] = useState(null);
  const [cellVal, setCellVal] = useState('');
  const [hoveredDivider, setHoveredDivider] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(struct.varName || 'arr1');

  const isSelected = selectedId === struct.id;
  const items = struct.items || [];
  const capacity = struct.capacity || 8;
  const isDynamic = Boolean(struct.isDynamic);

  // For static arrays, show exactly `capacity` cells
  // For dynamic arrays, show used items plus one extra faint '+' cell
  const displayCount = isDynamic ? Math.min(items.length + 1, capacity) : capacity;
  const cells = [];
  for (let i = 0; i < displayCount; i++) {
    cells.push({ index: i, value: items[i] !== undefined ? items[i] : null });
  }

  const filledCount = items.filter((x) => x !== null && x !== undefined).length;

  const handleDrag = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
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

  const handleInsertAt = (idx) => {
    dispatch({
      type: 'array.insert',
      id: struct.id,
      index: idx,
      value: 10 + idx * 10,
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${struct.position.x}px`,
        top: `${struct.position.y}px`,
      }}
      onMouseDown={handleDrag}
      className="flex flex-col items-start font-mono select-none z-10"
    >
      {/* ── TINY MUTED NAME ABOVE LEFT EDGE ──────────────────────── */}
      <div className="flex items-center gap-1.5 mb-1 px-1 text-3xs text-zinc-500 font-bold">
        {isEditingName ? (
          <input
            type="text"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={() => {
              setIsEditingName(false);
              struct.varName = nameVal.trim() || struct.varName;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingName(false);
                struct.varName = nameVal.trim() || struct.varName;
              }
            }}
            autoFocus
            className="w-16 bg-transparent text-white outline-none border-b border-accent"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
            }}
            className="cursor-pointer hover:text-white transition-colors"
            title="Double-click to rename"
          >
            {struct.varName || 'arr1'}
          </span>
        )}
      </div>

      {/* ── FLOATING MINI-TOOLBAR (Shown on Selection) ──────────── */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-0 mb-6 flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b]/95 border border-[#3f3f46] shadow-2xl backdrop-blur-md z-30 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          {/* Readout */}
          <span className="text-3xs text-zinc-400 font-bold">
            length {filledCount} / capacity {capacity}
          </span>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Static | Dynamic toggle */}
          <button
            onClick={() => {
              struct.isDynamic = !struct.isDynamic;
              setSelectedId(struct.id); // re-render
            }}
            className={`px-2 py-0.5 rounded-full text-3xs font-bold transition-all ${
              isDynamic ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isDynamic ? 'Dynamic' : 'Static'}
          </button>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Delete Array */}
          <button
            onClick={() => dispatch({ type: 'structure.delete', id: struct.id })}
            className="p-1 rounded-full text-zinc-400 hover:text-red-400"
            title="Delete Array"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* ── CONTIGUOUS RULER CELLS ───────────────────────────────── */}
      <div className="flex items-center cursor-grab active:cursor-grabbing">
        {cells.map((cell, idx) => {
          const isFilled = cell.value !== null && cell.value !== undefined;
          const isLastDynamicPlus = isDynamic && idx === items.length;

          return (
            <div key={idx} className="relative flex flex-col items-center">
              {/* Insert '+' divider hover trigger */}
              {idx > 0 && (
                <div
                  onMouseEnter={() => setHoveredDivider(idx)}
                  onMouseLeave={() => setHoveredDivider(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsertAt(idx);
                  }}
                  className="absolute -left-2 top-0 bottom-0 w-4 z-20 flex items-center justify-center cursor-pointer group"
                >
                  {hoveredDivider === idx && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-md animate-in fade-in scale-110">
                      <Plus size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
              )}

              {/* Cell Box */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(struct.id);
                  if (isLastDynamicPlus) {
                    handleInsertAt(idx);
                  } else {
                    setEditingIndex(idx);
                    setCellVal(isFilled ? String(cell.value) : '10');
                  }
                }}
                className={`w-[52px] h-[52px] flex items-center justify-center transition-all ${
                  idx === 0 ? 'rounded-l-lg' : ''
                } ${idx === cells.length - 1 ? 'rounded-r-lg' : ''} ${
                  idx > 0 ? '-ml-[1px]' : ''
                } ${
                  isLastDynamicPlus
                    ? 'border border-dashed border-zinc-600/60 bg-transparent text-zinc-500 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer'
                    : isFilled
                    ? 'border-[1.5px] border-[#3f3f46] bg-[#18181b] text-white hover:border-[#10b981]'
                    : 'border border-dashed border-zinc-700/60 bg-[#141416]/50 text-zinc-600'
                } ${isSelected ? 'shadow-[0_0_0_2px_rgba(16,185,129,0.2)]' : ''}`}
              >
                {editingIndex === idx ? (
                  <input
                    type="text"
                    value={cellVal}
                    onChange={(e) => setCellVal(e.target.value)}
                    onBlur={() => {
                      setEditingIndex(null);
                      dispatch({
                        type: 'array.set',
                        id: struct.id,
                        index: idx,
                        value: cellVal.trim() ? Number(cellVal) || cellVal : null,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingIndex(null);
                        dispatch({
                          type: 'array.set',
                          id: struct.id,
                          index: idx,
                          value: cellVal.trim() ? Number(cellVal) || cellVal : null,
                        });
                      }
                    }}
                    autoFocus
                    className="w-8 bg-transparent text-center text-sm font-bold text-white outline-none"
                  />
                ) : isLastDynamicPlus ? (
                  <Plus size={14} />
                ) : (
                  <span className="text-sm font-bold">{cell.value !== null ? cell.value : ''}</span>
                )}
              </div>

              {/* Index Number under Cell */}
              <span className="text-3xs text-zinc-500 mt-1 select-none">{idx}</span>

              {/* Caret Pointer (▲ i) */}
              {struct.pointers?.some((p) => p.index === idx) && (
                <div className="absolute top-full mt-4 flex flex-col items-center text-emerald-400 font-bold text-3xs animate-in fade-in">
                  <span>▲</span>
                  <span>{struct.pointers.find((p) => p.index === idx)?.name || 'i'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

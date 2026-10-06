/**
 * @fileoverview Free-form element container on the infinite canvas.
 * No heavy titled frames, no config badges, no three-dot menus.
 * Pure draggable placement with a minimal inline name chip where applicable.
 */

import React, { useRef, useState } from 'react';
import { useUniversalStore } from './useUniversalStore';
import { ArrayRenderer } from './renderers/ArrayRenderer';
import { StackRenderer } from './renderers/StackRenderer';
import { QueueRenderer } from './renderers/QueueRenderer';
import { LinkedListRenderer } from './renderers/LinkedListRenderer';
import { TreeRenderer } from './renderers/TreeRenderer';

export function StructureFrame({ struct }) {
  const {
    activeStructureId,
    setActiveStructureId,
    elementPositions,
    setElementPosition,
    selectedIds,
    setSelectedIds,
    pan,
    zoom,
  } = useUniversalStore();

  const isSelected = selectedIds.has(struct.id) || activeStructureId === struct.id;
  const pos = elementPositions[struct.id] || { x: 120, y: 120 };

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(struct.name);

  const handlePointerDown = (e) => {
    // Ignore clicks on inner inputs or buttons
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

    setActiveStructureId(struct.id);
    setSelectedIds(new Set([struct.id]));

    // Start dragging element
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...pos };

    const handlePointerMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      setElementPosition(struct.id, {
        x: initialPos.x + dx,
        y: initialPos.y + dy,
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  };

  const renderContent = () => {
    switch (struct.type) {
      case 'array':
        return <ArrayRenderer struct={struct} />;
      case 'stack':
        return <StackRenderer struct={struct} />;
      case 'queue':
        return <QueueRenderer struct={struct} />;
      case 'linkedlist':
        return <LinkedListRenderer struct={struct} />;
      case 'tree':
        return <TreeRenderer struct={struct} />;
      default:
        return null;
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
      className={`group flex flex-col items-start gap-1 cursor-grab active:cursor-grabbing font-mono select-none ${
        isSelected ? 'z-20' : 'z-10'
      }`}
    >
      {/* Minimal Inline Name Chip (No heavy frame header) */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-3xs font-bold text-text-muted hover:border-white/25 transition-all">
        {isEditingName ? (
          <input
            type="text"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={() => {
              setIsEditingName(false);
              struct.name = nameVal.trim() || struct.name;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingName(false);
                struct.name = nameVal.trim() || struct.name;
              }
            }}
            autoFocus
            className="w-16 px-1 py-0 bg-transparent text-white outline-none border-b border-accent"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditingName(true)}
            className="cursor-pointer hover:text-white"
            title="Double-click to rename"
          >
            {struct.name}
          </span>
        )}
      </div>

      {/* Primitive Content with selection halo */}
      <div
        className={`rounded-xl transition-all ${
          isSelected
            ? 'ring-2 ring-accent/60 shadow-lg shadow-accent/10'
            : 'ring-1 ring-white/5 hover:ring-white/20'
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
}

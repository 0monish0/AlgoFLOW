/**
 * @fileoverview 56px Circle Linked Node Primitive.
 * Singly (single ring) vs Doubly (double ring).
 * Rim ports: next (right, emerald) and prev (left, amber).
 * Floating mini-toolbar on selection: [ value edit ] [ Singly | Doubly ] [ delete ].
 */

import React, { useState, useRef } from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { Trash2, Edit2, AlertCircle } from 'lucide-react';

export function LinkedNodePrimitive({ node }) {
  const {
    nodes,
    selectedId,
    setSelectedId,
    hoveredTargetId,
    setHoveredTargetId,
    activeWire,
    setActiveWire,
    activePointerDrag,
    dispatch,
    pan,
    zoom,
    pointers,
  } = useUniversalStore();

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [valInput, setValInput] = useState(String(node.value));
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedId === node.id;
  const isCandidateTarget = hoveredTargetId === node.id && activeWire?.sourceId !== node.id;
  const isDoubly = node.nodeType === 'doubly';

  // Check if connected
  const isNextConnected = Boolean(node.next && node.next !== 'NULL');
  const isPrevConnected = Boolean(isDoubly && node.prev && node.prev !== 'NULL');

  // Doubly mismatch warning
  let hasDoublyMismatch = false;
  let mismatchMessage = '';
  if (isDoubly && isNextConnected && nodes[node.next]) {
    const targetNode = nodes[node.next];
    if (targetNode.prev !== node.id) {
      hasDoublyMismatch = true;
      mismatchMessage = `${targetNode.varName || 'Target'}.prev does not point back to this node`;
    }
  }

  // Check reachability from any pointer tag (e.g. head, curr)
  const isReachable = Object.values(pointers || {}).some(
    (p) => p.targetId === node.id
  ) || Object.values(nodes).some((other) => other.next === node.id || other.prev === node.id);

  // Dragging node body
  const handleBodyMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    e.stopPropagation();

    setSelectedId(node.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...node.position };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      dispatch({
        type: 'node.move',
        id: node.id,
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

  // Dragging from a rim port to create rubber-band arrow
  const handlePortMouseDown = (e, port) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const startCanvasX = (e.clientX - pan.x) / zoom;
    const startCanvasY = (e.clientY - pan.y) / zoom;

    setActiveWire({
      sourceId: node.id,
      port,
      cursorX: startCanvasX,
      cursorY: startCanvasY,
    });

    const handleMouseMove = (moveEvent) => {
      const curX = (moveEvent.clientX - pan.x) / zoom;
      const curY = (moveEvent.clientY - pan.y) / zoom;
      setActiveWire({
        sourceId: node.id,
        port,
        cursorX: curX,
        cursorY: curY,
      });

      // Find if cursor is over another node (candidate target)
      let foundTarget = null;
      Object.values(nodes).forEach((n) => {
        if (n.id === node.id && port === 'prev') return; // no self-loop on prev
        const cx = n.position.x + 28;
        const cy = n.position.y + 28;
        if (Math.hypot(curX - cx, curY - cy) < 36) {
          foundTarget = n.id;
        }
      });
      setHoveredTargetId(foundTarget);
    };

    const handleMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const endX = (upEvent.clientX - pan.x) / zoom;
      const endY = (upEvent.clientY - pan.y) / zoom;

      let targetId = null;
      Object.values(nodes).forEach((n) => {
        const cx = n.position.x + 28;
        const cy = n.position.y + 28;
        if (Math.hypot(endX - cx, endY - cy) < 40) {
          targetId = n.id;
        }
      });

      if (targetId) {
        dispatch({
          type: 'node.connect',
          sourceId: node.id,
          port,
          targetId,
        });
      }

      setActiveWire(null);
      setHoveredTargetId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: '56px',
        height: '56px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleBodyMouseDown}
      className={`relative select-none ${
        !isReachable ? 'opacity-80' : 'opacity-100'
      }`}
    >
      {/* ── FLOATING MINI-TOOLBAR (Shown on Selection) ──────────── */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[#18181b]/95 border border-[#3f3f46] shadow-2xl backdrop-blur-md z-30 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          {/* Inline Value Edit */}
          <button
            onClick={() => setIsEditingValue(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-white/10 text-3xs font-mono font-bold text-text-muted hover:text-white transition-colors"
            title="Edit Value"
          >
            <Edit2 size={9} />
            <span>{node.value}</span>
          </button>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Singly / Doubly Toggle */}
          <button
            onClick={() =>
              dispatch({
                type: 'node.setType',
                id: node.id,
                nodeType: isDoubly ? 'singly' : 'doubly',
              })
            }
            className={`px-2 py-0.5 rounded-full text-3xs font-mono font-bold transition-all ${
              isDoubly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-text-muted hover:text-white hover:bg-white/10'
            }`}
            title="Toggle between Singly and Doubly node"
          >
            {isDoubly ? 'Doubly' : 'Singly'}
          </button>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Delete Node */}
          <button
            onClick={() => dispatch({ type: 'node.delete', id: node.id })}
            className="p-1 rounded-full text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete Node"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* ── CORE 56PX CIRCLE ────────────────────────────────────── */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center font-mono cursor-grab active:cursor-grabbing transition-all duration-150 ${
          isCandidateTarget
            ? 'border-2 border-[#10b981] shadow-[0_0_0_6px_rgba(16,185,129,0.25)] scale-105'
            : isSelected
            ? 'border-[1.5px] border-[#10b981] shadow-[0_0_0_4px_rgba(16,185,129,0.15)] bg-[#18181b]'
            : 'border-[1.5px] border-[#3f3f46] hover:border-[#10b981] hover:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] bg-[#18181b]'
        }`}
        style={
          isDoubly
            ? {
                boxShadow: isSelected
                  ? '0 0 0 3.5px #0a0a0b, 0 0 0 5px #10b981, 0 0 0 8px rgba(16,185,129,0.15)'
                  : '0 0 0 3.5px #0a0a0b, 0 0 0 5px #3f3f46',
              }
            : undefined
        }
      >
        {isEditingValue ? (
          <input
            type="text"
            value={valInput}
            onChange={(e) => setValInput(e.target.value)}
            onBlur={() => {
              setIsEditingValue(false);
              dispatch({
                type: 'node.setValue',
                id: node.id,
                value: valInput.trim() || node.value,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingValue(false);
                dispatch({
                  type: 'node.setValue',
                  id: node.id,
                  value: valInput.trim() || node.value,
                });
              }
            }}
            autoFocus
            className="w-10 bg-transparent text-center text-sm font-bold text-white outline-none border-b border-accent"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingValue(true);
            }}
            className="text-sm font-bold text-[#e5e7eb] select-none cursor-pointer"
            title="Double-click to edit value"
          >
            {node.value}
          </span>
        )}
      </div>

      {/* ── RIGHT PORT: NEXT (Emerald) ─────────────────────────── */}
      <div
        onMouseDown={(e) => handlePortMouseDown(e, 'next')}
        className={`absolute -right-1 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-crosshair z-20 transition-all ${
          isNextConnected ? 'w-2 h-2' : 'w-2 h-2 hover:scale-150'
        }`}
        title="next port: drag to connect"
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isNextConnected
              ? 'w-2 h-2 bg-[#10b981] shadow-[0_0_6px_#10b981]'
              : 'w-2 h-2 border border-[#10b981] bg-transparent hover:bg-[#10b981] hover:shadow-[0_0_8px_#10b981]'
          }`}
        />
      </div>

      {/* ── LEFT PORT: PREV (Amber, Doubly only) ─────────────────── */}
      {isDoubly && (
        <div
          onMouseDown={(e) => handlePortMouseDown(e, 'prev')}
          className={`absolute -left-1 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-crosshair z-20 transition-all ${
            isPrevConnected ? 'w-2 h-2' : 'w-2 h-2 hover:scale-150'
          }`}
          title="prev port: drag to connect"
        >
          <div
            className={`rounded-full transition-all duration-150 ${
              isPrevConnected
                ? 'w-2 h-2 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]'
                : 'w-2 h-2 border border-[#f59e0b] bg-transparent hover:bg-[#f59e0b] hover:shadow-[0_0_8px_#f59e0b]'
            }`}
          />
        </div>
      )}

      {/* ── DOUBLY MISMATCH WARNING DOT ─────────────────────────── */}
      {hasDoublyMismatch && (
        <div
          className="absolute -top-1 -right-1 z-20 cursor-help"
          title={mismatchMessage}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </div>
      )}

      {/* ── UNREACHABLE SUBTLE TAG ──────────────────────────────── */}
      {!isReachable && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-4xs font-mono text-zinc-500 tracking-wider uppercase pointer-events-none">
          unreachable
        </div>
      )}
    </div>
  );
}

/**
 * @fileoverview Textbook Pointer Tag Primitive (head, tail, curr, custom).
 * Rounded pill tag with line + arrowhead pointing directly to target node rim.
 * Auto-fanning for multiple tags on the same node.
 * Mini-toolbar: [ -> next ] [ <- prev ] [ NULL ] [ delete ].
 */

import React, { useState } from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { ArrowRight, ArrowLeft, Trash2, Slash, ChevronRight } from 'lucide-react';

export function PointerTag({ pointer }) {
  const {
    pointers,
    nodes,
    selectedId,
    setSelectedId,
    hoveredTargetId,
    setHoveredTargetId,
    activePointerDrag,
    setActivePointerDrag,
    dispatch,
    pan,
    zoom,
  } = useUniversalStore();

  const [shake, setShake] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const isSelected = selectedId === pointer.id;
  const targetNode = pointer.targetId ? nodes[pointer.targetId] : null;

  // Determine tag coordinates
  let tagX = pointer.position?.x ?? 200;
  let tagY = pointer.position?.y ?? 150;
  let arrowAngle = 90; // pointing down

  if (targetNode) {
    // Find all pointers on the same node to compute non-overlapping fan offsets
    const siblings = Object.values(pointers).filter((p) => p.targetId === targetNode.id);
    const sibIndex = siblings.findIndex((p) => p.id === pointer.id);

    const name = pointer.name.toLowerCase();
    if (name === 'head') {
      tagX = targetNode.position.x + 28;
      tagY = targetNode.position.y - 30;
      arrowAngle = 90;
    } else if (name === 'curr') {
      tagX = targetNode.position.x + 28;
      tagY = targetNode.position.y + 80;
      arrowAngle = 270;
    } else if (name === 'tail') {
      tagX = targetNode.position.x + 64;
      tagY = targetNode.position.y - 18;
      arrowAngle = 135;
    } else {
      // Stack subsequent pointers neatly
      const offsetMultiplier = Math.floor(sibIndex / 2);
      const isTop = sibIndex % 2 === 0;
      tagX = targetNode.position.x + 28 + (sibIndex > 2 ? 35 : 0);
      tagY = isTop
        ? targetNode.position.y - 30 - offsetMultiplier * 24
        : targetNode.position.y + 80 + offsetMultiplier * 24;
      arrowAngle = isTop ? 90 : 270;
    }
  }

  // Handle drag to reassign pointer tag
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    e.stopPropagation();

    setSelectedId(pointer.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialTagX = tagX;
    const initialTagY = tagY;

    setActivePointerDrag({ pointerId: pointer.id });

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      const curX = initialTagX + dx;
      const curY = initialTagY + dy;

      dispatch({
        type: 'pointer.move',
        id: pointer.id,
        pos: { x: curX, y: curY },
      });

      // Find hovered node to snap to
      let foundNode = null;
      Object.values(nodes).forEach((n) => {
        const cx = n.position.x + 28;
        const cy = n.position.y + 28;
        if (Math.hypot(curX - cx, curY - cy) < 45) {
          foundNode = n.id;
        }
      });
      setHoveredTargetId(foundNode);
    };

    const handleMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const endX = (upEvent.clientX - pan.x) / zoom;
      const endY = (upEvent.clientY - pan.y) / zoom;

      let targetNodeId = null;
      Object.values(nodes).forEach((n) => {
        const cx = n.position.x + 28;
        const cy = n.position.y + 28;
        if (Math.hypot(endX - cx, endY - cy) < 45) {
          targetNodeId = n.id;
        }
      });

      if (targetNodeId) {
        dispatch({
          type: 'pointer.assign',
          id: pointer.id,
          targetId: targetNodeId,
        });
      }

      setActivePointerDrag(null);
      setHoveredTargetId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  const handleAdvance = (port = 'next') => {
    const res = dispatch({
      type: 'pointer.advance',
      id: pointer.id,
      port,
    });
    if (res?.error) {
      setShake(true);
      setToastMsg(res.message);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const isDangling = pointer.targetId && !nodes[pointer.targetId];

  return (
    <div
      style={{
        position: 'absolute',
        left: `${tagX}px`,
        top: `${tagY}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
      className={`z-20 select-none font-mono ${shake ? 'animate-bounce' : ''}`}
    >
      {/* ── TOAST NOTIFICATION ───────────────────────────────────── */}
      {toastMsg && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-red-950/90 border border-red-500/50 text-red-200 text-3xs font-bold shadow-xl backdrop-blur-md z-40 animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* ── MINI-TOOLBAR ON SELECTION ────────────────────────────── */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[#18181b]/95 border border-[#3f3f46] shadow-2xl backdrop-blur-md z-30 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          {/* -> next */}
          <button
            onClick={() => handleAdvance('next')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 text-emerald-400 text-3xs font-bold transition-colors"
            title="Advance: curr = curr.next"
          >
            <span>-&gt; next</span>
          </button>

          {/* <- prev (if target is doubly) */}
          {targetNode?.nodeType === 'doubly' && (
            <button
              onClick={() => handleAdvance('prev')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-amber-500/20 text-amber-300 text-3xs font-bold transition-colors"
              title="Step back: curr = curr.prev"
            >
              <span>&lt;- prev</span>
            </button>
          )}

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Set NULL */}
          <button
            onClick={() =>
              dispatch({
                type: 'pointer.assign',
                id: pointer.id,
                targetId: 'NULL',
              })
            }
            className="px-2 py-0.5 rounded-full text-3xs text-text-muted hover:text-white hover:bg-white/10 font-bold"
            title="Set to NULL"
          >
            ∅ NULL
          </button>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Delete Pointer */}
          <button
            onClick={() => dispatch({ type: 'pointer.delete', id: pointer.id })}
            className="p-1 rounded-full text-text-muted hover:text-red-400 hover:bg-red-500/10"
            title="Delete pointer"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* ── POINTER TAG PILL ─────────────────────────────────────── */}
      <div
        className={`group flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold shadow-md cursor-grab active:cursor-grabbing transition-all ${
          isDangling
            ? 'bg-red-950/80 border border-red-500/60 text-red-300 shadow-red-950/50'
            : isSelected
            ? 'bg-[#18181b] border-2 border-[#10b981] text-white shadow-[0_0_0_4px_rgba(16,185,129,0.15)]'
            : pointer.isExplicitNull
            ? 'bg-[#18181b] border border-dashed border-zinc-500 text-zinc-400'
            : !targetNode
            ? 'bg-[#18181b] border border-dashed border-white/20 text-text-muted'
            : 'bg-[#18181b] border border-[#3f3f46] hover:border-[#10b981] text-[#e5e7eb]'
        }`}
      >
        <span>{pointer.name}</span>
        {pointer.isExplicitNull && (
          <span className="text-3xs text-zinc-500 font-bold">∅</span>
        )}
        {!targetNode && !pointer.isExplicitNull && (
          <span className="text-3xs text-zinc-500">?</span>
        )}
      </div>

      {/* ── ARROW TO TARGET NODE RIM ─────────────────────────────── */}
      {targetNode && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-0.5 pointer-events-none transition-all ${
            arrowAngle === 90
              ? 'top-full h-3.5 bg-[#10b981]'
              : 'bottom-full h-3.5 bg-[#10b981]'
          }`}
        >
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent ${
              arrowAngle === 90
                ? 'bottom-0 border-t-[5px] border-t-[#10b981]'
                : 'top-0 border-b-[5px] border-b-[#10b981]'
            }`}
          />
        </div>
      )}
    </div>
  );
}

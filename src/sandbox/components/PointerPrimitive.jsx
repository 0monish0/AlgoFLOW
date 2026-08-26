import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { X, ArrowRight } from 'lucide-react';
import { NODE_RADIUS } from './NodePrimitive';

export const PointerPrimitive = ({ pointer, isHighlighted = false }) => {
  const {
    nodes,
    updatePointerPosition,
    updatePointerLabel,
    setPointerTarget,
    deleteFreePointer,
    setActiveWire,
    connectingSource,
    setConnectingSource,
    activePointerId,
    setActivePointerId,
  } = useSandboxStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, ptrX: 0, ptrY: 0 });

  const isHead = pointer.label.toLowerCase() === 'head';
  const isConnectingFromSelf = connectingSource && connectingSource.sourceId === pointer.id;
  const isControllerActive = activePointerId === pointer.id;

  // If pointer is targeting a live node and is NOT head, it is rendered attached under the node
  const isTargetingLiveNode = Boolean(pointer.targetId && nodes[pointer.targetId]);
  if (isTargetingLiveNode && !isHead) {
    return null;
  }

  // Drag Pointer Origin Point
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.closest('.pointer-handle') || e.target.closest('button')) {
      return;
    }
    e.stopPropagation();

    setActivePointerId(pointer.id);
    setIsDragging(true);
    const { zoom } = useSandboxStore.getState();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ptrX: pointer.position.x,
      ptrY: pointer.position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - dragStartRef.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / zoom;
      updatePointerPosition(pointer.id, {
        x: Math.round(dragStartRef.current.ptrX + dx),
        y: Math.round(dragStartRef.current.ptrY + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  // Drag Arrowhead to Node or NULL
  const handleArrowDragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = pointer.position.x + 85;
    const startY = pointer.position.y + 17;

    const canvasEl = document.getElementById('sandbox-canvas-viewport');
    const canvasRect = canvasEl ? canvasEl.getBoundingClientRect() : { left: 0, top: 0 };

    setActiveWire({
      sourceId: pointer.id,
      sourceType: 'pointer',
      startX,
      startY,
      cursorX: startX,
      cursorY: startY,
    });

    let hasDragged = false;

    const handlePointerMove = (moveEvent) => {
      hasDragged = true;
      const currentZoom = useSandboxStore.getState().zoom;
      const currentPan = useSandboxStore.getState().pan;
      const canvasX = (moveEvent.clientX - canvasRect.left - currentPan.x) / currentZoom;
      const canvasY = (moveEvent.clientY - canvasRect.top - currentPan.y) / currentZoom;

      setActiveWire({
        sourceId: pointer.id,
        sourceType: 'pointer',
        startX,
        startY,
        cursorX: canvasX,
        cursorY: canvasY,
      });
    };

    const handlePointerUp = (upEvent) => {
      window.removeEventListener('mousemove', handlePointerMove);

      if (!hasDragged) {
        setActiveWire(null);
        if (isConnectingFromSelf) {
          setConnectingSource(null);
        } else {
          setConnectingSource({ sourceId: pointer.id, sourceType: 'pointer' });
        }
        return;
      }

      const currentZoom = useSandboxStore.getState().zoom;
      const currentPan = useSandboxStore.getState().pan;
      const dropCanvasX = (upEvent.clientX - canvasRect.left - currentPan.x) / currentZoom;
      const dropCanvasY = (upEvent.clientY - canvasRect.top - currentPan.y) / currentZoom;

      const { nodes: allNodes, nullTokens: allNulls } = useSandboxStore.getState();

      // Check drop near any NULL token
      let matchedNull = false;
      Object.values(allNulls || {}).forEach((nullTok) => {
        if (!nullTok.position) return;
        const dist = Math.hypot(dropCanvasX - (nullTok.position.x + 35), dropCanvasY - (nullTok.position.y + 18));
        if (dist < 65) {
          setPointerTarget(pointer.id, 'NULL');
          matchedNull = true;
        }
      });
      if (matchedNull) {
        setActiveWire(null);
        return;
      }

      // Check drop near any circular node
      let matchedNode = false;
      Object.values(allNodes || {}).forEach((targetNode) => {
        if (!targetNode.position) return;
        const dist = Math.hypot(
          dropCanvasX - (targetNode.position.x + NODE_RADIUS),
          dropCanvasY - (targetNode.position.y + NODE_RADIUS)
        );
        if (dist < 60) {
          setPointerTarget(pointer.id, targetNode.id);
          matchedNode = true;
        }
      });

      if (!matchedNode) {
        setPointerTarget(pointer.id, null);
      }

      setActiveWire(null);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp, { once: true });
  };

  return (
    <div
      data-pointer-id={pointer.id}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${pointer.position.x}px, ${pointer.position.y}px, 0px)`,
      }}
      className="absolute select-none font-mono cursor-grab active:cursor-grabbing z-30 group will-change-transform"
    >
      {/* Small Red Circular Cross Delete Button (Consistent with node delete button) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteFreePointer(pointer.id);
          setActivePointerId(null);
        }}
        className="absolute -top-1.5 -right-1.5 z-40 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-150 cursor-pointer"
        title="Delete pointer"
      >
        <X size={10} strokeWidth={3} />
      </button>

      {/* Box Styling: Head is White BG with Black Font; Other pointers are sleek Dark Charcoal */}
      <div
        className={`relative flex items-center justify-between px-3 py-1.5 rounded-md shadow-xl font-mono text-xs transition-all ${
          isHead
            ? 'bg-white text-black font-black border border-white'
            : 'bg-[#18181B] text-white border border-white/15 hover:border-white/35'
        } ${
          isControllerActive
            ? isHead
              ? 'ring-2 ring-emerald-400'
              : 'ring-2 ring-white border-white'
            : isConnectingFromSelf
            ? 'ring-2 ring-white border-white'
            : ''
        }`}
      >
        {/* Label */}
        {isEditing ? (
          <input
            type="text"
            value={pointer.label}
            onChange={(e) => updatePointerLabel(pointer.id, e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
            className={`w-14 font-bold text-xs border-b outline-none font-mono px-1 rounded-xs ${
              isHead
                ? 'bg-black/10 text-black border-black'
                : 'bg-black/50 text-white border-white'
            }`}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`font-black tracking-tight text-xs hover:underline cursor-text font-mono mr-2 ${
              isHead ? 'text-black' : 'text-white'
            }`}
            title="Click to edit pointer label"
          >
            {pointer.label}
          </button>
        )}

        {/* Drag Handle Arrow */}
        <div
          onMouseDown={handleArrowDragStart}
          title="Drag arrow to target a node or NULL"
          className={`pointer-handle w-5 h-5 rounded-sm flex items-center justify-center cursor-crosshair hover:scale-110 transition-transform ${
            isConnectingFromSelf
              ? isHead
                ? 'bg-black text-white ring-2 ring-black'
                : 'bg-white text-black ring-2 ring-white'
              : isHead
              ? 'bg-black/10 hover:bg-black/20 text-black'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <ArrowRight size={12} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
